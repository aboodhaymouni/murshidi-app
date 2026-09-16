// One numeral system for the whole app.
//
// Jordanian government publications — the Ministry's own admission policy, the
// Department of Statistics releases, the unified-admission tables — set their
// figures in Latin digits inside Arabic text. The app follows that convention,
// so a student comparing an on-screen number against the official PDF sees the
// same glyphs, and so no screen can end up mixing ١٬٢٤٧ with +23% in one row.
//
// Every number a user reads goes through here. Do not call toLocaleString with
// an 'ar-EG' locale anywhere else in the codebase.

const GROUPING_LOCALE = 'en-US';

/** A whole number with thousands separators: 1,247 */
export function num(value: number | null | undefined, fallback = '—'): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return value.toLocaleString(GROUPING_LOCALE);
}

/** A number with a fixed number of decimals: 16.1 */
export function dec(value: number | null | undefined, places = 1, fallback = '—'): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return value.toLocaleString(GROUPING_LOCALE, {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });
}

/** A percentage, sign-free: 16.1% */
export function pct(value: number | null | undefined, places = 1, fallback = '—'): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return `${dec(value, places)}%`;
}

/** A signed percentage for deltas: +23% / −4% (true minus sign, not a hyphen). */
export function signedPct(value: number | null | undefined, places = 0, fallback = '—'): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const sign = value > 0 ? '+' : value < 0 ? '\u2212' : '';
  return `${sign}${dec(Math.abs(value), places)}%`;
}

/** An amount in Jordanian dinars, with the unit in the reader's language. */
export function jod(value: number | null | undefined, lang: 'ar' | 'en', fallback = '—'): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return lang === 'ar' ? `${num(value)} د.أ` : `${num(value)} JOD`;
}

/** A date, always Gregorian with Latin digits: 2026-09-16 */
export function isoDate(value: string | Date | null | undefined, fallback = '—'): string {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
