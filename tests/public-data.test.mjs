import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isPublicData, mergeNewerCache } from '../src/data/publicData.ts';
import { createOfficialSession, officialUrl } from '../server/official-http.ts';
import { academicYear, parseCutoffs, parsePrograms, parseTawjihi, publishedNumber } from '../server/official-parsers.ts';
import { createPublicDataStore } from '../server/public-data.ts';
import { publicDataPlugin } from '../server/vite-public-data.ts';

const snapshot = JSON.parse(readFileSync(new URL('../src/data/publicDataSnapshot.json', import.meta.url), 'utf8'));
const copy = () => structuredClone(snapshot);
const dosSource = () => snapshot.sources.find(source => source.id === 'dos-unemployment');
const update = (checkedAt, values = {}) => ({
  source: { ...dosSource(), checkedAt, status: 'live', ...values },
  metrics: snapshot.metrics.filter(metric => metric.sourceId === 'dos-unemployment'),
});

test('verified snapshot contains complete unique official offerings and historical rates with their actual years', () => {
  assert.ok(isPublicData(snapshot));
  const normalized = createPublicDataStore(snapshot, { adapters: {} }).get();
  assert.equal(snapshot.programs.length, 607);
  assert.equal(normalized.cutoffs.length, 2360);
  assert.ok(normalized.cutoffs.every(row => row.cutoff > 0));
  assert.equal(snapshot.programs.find(program => program.id === '100-20').creditFee, 47);
  assert.equal(snapshot.programs.find(program => program.id === '100-20').minimumEligibility, 75);
  assert.equal(Math.max(...snapshot.cutoffs.map(row => Number(row.admissionYear))), 2025);
  assert.ok(snapshot.programs.every(program => program.creditHours === null));
  assert.equal(snapshot.metrics.find(metric => metric.id === 'higher-education-graduates').value, 74718);
  assert.equal(snapshot.metrics.find(metric => metric.id === 'bachelor-graduates').referencePeriod, '2022/2023');
});

test('payload validation rejects invented source links, duplicate records and nonfinite percentages', () => {
  const unsafe = copy(); unsafe.sources[0].url = 'javascript:alert(1)';
  assert.equal(isPublicData(unsafe), false);
  const duplicate = copy(); duplicate.programs.push(duplicate.programs[0]);
  assert.equal(isPublicData(duplicate), false);
  const infinite = copy(); infinite.metrics[0].value = Infinity;
  assert.equal(isPublicData(infinite), false);
  const excessive = copy(); excessive.cutoffs[0].cutoff = 101;
  assert.equal(isPublicData(excessive), false);
});

test('source parser preserves unpublished rates as null and reads new year columns without assuming 2026 is published', () => {
  const html = '<table><tr><th>التخصص</th><th>2024</th><th>2025</th><th>2026</th></tr><tr><td>علم الحاسوب</td><td>0</td><td>96.5</td><td>−</td></tr></table>';
  const result = parseCutoffs(html, { code: '100', name: 'الجامعة الأردنية' });
  assert.deepEqual(result.years, ['2024', '2025', '2026']);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].admissionYear, '2025');
  assert.equal(result.rows[0].cutoff, 96.5);
  assert.equal(publishedNumber('−'), null);
  assert.equal(publishedNumber('٧٥.٥%'), 75.5);
  assert.throws(() => publishedNumber('101%'), /OUT_OF_RANGE/);
});

test('catalog parser rejects incomplete pagination and ignores unrelated years in page decorations', () => {
  const row = '<tr class="data-row"><td>الأردنية</td><td><button onclick="toggleDetail(this,\'detail_20_100\')">+</button>علم الحاسوب</td><td>75.00%</td><td>47 د.أ</td><td>47 د.أ</td><td>90 د.أ</td><td>120 د.أ</td></tr>';
  const html = `<span class="page-info">الصفحة 2 من 2</span><table>${row}</table>`;
  assert.equal(parsePrograms(html, '2026/2027').rows[0].id, '100-20');
  assert.throws(() => parsePrograms(html.replace('2 من 2', '1 من 2'), '2026/2027'), /INCOMPLETE/);
  assert.throws(() => academicYear('<footer>2025/2026</footer>'), /MISSING/);
  assert.equal(academicYear('<footer>2025/2026</footer><a href="Announcement1.aspx">القبول للعام الجامعي 2026-2027</a>'), '2026/2027');
});

test('tawjihi counts require the correct cohort and a pass rate consistent with actual attendance', () => {
  const html = '<p>الامتحان العام للعام 2026. عدد المشتركين في الامتحان العام (196050) مشتركا حضر منهم (178296)، وبلغ عدد الناجحين منهم (116366). نسبة النجاح في امتحان الثانوية العامة بلغت 65.3 بالمئة</p>';
  const metrics = parseTawjihi(html);
  assert.equal(metrics.find(metric => metric.id === 'tawjihi-passed').value, 116366);
  assert.equal(metrics.find(metric => metric.id === 'tawjihi-passed').labelEn, 'Tawjihi candidates who passed in 2026');
  assert.throws(() => parseTawjihi(html.replace('65.3', '85.3')), /TOTALS_INVALID/);
  assert.throws(() => parseTawjihi(html.replace('2026', '2025')), /SCHEMA_CHANGED/);
});

test('higher-education documents are honestly marked as year-labelled snapshots outside automatic refresh', () => {
  const store = createPublicDataStore(snapshot, { adapters: {} });
  for (const id of ['higher-education-enrollment', 'higher-education-graduates']) {
    const source = store.get().sources.find(item => item.id === id);
    assert.equal(source.status, 'snapshot');
    assert.match(source.error, /غير مشمول بالتحديث الآلي/);
  }
});

test('only fixed HTTPS official destinations and safe redirects can be fetched', async () => {
  assert.throws(() => officialUrl('http://www.admhec.gov.jo/Majors.aspx'), /REJECTED/);
  assert.throws(() => officialUrl('https://www.admhec.gov.jo.evil.example/Majors.aspx'), /REJECTED/);
  assert.throws(() => officialUrl('https://www.admhec.gov.jo/Majors.aspx?target=http://127.0.0.1'), /REJECTED/);
  let calls = 0;
  const client = createOfficialSession({ fetchImpl: async () => {
    calls++; return new Response(null, { status: 302, headers: { Location: 'https://127.0.0.1/private' } });
  } });
  await assert.rejects(client.get('https://www.admhec.gov.jo/Majors.aspx'), /REJECTED/);
  assert.equal(calls, 1);
});

test('oversized chunked HTML is rejected even when no Content-Length is supplied', async () => {
  const client = createOfficialSession({ maxBytes: 64, fetchImpl: async () => new Response('x'.repeat(65), { headers: { 'content-type': 'text/html' } }) });
  await assert.rejects(client.get('https://www.admhec.gov.jo/Majors.aspx'), /TOO_LARGE/);
});

test('failed or malformed refresh retains last-good values and last successful checkedAt', async () => {
  const failed = createPublicDataStore(snapshot, { adapters: { 'dos-unemployment': async () => { throw Error('offline'); } } });
  const result = await failed.refresh();
  assert.equal(result.sources[0].status, 'stale');
  assert.equal(result.sources[0].checkedAt, dosSource().checkedAt);
  assert.deepEqual(result.metrics, createPublicDataStore(snapshot, { adapters: {} }).get().metrics);
  const invalid = createPublicDataStore(snapshot, { adapters: { 'dos-unemployment': async (_, checkedAt) => ({ ...update(checkedAt), metrics: [{ ...snapshot.metrics[0], value: NaN }] }) } });
  assert.equal((await invalid.refresh()).sources[0].status, 'stale');
});

test('a stale source or a later cache timestamp cannot roll Q2 2026 back to Q1 2026', async () => {
  const store = createPublicDataStore(snapshot, { adapters: { 'dos-unemployment': async (_, checkedAt) => update(checkedAt, { referencePeriod: 'Q1 2026', publishedAt: '2026-06-01T00:00:00Z' }) } });
  const result = await store.refresh();
  assert.equal(result.sources[0].referencePeriod, 'Q2 2026');
  assert.equal(result.sources[0].checkedAt, dosSource().checkedAt);
  assert.equal(result.sources[0].status, 'stale');
  const oldCache = copy();
  oldCache.sources[0] = { ...oldCache.sources[0], referencePeriod: 'Q1 2026', checkedAt: '2026-09-11T00:00:00Z' };
  assert.equal(mergeNewerCache(snapshot, oldCache).sources[0].referencePeriod, 'Q2 2026');
});

test('concurrent requests share one refresh and a save failure does not discard verified in-memory data', async () => {
  let finish;
  let calls = 0;
  const gate = new Promise(resolve => { finish = resolve; });
  const store = createPublicDataStore(snapshot, {
    adapters: { 'dos-unemployment': async (_, checkedAt) => { calls++; await gate; return update(checkedAt); } },
    save: async () => { throw Error('disk full'); },
  });
  const first = store.refresh();
  const second = store.refresh();
  assert.equal(first, second);
  finish();
  assert.equal((await first).sources[0].status, 'live');
  assert.equal(store.get().sources[0].status, 'live');
  assert.equal(calls, 1);
});

test('malformed request targets are handled as JSON 400, without rejecting the middleware promise', async () => {
  let middleware;
  const plugin = publicDataPlugin();
  plugin.configureServer({ middlewares: { use(handler) { middleware = handler; } } });
  const headers = {};
  let body;
  const response = { setHeader(key, value) { headers[key] = value; }, end(value) { body = value; } };
  await middleware({ url: 'http://[', method: 'GET', headers: {} }, response, () => {});
  assert.equal(response.statusCode, 400);
  assert.equal(JSON.parse(body).error.code, 'INVALID_URL');
  assert.match(headers['Content-Type'], /application\/json/);
});

test('the packaged Android origin can read an explicitly configured HTTPS public-data service', async () => {
  let middleware;
  const plugin = publicDataPlugin();
  plugin.configureServer({ middlewares: { use(handler) { middleware = handler; } } });
  const headers = {};
  let body;
  const response = { setHeader(key, value) { headers[key] = value; }, end(value) { body = value; } };
  await middleware({ url: '/api/public-data', method: 'GET', headers: { origin: 'https://localhost', host: 'data.example.jo' } }, response, () => {});
  assert.equal(response.statusCode, undefined);
  assert.equal(headers['Access-Control-Allow-Origin'], 'https://localhost');
  assert.equal(headers.Vary, 'Origin');
  assert.ok(isPublicData(JSON.parse(body)));
});
