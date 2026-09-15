import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { isPublicData, markCached, mergeNewerCache, sourceCanReplace, type PublicData, type PublicSource } from '../src/data/publicData.ts';
import { createOfficialSession, type OfficialSession } from './official-http.ts';
import { academicYear, hiddenForm, latestDosArticle, parseCutoffs, parseDos, parsePrograms, parseTawjihi, universityOptions } from './official-parsers.ts';

const PROGRAM_URL = 'https://www.admhec.gov.jo/Majors.aspx';
const CUTOFF_URL = 'https://www.admhec.gov.jo/LeastAverages.aspx';
const DOS_ARCHIVE = 'https://dosweb.dos.gov.jo/category/news/unemployment-rate/';
const SNAPSHOT_ONLY_SOURCES = new Set(['higher-education-enrollment', 'higher-education-graduates']);

export interface SourceUpdate {
  source: PublicSource;
  metrics?: PublicData['metrics'];
  programs?: PublicData['programs'];
  cutoffs?: PublicData['cutoffs'];
}
export type SourceAdapter = (baseline: PublicData, checkedAt: string) => Promise<SourceUpdate>;

function normalizeBundledData(input: PublicData): PublicData {
  return {
    ...input,
    metrics: input.metrics.map(metric => metric.id === 'tawjihi-passed'
      ? { ...metric, labelEn: 'Tawjihi candidates who passed in 2026' }
      : metric),
    // Three official cells currently contain 0. They mean that a rate was not
    // published, because every valid competitive minimum is above zero.
    cutoffs: input.cutoffs.filter(cutoff => cutoff.cutoff > 0),
    sources: input.sources.map(source => SNAPSHOT_ONLY_SOURCES.has(source.id) ? {
      ...source,
      status: 'snapshot',
      error: 'لقطة رسمية بسنة البيانات المعروضة؛ هذا المصدر غير مشمول بالتحديث الآلي المحافظ حاليًا.',
    } : source),
  };
}

function updatedSource(baseline: PublicData, id: string, checkedAt: string, fields: Partial<PublicSource> = {}): PublicSource {
  const source = baseline.sources.find(item => item.id === id);
  if (!source) throw new Error('SOURCE_NOT_CONFIGURED');
  return { ...source, ...fields, checkedAt, status: 'live', error: undefined };
}

function programForm(html: string): Record<string, string> {
  return { ...hiddenForm(html),
    'ctl00$MainContentPlaceHolder$ddlUniversity': '0',
    'ctl00$MainContentPlaceHolder$ddlBranch': '2',
    'ctl00$MainContentPlaceHolder$ddlSex': '0',
    'ctl00$MainContentPlaceHolder$ddlFacGroup': '-1',
  };
}

export async function refreshPrograms(baseline: PublicData, checkedAt: string, session: OfficialSession): Promise<SourceUpdate> {
  let page = await session.get(PROGRAM_URL);
  const year = academicYear(page.html);
  let form = { ...programForm(page.html), 'ctl00$MainContentPlaceHolder$btnSearch': '🔍 عرض النتائج' } as Record<string, string>;
  const programs: PublicData['programs'] = [];
  let expectedPages: number | null = null;
  for (let index = 1; index <= 60; index++) {
    page = await session.post(PROGRAM_URL, form);
    const result = parsePrograms(page.html, year);
    if (result.page !== index || (expectedPages !== null && expectedPages !== result.totalPages)) throw new Error('PROGRAM_PAGINATION_CHANGED');
    expectedPages = result.totalPages;
    programs.push(...result.rows);
    if (result.page === result.totalPages) break;
    form = { ...programForm(page.html), 'ctl00$MainContentPlaceHolder$btnNext': 'التالي ' };
  }
  if (programs.length < Math.max(100, baseline.programs.length * 0.75) || new Set(programs.map(item => item.id)).size !== programs.length) {
    throw new Error('PROGRAM_SET_INCOMPLETE');
  }
  return { source: updatedSource(baseline, 'admhec-programs', checkedAt, { referencePeriod: year }), programs };
}

export async function refreshCutoffs(baseline: PublicData, checkedAt: string, session: OfficialSession): Promise<SourceUpdate> {
  const initial = await session.get(CUTOFF_URL);
  const universities = universityOptions(initial.html);
  const form = hiddenForm(initial.html);
  const previousCodes = new Set(baseline.cutoffs.map(item => item.universityCode));
  const cutoffs: PublicData['cutoffs'] = [];
  const yearSets: string[][] = [];
  const offeringKeys = new Set<string>();
  // Each public search is read-only; sequential requests preserve one ASP.NET session.
  for (const university of universities) {
    const page = await session.post(CUTOFF_URL, { ...form,
      'ctl00$MainContentPlaceHolder$ddlCertType': '1',
      'ctl00$MainContentPlaceHolder$ddlUniversity': university.code,
      'ctl00$MainContentPlaceHolder$btnSearch': 'عرض الحدود الدنيا',
    });
    if (!/<table\b/i.test(page.html) && !previousCodes.has(university.code)
      && /<div class="grid-wrap">\s*<div>\s*<\/div>\s*<\/div>/.test(page.html)) continue;
    const parsed = parseCutoffs(page.html, university);
    if (parsed.years.length) yearSets.push(parsed.years);
    cutoffs.push(...parsed.rows);
    parsed.rows.forEach(row => offeringKeys.add(`${row.universityCode}:${row.program}`));
  }
  const years = yearSets[0];
  if (!years || yearSets.some(set => set.join(',') !== years.join(',')) || cutoffs.length < baseline.cutoffs.length * 0.7
    || offeringKeys.size < 100 || new Set(cutoffs.map(item => item.id)).size !== cutoffs.length) throw new Error('CUTOFF_SET_INCOMPLETE');
  const latest = Math.max(...years.map(Number));
  return { source: updatedSource(baseline, 'admhec-cutoffs', checkedAt, {
    referencePeriod: `${Math.min(...years.map(Number))}–${latest}؛ أحدث حد منشور ${latest}`,
  }), cutoffs };
}

export function officialAdapters(): Record<string, SourceAdapter> {
  function session() { return createOfficialSession({ timeoutMs: 25000, signal: AbortSignal.timeout(90000) }); }
  return {
    'admhec-programs': (data, checkedAt) => refreshPrograms(data, checkedAt, session()),
    'admhec-cutoffs': (data, checkedAt) => refreshCutoffs(data, checkedAt, session()),
    'dos-unemployment': async (data, checkedAt) => {
      const client = session();
      const archive = await client.get(DOS_ARCHIVE);
      const url = latestDosArticle(archive.html);
      const article = await client.get(url);
      const parsed = parseDos(article.html);
      return { source: updatedSource(data, 'dos-unemployment', checkedAt, { url, publishedAt: parsed.publishedAt, referencePeriod: parsed.referencePeriod }), metrics: parsed.metrics };
    },
    'tawjihi-2026': async (data, checkedAt) => {
      const url = data.sources.find(source => source.id === 'tawjihi-2026')!.url;
      const page = await session().get(url);
      return { source: updatedSource(data, 'tawjihi-2026', checkedAt), metrics: parseTawjihi(page.html) };
    },
  };
}

function mergeUpdate(data: PublicData, id: string, update: SourceUpdate): PublicData {
  const previousSource = data.sources.find(source => source.id === id);
  if (!previousSource || !sourceCanReplace(previousSource, update.source)) throw new Error('OLDER_SOURCE_PERIOD');
  if (update.source.id !== id || (update.metrics && update.metrics.some(item => item.sourceId !== id))
    || (update.programs && update.programs.some(item => item.sourceId !== id))
    || (update.cutoffs && update.cutoffs.some(item => item.sourceId !== id))) throw new Error('SOURCE_SCOPE_CHANGED');
  const result: PublicData = {
    ...data, sources: data.sources.map(source => source.id === id ? update.source : source),
    metrics: update.metrics ? [...data.metrics.filter(metric => metric.sourceId !== id), ...update.metrics] : data.metrics,
    programs: update.programs ?? data.programs, cutoffs: update.cutoffs ?? data.cutoffs,
  };
  if (!isPublicData(result)) throw new Error('INVALID_SOURCE_PAYLOAD');
  return result;
}

export function createPublicDataStore(snapshot: PublicData, options: {
  adapters?: Record<string, SourceAdapter>;
  now?: () => Date;
  save?: (data: PublicData) => Promise<void>;
  minimumRefreshIntervalMs?: number;
} = {}) {
  if (!isPublicData(snapshot)) throw new Error('INVALID_INITIAL_DATA');
  let data = markCached(normalizeBundledData(snapshot));
  let inFlight: Promise<PublicData> | null = null;
  let attemptedAt = 0;
  const now = options.now ?? (() => new Date());
  const adapters = options.adapters ?? officialAdapters();
  return {
    get: () => data,
    refresh(): Promise<PublicData> {
      if (inFlight) return inFlight;
      const instant = now();
      if (attemptedAt && instant.getTime() - attemptedAt < (options.minimumRefreshIntervalMs ?? 15000)) return Promise.resolve(data);
      attemptedAt = instant.getTime();
      const checkedAt = instant.toISOString();
      inFlight = (async () => {
        const entries = Object.entries(adapters);
        const results = await Promise.allSettled(entries.map(([, adapter]) => adapter(data, checkedAt)));
        let next = data;
        for (let index = 0; index < entries.length; index++) {
          const [id] = entries[index];
          const result = results[index];
          try {
            if (result.status !== 'fulfilled') throw new Error('SOURCE_UNAVAILABLE');
            next = mergeUpdate(next, id, result.value);
          } catch {
            next = { ...next, sources: next.sources.map(source => source.id === id ? {
              ...source, status: source.checkedAt ? 'stale' : 'unavailable',
              error: 'تعذّر التحقق من المصدر؛ حُفظت آخر أرقام موثقة بسنة بياناتها.',
            } : source) };
          }
        }
        data = next;
        try { await options.save?.(data); } catch { /* In-memory last-good data remains usable. */ }
        return data;
      })().finally(() => { inFlight = null; });
      return inFlight;
    },
  };
}

export async function loadPublicDataStore(root: string) {
  const snapshotPath = resolve(root, 'src/data/publicDataSnapshot.json');
  const cachePath = resolve(root, 'server/cache/public-data.json');
  const bundled: unknown = JSON.parse(await readFile(snapshotPath, 'utf8'));
  if (!isPublicData(bundled)) throw new Error('INVALID_BUNDLED_DATA');
  let initial = bundled;
  try {
    if ((await stat(cachePath)).size <= 4_000_000) {
      const cached: unknown = JSON.parse(await readFile(cachePath, 'utf8'));
      if (isPublicData(cached)) initial = mergeNewerCache(bundled, cached);
    }
  } catch { /* First run or rejected cache: use the verified bundled snapshot. */ }
  return createPublicDataStore(initial, { save: async data => {
    await mkdir(dirname(cachePath), { recursive: true });
    const temporary = `${cachePath}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(data), 'utf8');
    await rename(temporary, cachePath);
  } });
}
