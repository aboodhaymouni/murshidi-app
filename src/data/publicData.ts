export type PublicSourceStatus = 'live' | 'snapshot' | 'stale' | 'unavailable';

export interface PublicSource {
  id: string;
  titleAr: string;
  url: string;
  publishedAt: string | null;
  referencePeriod: string;
  checkedAt: string | null;
  status: PublicSourceStatus;
  error?: string;
}

export interface PublicMetric {
  id: string;
  labelAr: string;
  labelEn: string;
  value: number;
  unit: 'percent' | 'count';
  populationAr: string;
  populationEn: string;
  referencePeriod: string;
  sourceId: string;
}

export interface PublicProgram {
  id: string;
  university: string;
  universityCode: string;
  program: string;
  programCode: string;
  academicYear: string;
  creditFee: number | null;
  creditHours: number | null;
  minimumEligibility: number | null;
  sourceId: string;
  branch: string;
  regularFee?: number | null;
}

export interface PublicCutoff {
  id: string;
  university: string;
  universityCode: string;
  program: string;
  admissionYear: string;
  admissionChannel: string;
  certificateGroup: string | null;
  cutoff: number;
  sourceId: string;
}

export interface PublicData {
  schemaVersion: 1;
  metrics: PublicMetric[];
  sources: PublicSource[];
  programs: PublicProgram[];
  cutoffs: PublicCutoff[];
}

const trustedHosts = new Set([
  'dosweb.dos.gov.jo', 'dos.gov.jo', 'www.dos.gov.jo',
  'www.admhec.gov.jo', 'admhec.gov.jo',
  'www.petra.gov.jo', 'petra.gov.jo',
  'www.mohe.gov.jo', 'mohe.gov.jo', 'aabu.edu.jo',
]);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, max = 350): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function number(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
}

function nullableNumber(value: unknown, max: number) {
  return value === null || number(value, max);
}

function date(value: unknown) {
  return value === null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(value) && Number.isFinite(Date.parse(value)));
}

function sourceUrl(value: unknown) {
  if (!text(value, 2000)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && trustedHosts.has(url.hostname) && !url.username && !url.password && !url.port;
  } catch { return false; }
}

export function isPublicData(value: unknown): value is PublicData {
  if (!record(value) || value.schemaVersion !== 1) return false;
  const { sources, metrics, programs, cutoffs } = value;
  if (!Array.isArray(sources) || sources.length < 1 || sources.length > 30
    || !Array.isArray(metrics) || metrics.length > 100
    || !Array.isArray(programs) || programs.length > 2000
    || !Array.isArray(cutoffs) || cutoffs.length > 16000) return false;
  if (!sources.every(s => record(s) && text(s.id) && text(s.titleAr) && sourceUrl(s.url)
    && text(s.referencePeriod) && date(s.publishedAt) && date(s.checkedAt)
    && ['live', 'snapshot', 'stale', 'unavailable'].includes(String(s.status))
    && (s.error === undefined || text(s.error, 500)))) return false;
  const sourceIds = new Set(sources.map(s => s.id));
  if (sourceIds.size !== sources.length) return false;
  if (!metrics.every(m => record(m) && text(m.id) && text(m.labelAr) && text(m.labelEn)
    && text(m.populationAr) && text(m.populationEn) && text(m.referencePeriod)
    && (m.unit === 'count' || m.unit === 'percent')
    && number(m.value, m.unit === 'percent' ? 100 : 100_000_000)
    && sourceIds.has(m.sourceId))) return false;
  if (!programs.every(p => record(p) && text(p.id) && text(p.university) && text(p.universityCode)
    && text(p.program) && text(p.programCode) && /^\d{4}\/\d{4}$/.test(String(p.academicYear))
    && nullableNumber(p.creditFee, 10000) && nullableNumber(p.creditHours, 1000)
    && nullableNumber(p.minimumEligibility, 100) && text(p.branch)
    && sourceIds.has(p.sourceId))) return false;
  if (!cutoffs.every(c => record(c) && text(c.id, 500) && text(c.university) && text(c.universityCode)
    && text(c.program) && /^20\d{2}$/.test(String(c.admissionYear)) && text(c.admissionChannel)
    && (c.certificateGroup === null || text(c.certificateGroup))
    && number(c.cutoff, 100) && sourceIds.has(c.sourceId))) return false;
  return new Set(programs.map(p => p.id)).size === programs.length
    && new Set(cutoffs.map(c => c.id)).size === cutoffs.length
    && new Set(metrics.map(m => m.id)).size === metrics.length;
}

export function markCached(data: PublicData): PublicData {
  return { ...data, sources: data.sources.map(source => ({ ...source, status: source.status === 'unavailable' ? 'unavailable' : 'snapshot' })) };
}

export function sourceCanReplace(current: PublicSource, candidate: PublicSource): boolean {
  const rank = (source: PublicSource) => {
    const years = source.referencePeriod.match(/20\d{2}/g)?.map(Number) ?? [];
    const year = Math.max(0, ...years);
    const quarter = source.referencePeriod.match(/Q([1-4])/i)?.[1];
    return year * 10 + (quarter ? Number(quarter) : 0);
  };
  if (current.id !== candidate.id || rank(candidate) < rank(current)) return false;
  if (rank(candidate) === rank(current) && current.publishedAt && candidate.publishedAt
    && Date.parse(candidate.publishedAt) < Date.parse(current.publishedAt)) return false;
  return true;
}

export function mergeNewerCache(baseline: PublicData, cached: PublicData): PublicData {
  let merged = baseline;
  for (const source of baseline.sources) {
    const candidate = cached.sources.find(item => item.id === source.id);
    if (!candidate || !sourceCanReplace(source, candidate)
      || (Date.parse(candidate.checkedAt ?? '') || 0) < (Date.parse(source.checkedAt ?? '') || 0)) continue;
    merged = {
      ...merged,
      sources: merged.sources.map(item => item.id === source.id ? candidate : item),
      metrics: [...merged.metrics.filter(item => item.sourceId !== source.id), ...cached.metrics.filter(item => item.sourceId === source.id)],
      programs: [...merged.programs.filter(item => item.sourceId !== source.id), ...cached.programs.filter(item => item.sourceId === source.id)],
      cutoffs: [...merged.cutoffs.filter(item => item.sourceId !== source.id), ...cached.cutoffs.filter(item => item.sourceId === source.id)],
    };
  }
  return isPublicData(merged) ? merged : baseline;
}
