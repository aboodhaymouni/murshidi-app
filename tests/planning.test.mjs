import test from 'node:test';
import assert from 'node:assert/strict';
import { studyPlan, previousCutoff, defaultPrograms } from '../src/lib/planning.ts';
import snapshot from '../src/data/publicDataSnapshot.json' with { type: 'json' };

test('default comparison selects three actual computing programs from the public catalog', () => {
  const selected = defaultPrograms(snapshot.programs);
  assert.equal(selected.length, 3);
  assert.equal(new Set(selected.map(p => p.id)).size, 3);
  assert.ok(selected.every(p => /علم الحاسوب|علوم الحاسوب/.test(p.program)));
});

const example = { creditFee: 47, credits: 132, years: 4, annualOtherFees: 300, monthlyLiving: 100, annualBudget: 4000 };
test('official fee and explicit assumptions determine cost; budget changes affordability', () => {
  assert.deepEqual(studyPlan(example), { tuition: 6204, other: 6000, total: 12204, annual: 3051, gap: 0, affordable: true });
  assert.equal(studyPlan({ ...example, annualBudget: 2000 }).gap, 1051);
  assert.equal(studyPlan({ ...example, annualBudget: 2000 }).affordable, false);
  assert.equal(studyPlan({ ...example, annualBudget: 3051 }).affordable, true);
});
test('empty, nonfinite, negative and out-of-range assumptions cannot produce a plausible result', () => {
  for (const value of [NaN, Infinity, -1, 10001]) assert.equal(studyPlan({ ...example, creditFee: value }), null);
  assert.equal(studyPlan({ ...example, years: 0 }), null);
  assert.equal(studyPlan({ ...example, credits: 0 }), null);
  assert.ok(studyPlan({ ...example, creditFee: 0, annualBudget: 0 }));
});
test('cutoff matching stays within university and program, keeping the newest published year', () => {
  const program = { id: 'cs', university: 'الأردنية', universityCode: '100', program: 'علم الحاسوب', academicYear: '2026/2027', creditFee: 47, creditHours: null, minimumEligibility: 65, sourceId: 'p' };
  const row = { id: 'x', university: 'الجامعة الأردنيــة', universityCode: '100', program: 'علم الحاسوب', admissionYear: '2024', admissionChannel: 'competitive', certificateGroup: 'Jordanian', cutoff: 95, sourceId: 'c' };
  const rows = [row, { ...row, admissionYear: '2025', cutoff: 96.5 }, { ...row, universityCode: '200', admissionYear: '2026', cutoff: 99 }];
  assert.equal(previousCutoff(program, rows).cutoff, 96.5);
  assert.equal(previousCutoff({ ...program, program: 'الأمن السيبراني' }, rows), undefined);
});
