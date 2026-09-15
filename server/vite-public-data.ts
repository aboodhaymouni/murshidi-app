import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { resolve } from 'node:path';
import { loadPublicDataStore } from './public-data.ts';

export function publicDataPlugin(): Plugin {
  const nativeOrigins = new Set(['https://localhost']);
  let root = process.cwd();
  let store: ReturnType<typeof loadPublicDataStore> | null = null;
  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    let url: URL;
    try { url = new URL(req.url ?? '/', 'http://localhost'); }
    catch { res.statusCode = 400; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify({ error: { code: 'INVALID_URL', message: 'Invalid request URL.' } })); return; }
    if (url.pathname !== '/api/public-data') return next();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const fail = (status: number, code: string) => { res.statusCode = status; res.end(JSON.stringify({ error: { code, message: 'Public data request could not be completed.' } })); };
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return fail(405, 'METHOD_NOT_ALLOWED'); }
    if ([...url.searchParams.keys()].some(key => key !== 'refresh') || (url.searchParams.has('refresh') && url.searchParams.get('refresh') !== '1') || url.searchParams.getAll('refresh').length > 1) return fail(400, 'INVALID_QUERY');
    if (req.headers.origin) {
      try {
        const origin = new URL(req.headers.origin);
        const sameOrigin = origin.host === req.headers.host;
        if (!sameOrigin && !nativeOrigins.has(origin.origin)) return fail(403, 'ORIGIN_REJECTED');
        if (!sameOrigin) { res.setHeader('Access-Control-Allow-Origin', origin.origin); res.setHeader('Vary', 'Origin'); }
      }
      catch { return fail(403, 'ORIGIN_REJECTED'); }
    }
    try {
      store ??= loadPublicDataStore(root);
      const current = await store;
      const data = url.searchParams.get('refresh') === '1' ? await current.refresh() : current.get();
      res.end(JSON.stringify(data));
    } catch {
      store = null;
      fail(503, 'PUBLIC_DATA_UNAVAILABLE');
    }
  };
  return {
    name: 'murshidi-public-data',
    configResolved(config) { root = config.root; },
    configureServer(server) {
      server.middlewares.use(middleware);
      server.watcher?.on('change', path => {
        if (resolve(path) === resolve(root, 'src/data/publicDataSnapshot.json')) store = null;
      });
    },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}
