const allowedPaths = new Map([
  ['www.admhec.gov.jo', new Set(['/Majors.aspx', '/LeastAverages.aspx'])],
  ['admhec.gov.jo', new Set(['/Majors.aspx', '/LeastAverages.aspx'])],
]);

export function officialUrl(input: string): URL {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || input.length > 2000) {
    throw new Error('OFFICIAL_URL_REJECTED');
  }
  const paths = allowedPaths.get(url.hostname);
  if (paths) {
    if (!paths.has(url.pathname) || url.search) throw new Error('OFFICIAL_URL_REJECTED');
  } else if (url.hostname === 'dosweb.dos.gov.jo') {
    if (/wp-json|wp-admin|wp-login|xmlrpc|\.php/i.test(url.pathname) || url.search) throw new Error('OFFICIAL_URL_REJECTED');
  } else if (['www.petra.gov.jo', 'petra.gov.jo'].includes(url.hostname)) {
    if (!decodeURIComponent(url.pathname).startsWith('/ar/news/') || url.search) throw new Error('OFFICIAL_URL_REJECTED');
  } else {
    throw new Error('OFFICIAL_URL_REJECTED');
  }
  return url;
}

export interface OfficialPage { html: string; url: string }
export interface OfficialSession {
  get(url: string): Promise<OfficialPage>;
  post(url: string, form: Record<string, string>): Promise<OfficialPage>;
}

export function createOfficialSession(options: {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxBytes?: number;
  signal?: AbortSignal;
} = {}): OfficialSession {
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxBytes = options.maxBytes ?? 2_500_000;
  const cookies = new Map<string, Map<string, string>>();

  async function request(input: string, form?: Record<string, string>, redirects = 0): Promise<OfficialPage> {
    const url = officialUrl(input);
    if (redirects > 3) throw new Error('TOO_MANY_REDIRECTS');
    const timeout = AbortSignal.timeout(options.timeoutMs ?? 12000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    const jar = cookies.get(url.hostname) ?? new Map<string, string>();
    const body = form ? new URLSearchParams(form).toString() : undefined;
    if (body && Buffer.byteLength(body) > maxBytes) throw new Error('FORM_TOO_LARGE');
    const response = await fetchImpl(url, {
      method: body ? 'POST' : 'GET',
      redirect: 'manual',
      signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Murshidi-Public-Data/1.0',
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : {}),
        ...(jar.size ? { Cookie: [...jar].map(([key, value]) => `${key}=${value}`).join('; ') } : {}),
      },
      body,
    });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';', 1)[0];
      const index = pair.indexOf('=');
      if (index > 0 && pair.length < 4096) jar.set(pair.slice(0, index), pair.slice(index + 1));
    }
    cookies.set(url.hostname, jar);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('INVALID_REDIRECT');
      const next = officialUrl(new URL(location, url).href);
      if (next.hostname !== url.hostname) throw new Error('CROSS_ORIGIN_REDIRECT_REJECTED');
      return request(next.href, [307, 308].includes(response.status) ? form : undefined, redirects + 1);
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error('OFFICIAL_HTTP_ERROR'); }
    if (!/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type') ?? '')) {
      await response.body?.cancel(); throw new Error('UNEXPECTED_CONTENT_TYPE');
    }
    if (Number(response.headers.get('content-length')) > maxBytes) {
      await response.body?.cancel(); throw new Error('RESPONSE_TOO_LARGE');
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error('EMPTY_RESPONSE');
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) { await reader.cancel(); throw new Error('RESPONSE_TOO_LARGE'); }
      chunks.push(value);
    }
    const html = Buffer.concat(chunks).toString('utf8');
    if (html.length < 30) throw new Error('EMPTY_RESPONSE');
    return { html, url: url.href };
  }

  return { get: url => request(url), post: (url, form) => request(url, form) };
}
