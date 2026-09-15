import { createHash } from 'node:crypto';
import type { PublicCutoff, PublicMetric, PublicProgram } from '../src/data/publicData.ts';

export function plainText(value: string): string {
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(?:x([a-f\d]+)|(\d+));/gi, (_, hex, dec) => {
      const code = Number.parseInt(hex ?? dec, hex ? 16 : 10);
      return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(/&(?:nbsp|amp|quot|apos|lt|gt);/g, entity => ({ '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' })[entity] ?? '')
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[\u200e\u200f\u061c]/g, '')
    .replace(/\s+/g, ' ').trim();
}

function attrs(tag: string): Record<string, string> {
  return Object.fromEntries([...tag.matchAll(/([\w$-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(match => [match[1].toLowerCase(), plainText(match[2] ?? match[3])]));
}

export function hiddenForm(html: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const match of html.matchAll(/<input\b[^>]*>/gi)) {
    const input = attrs(match[0]);
    if (input.type === 'hidden' && input.name && input.name !== '__proto__') fields[input.name] = input.value ?? '';
  }
  if (!fields.__VIEWSTATE || !fields.__EVENTVALIDATION) throw new Error('FORM_SCHEMA_CHANGED');
  return fields;
}

export function universityOptions(html: string): { code: string; name: string }[] {
  const select = html.match(/<select\b[^>]*id="ctl00_MainContentPlaceHolder_ddlUniversity"[^>]*>([\s\S]*?)<\/select>/i)?.[1];
  if (!select) throw new Error('UNIVERSITY_SCHEMA_CHANGED');
  const result = [...select.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)]
    .map(match => ({ code: attrs(match[1]).value, name: plainText(match[2]) }))
    .filter(option => option.code && option.code !== '0');
  if (result.length < 5 || result.length > 60 || result.some(option => !/^\d{2,5}$/.test(option.code))) throw new Error('UNIVERSITY_SCHEMA_CHANGED');
  return result;
}

export function publishedNumber(text: string, max = 100): number | null {
  const value = plainText(text).trim();
  if (/^(?:-|−|–|—|غير متوفر|لا يوجد)?$/.test(value)) return null;
  if (!/^\d+(?:\.\d+)?(?:\s*%|\s*د\.أ)?$/.test(value)) throw new Error('NUMBER_SCHEMA_CHANGED');
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number) || number < 0 || number > max) throw new Error('NUMBER_OUT_OF_RANGE');
  return number;
}

export function parseCutoffs(html: string, university: { code: string; name: string }): { rows: PublicCutoff[]; years: string[]; offerings: number } {
  const table = html.match(/<table\b[^>]*>([\s\S]*?)<\/table>/i)?.[1];
  if (!table) throw new Error('CUTOFF_TABLE_MISSING');
  const header = [...table.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map(match => plainText(match[1]));
  const years = header.slice(1);
  if (years.length < 1 || years.length > 10 || years.some(year => !/^20\d{2}$/.test(year)) || new Set(years).size !== years.length) throw new Error('CUTOFF_YEAR_SCHEMA_CHANGED');
  const rows: PublicCutoff[] = [];
  let offerings = 0;
  for (const match of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell => plainText(cell[1]));
    if (!cells.length) continue;
    if (cells.length !== years.length + 1 || !cells[0]) throw new Error('CUTOFF_ROW_SCHEMA_CHANGED');
    offerings++;
    const program = cells[0];
    const programKey = createHash('sha256').update(program).digest('hex').slice(0, 16);
    years.forEach((year, index) => {
      const cutoff = publishedNumber(cells[index + 1]);
      // The official table uses a literal 0 in a few cells where no competitive
      // minimum was published. A zero cannot be an admission threshold, so keep
      // it out of the historical-rate dataset just like the site's dash marker.
      if (cutoff !== null && cutoff !== 0) rows.push({
        id: `${university.code}-${programKey}-${year}`,
        university: university.name, universityCode: university.code, program,
        admissionYear: year, admissionChannel: 'التنافسي — سنوات سابقة', certificateGroup: 'ثانوية أردنية', cutoff, sourceId: 'admhec-cutoffs',
      });
    });
  }
  return { rows, years, offerings };
}

export function academicYear(html: string): string {
  const years = [...html.matchAll(/<a\b[^>]*href=["']Announcement\d+\.aspx["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(link => plainText(link[1]).match(/للعام الجامعي\s+(20\d{2})\s*[-/]\s*(20\d{2})/))
    .filter(match => match && Number(match[2]) === Number(match[1]) + 1)
    .map(match => `${match![1]}/${match![2]}`);
  if (!years.length || new Set(years).size !== 1) throw new Error('ACADEMIC_YEAR_MISSING');
  return years[0];
}

export function parsePrograms(html: string, year: string): { rows: PublicProgram[]; page: number; totalPages: number } {
  const match = html.match(/class="page-info">\s*الصفحة\s+(\d+)\s+من\s+(\d+)/);
  if (!match) throw new Error('PROGRAM_PAGINATION_MISSING');
  const page = Number(match[1]);
  const totalPages = Number(match[2]);
  if (page < 1 || totalPages < page || totalPages > 60) throw new Error('PROGRAM_PAGINATION_INVALID');
  const rows: PublicProgram[] = [];
  for (const match of html.matchAll(/<tr\b[^>]*class="data-row"[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell => plainText(cell[1]).replace(/^\+\s*/, ''));
    const id = match[1].match(/detail_(\d+)_(\d+)/);
    if (!id || cells.length !== 7 || !cells[0] || !cells[1]) throw new Error('PROGRAM_ROW_SCHEMA_CHANGED');
    const fee = publishedNumber(cells[3], 10000);
    rows.push({
      id: `${id[2]}-${id[1]}`, universityCode: id[2], programCode: id[1],
      university: cells[0], program: cells[1], academicYear: year,
      // AboutPage.aspx defines the Majors section's fees as رسوم الساعات.
      creditFee: fee, regularFee: fee, creditHours: null,
      minimumEligibility: publishedNumber(cells[2]), branch: 'علمي', sourceId: 'admhec-programs',
    });
  }
  if (!rows.length || rows.length > 30 || (page !== totalPages && rows.length !== 30)) throw new Error('PROGRAM_PAGE_INCOMPLETE');
  return { rows, page, totalPages };
}

export function parseTawjihi(html: string): PublicMetric[] {
  const text = plainText(html);
  const values = text.match(/عدد المشتركين في الامتحان العام\s*\(?([\d,]+)\)?\s*مشتركا?\s*حضر منهم\s*\(?([\d,]+)\)?[،\s]*وبلغ عدد الناجحين منهم\s*\(?([\d,]+)\)?/);
  const rate = text.match(/نسبة النجاح في امتحان الثانوية العامة بلغت\s*(\d+(?:\.\d+)?)\s*بالمئة/);
  if (!values || !rate || !/الامتحان العام للعام\s*2026/.test(text)) throw new Error('TAWJIHI_SCHEMA_CHANGED');
  const [registered, attended, passed] = values.slice(1).map(value => Number(value.replaceAll(',', '')));
  const passRate = Number(rate[1]);
  if (!(registered >= attended && attended >= passed && passed > 0 && registered < 1_000_000)
    || Math.abs((passed / attended) * 100 - passRate) > 0.15) throw new Error('TAWJIHI_TOTALS_INVALID');
  return [
    ['registered', 'المسجلون في توجيهي 2026', 'Tawjihi registrations in 2026', registered, 'count'],
    ['attended', 'المتقدمون لامتحان توجيهي 2026', 'Tawjihi exam attendees in 2026', attended, 'count'],
    ['passed', 'الناجحون في توجيهي 2026', 'Tawjihi candidates who passed in 2026', passed, 'count'],
    ['pass-rate', 'نسبة النجاح في توجيهي 2026', 'Tawjihi pass rate in 2026', passRate, 'percent'],
  ].map(([id, labelAr, labelEn, value, unit]) => ({
    id: `tawjihi-${id}`, labelAr: String(labelAr), labelEn: String(labelEn), value: Number(value), unit: unit as 'count' | 'percent',
    populationAr: 'امتحان الثانوية العامة العام: النظاميون والدراسة الخاصة',
    populationEn: 'General secondary exam: regular and private-study candidates',
    referencePeriod: '2026', sourceId: 'tawjihi-2026',
  }));
}

export function latestDosArticle(html: string): string {
  for (const heading of html.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)) {
    if (!/unemployment/i.test(plainText(heading[1]))) continue;
    const link = heading[1].match(/<a\b[^>]*href=["']([^"']+)["']/i)?.[1];
    if (link) {
      const url = new URL(plainText(link), 'https://dosweb.dos.gov.jo');
      if (url.hostname === 'dosweb.dos.gov.jo' && /^\/unemp_[\d]+\/$/.test(url.pathname)) return url.href;
    }
  }
  throw new Error('DOS_LATEST_ARTICLE_NOT_FOUND');
}

export function parseDos(html: string): { metrics: PublicMetric[]; publishedAt: string; referencePeriod: string } {
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => attrs(match[0]));
  const description = meta.find(item => item.property === 'og:description')?.content ?? '';
  const publication = meta.find(item => item.property === 'article:published_time')?.content;
  const total = description.match(/total population in Jordan\s*\(Jordanians and Non-Jordanians\)[^.]*?reach\s+(\d+(?:\.\d+)?)%\s+in\s+(Q[1-4])\s+(20\d{2})/i);
  const jordanian = description.match(/UERATE among Jordanian males and females[\s\S]*?in\s+(Q[1-4])\s+(20\d{2})\s+to reach\s+(\d+(?:\.\d+)?)%/i);
  if (!total || !jordanian || !publication || !Number.isFinite(Date.parse(publication))
    || total[2] !== jordanian[1] || total[3] !== jordanian[2]) throw new Error('DOS_SCHEMA_CHANGED');
  const referencePeriod = `${total[2]} ${total[3]}`;
  const allRate = publishedNumber(total[1]);
  const jordanianRate = publishedNumber(jordanian[3]);
  if (allRate === null || jordanianRate === null) throw new Error('DOS_RATE_MISSING');
  return {
    publishedAt: new Date(publication).toISOString(), referencePeriod,
    metrics: [
      { id: 'total-unemployment-rate', labelAr: 'معدل البطالة لإجمالي السكان', labelEn: 'Total population unemployment rate',
        value: allRate, unit: 'percent', populationAr: 'القوى العاملة في الأردن: الأردنيون وغير الأردنيين', populationEn: 'Jordanian and non-Jordanian labour force in Jordan', referencePeriod, sourceId: 'dos-unemployment' },
      { id: 'jordanian-unemployment-rate', labelAr: 'معدل البطالة بين الأردنيين', labelEn: 'Jordanian unemployment rate',
        value: jordanianRate, unit: 'percent', populationAr: 'القوى العاملة الأردنية، ذكورًا وإناثًا', populationEn: 'Jordanian male and female labour force', referencePeriod, sourceId: 'dos-unemployment' },
    ],
  };
}
