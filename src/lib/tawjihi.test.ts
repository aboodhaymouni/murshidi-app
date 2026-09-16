// Tests for the new-Tawjihi model — docs/TAWJIHI_SPEC.md §5.
//
// Two jobs, and the second one is the important one:
//
//   1. The behavioural acceptance cases the spec lists verbatim, so a refactor of
//      eligibilityFor() cannot quietly change what a student is told.
//   2. A STRUCTURAL DIFF between src/lib/tawjihi.data.ts and
//      docs/tawjihi-2026-official.json — the transcription a human checked
//      against the Ministry's PDFs. The generated module and the transcription
//      are two copies of one document, and the only way two copies stay honest
//      is if a test fails the moment they disagree. Hand-editing the generated
//      file, or editing the JSON without re-running `npm run tawjihi:gen`, both
//      break this test by design.
//
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ACADEMIC_FIELDS,
  VOCATIONAL_PROGRAMS,
  MAJOR_ELIGIBILITY,
} from './tawjihi.data';
import {
  ADMISSION_MINIMUMS,
  LEGACY_BRANCHES,
  TAWJIHI_SOURCE,
  TRACKS,
  academicFields,
  collegesFor,
  computeAverage,
  eligibilityFor,
  isPathComplete,
  majorsFor,
  minimumAverageFor,
  partTwoLabel,
  pathConstrainsChoices,
  type LegacyBranchId,
  type StudyPath,
  vocationalPrograms,
} from './tawjihi';

const OFFICIAL_PATH = new URL('../../docs/tawjihi-2026-official.json', import.meta.url);
const official = JSON.parse(readFileSync(OFFICIAL_PATH, 'utf8'));

// ─────────────────────────────────────────────────────────────────────────────
// 1. Structural diff — the module must still equal the transcription
// ─────────────────────────────────────────────────────────────────────────────

test('academic fields match docs/tawjihi-2026-official.json exactly', () => {
  assert.deepEqual(
    ACADEMIC_FIELDS,
    official.academicFields.map((f: Record<string, unknown>) => ({
      id: f.id,
      nameAr: f.nameAr,
      nameEn: f.nameEn,
      colleges: f.colleges,
    })),
    'ACADEMIC_FIELDS drifted from the transcription — re-run `npm run tawjihi:gen`',
  );
});

test('vocational programmes match docs/tawjihi-2026-official.json exactly', () => {
  assert.deepEqual(
    VOCATIONAL_PROGRAMS,
    official.vocationalPrograms.map((p: Record<string, unknown>) => ({
      id: p.id,
      order: p.order,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      diploma: p.diploma,
      technicalBachelor: p.technicalBachelor,
    })),
    'VOCATIONAL_PROGRAMS drifted from the transcription — re-run `npm run tawjihi:gen`',
  );
});

test('every college list is non-empty and free of the raw military marker', () => {
  // `***` marks a military-college programme in the source document. The data
  // keeps it so the UI can badge it; the test only guards against a list that
  // lost its content or gained a stray marker-only entry.
  for (const field of ACADEMIC_FIELDS) {
    assert.ok(field.colleges.length > 0, `${field.id} has no colleges`);
    for (const c of field.colleges) assert.notEqual(c.trim(), '***');
  }
  for (const program of VOCATIONAL_PROGRAMS) {
    assert.ok(
      program.diploma.length + program.technicalBachelor.length > 0,
      `${program.id} has no programmes`,
    );
  }
});

test('major eligibility records match the transcription field for field', () => {
  const jsonMajors = official.appMajorEligibility as Record<string, Record<string, unknown>>;
  assert.deepEqual(
    Object.keys(MAJOR_ELIGIBILITY).sort(),
    Object.keys(jsonMajors).sort(),
    'the set of mapped majors drifted from the transcription',
  );
  for (const [majorId, record] of Object.entries(MAJOR_ELIGIBILITY)) {
    const source = jsonMajors[majorId];
    // Key sets must agree too: a field added to the JSON and silently dropped by
    // the generator would otherwise never be noticed.
    assert.deepEqual(
      Object.keys(record).sort(),
      Object.keys(source).sort(),
      `${majorId}: field set differs from the transcription`,
    );
    assert.deepEqual(record, source, `${majorId}: value differs from the transcription`);
  }
});

test('admission minimums match the transcription, including both tier tables', () => {
  const am = official.admissionMinimums;
  assert.deepEqual(ADMISSION_MINIMUMS.publicUniversities, am.publicUniversities);
  assert.deepEqual(ADMISSION_MINIMUMS.privateUniversities, am.privateUniversities);
  assert.equal(ADMISSION_MINIMUMS.universalSubjectFloorAr, am.universalSubjectFloor.ar);
  assert.equal(ADMISSION_MINIMUMS.universalSubjectFloorEn, am.universalSubjectFloor.en);
  assert.equal(ADMISSION_MINIMUMS.note1400Ar, am.note1400Column.ar);
  assert.equal(ADMISSION_MINIMUMS.note1400En, am.note1400Column.en);
  assert.equal(ADMISSION_MINIMUMS.technicalEngineeringPercent, am.technicalEngineeringBachelor.percent);
  assert.equal(ADMISSION_MINIMUMS.technicalEngineeringAr, am.technicalEngineeringBachelor.ar);
  assert.equal(ADMISSION_MINIMUMS.source.documentAr, am.source.document);
  assert.equal(ADMISSION_MINIMUMS.source.decisionAr, am.source.decision);
  assert.equal(ADMISSION_MINIMUMS.source.legalBasisAr, am.source.legalBasis);
  assert.equal(ADMISSION_MINIMUMS.source.url, am.source.url);
  assert.equal(ADMISSION_MINIMUMS.source.localCopy, am.source.localCopy);
  assert.equal(ADMISSION_MINIMUMS.source.sectionAr, am.source.section);
  assert.equal(ADMISSION_MINIMUMS.source.retrieved, am.source.retrieved);
});

test('the source citation matches the transcription', () => {
  const s = official.source;
  assert.equal(TAWJIHI_SOURCE.authorityAr, s.authority);
  assert.equal(TAWJIHI_SOURCE.authorityEn, s.authorityEn);
  assert.equal(TAWJIHI_SOURCE.decisionPage, s.decisionPage);
  assert.equal(TAWJIHI_SOURCE.pageDate, s.pageDate);
  assert.equal(TAWJIHI_SOURCE.pdfAcademic, s.pdfAcademic);
  assert.equal(TAWJIHI_SOURCE.pdfVocational, s.pdfVocational);
  assert.equal(TAWJIHI_SOURCE.appliesFrom, s.appliesFrom);
  assert.equal(TAWJIHI_SOURCE.retrieved, s.retrieved);
  assert.equal(TAWJIHI_SOURCE.militaryMarkerAr, s.militaryMarker);
});

test('the two published tracks match the transcription', () => {
  assert.deepEqual(
    TRACKS.filter((t) => t.id !== 'legacy'),
    official.tracks.map((t: Record<string, unknown>) => ({
      id: t.id,
      nameAr: t.nameAr,
      nameEn: t.nameEn,
    })),
  );
  // 'legacy' is the app's own honest third option, not a Ministry track.
  assert.ok(TRACKS.some((t) => t.id === 'legacy'));
  assert.equal(official.tracks.length, 2);
});

test('the public helpers expose the same lists as the data module', () => {
  assert.deepEqual(academicFields(), ACADEMIC_FIELDS);
  assert.deepEqual(vocationalPrograms(), VOCATIONAL_PROGRAMS);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. The acceptance cases, quoted from docs/TAWJIHI_SPEC.md §2
// ─────────────────────────────────────────────────────────────────────────────

test('medicine: eligible from the health field only', () => {
  const health = eligibilityFor('medicine', { track: 'academic', field: 'health' });
  assert.equal(health.status, 'eligible');
  assert.equal(health.status === 'eligible' && health.degree, 'bachelor');

  assert.equal(
    eligibilityFor('medicine', { track: 'academic', field: 'science-tech' }).status,
    'not-eligible',
  );
});

test('medicine is not reachable from ANY vocational programme', () => {
  for (const program of VOCATIONAL_PROGRAMS) {
    const answer = eligibilityFor('medicine', {
      track: 'vocational',
      program: program.id as StudyPath['program'],
    });
    assert.equal(
      answer.status,
      'not-eligible',
      `medicine must be closed on the ${program.id} programme`,
    );
  }
});

test('cs: eligible and explicit on science-tech, technical via the IT programme', () => {
  const academic = eligibilityFor('cs', { track: 'academic', field: 'science-tech' });
  assert.equal(academic.status, 'eligible');
  assert.equal(academic.status === 'eligible' && academic.explicit, true);

  const vocational = eligibilityFor('cs', { track: 'vocational', program: 'it' });
  assert.equal(vocational.status, 'eligible-technical');
  assert.equal(vocational.status === 'eligible-technical' && vocational.degree, 'technical-bachelor');
  assert.equal(vocational.status === 'eligible-technical' && vocational.via, 'it');
});

test('data-science on science-tech is explicit:false, covered by تكنولوجيا المعلومات', () => {
  const answer = eligibilityFor('data-science', { track: 'academic', field: 'science-tech' });
  assert.equal(answer.status, 'eligible');
  assert.equal(answer.status === 'eligible' && answer.explicit, false);
  assert.equal(answer.status === 'eligible' && answer.coveredBy, 'تكنولوجيا المعلومات');
});

test('law is not reachable from the business vocational programme', () => {
  assert.equal(
    eligibilityFor('law', { track: 'vocational', program: 'business' }).status,
    'not-eligible',
  );
});

test('every legacy branch returns unpublished for every major, with a reason', () => {
  for (const branch of LEGACY_BRANCHES) {
    for (const majorId of Object.keys(MAJOR_ELIGIBILITY)) {
      const answer = eligibilityFor(majorId, {
        track: 'legacy',
        branch: branch.id as LegacyBranchId,
      });
      assert.equal(
        answer.status,
        'unpublished',
        `${majorId} on the ${branch.id} branch must be 'unpublished', never a guess`,
      );
      assert.ok(answer.status === 'unpublished' && answer.reasonAr.length > 0);
      assert.ok(answer.status === 'unpublished' && answer.reasonEn.length > 0);
    }
  }
});

test('majorsFor(vocational/it) partitions exactly as the spec records', () => {
  const partition = majorsFor({ track: 'vocational', program: 'it' });
  assert.deepEqual(partition.eligible, []);
  assert.deepEqual(partition.technical.sort(), ['cs', 'cyber', 'data-science']);
  assert.deepEqual(partition.blocked.sort(), [
    'accounting',
    'architecture',
    'business',
    'civil-eng',
    'law',
    'media',
    'medicine',
    'nursing',
    'pharmacy',
  ]);
  assert.deepEqual(partition.unknown, []);
});

test('majorsFor covers every mapped major exactly once, for every published path', () => {
  const paths: StudyPath[] = [
    ...ACADEMIC_FIELDS.map((f) => ({ track: 'academic' as const, field: f.id as StudyPath['field'] })),
    ...VOCATIONAL_PROGRAMS.map((p) => ({ track: 'vocational' as const, program: p.id as StudyPath['program'] })),
  ];
  const total = Object.keys(MAJOR_ELIGIBILITY).length;
  for (const path of paths) {
    const p = majorsFor(path);
    const all = [...p.eligible, ...p.technical, ...p.blocked, ...p.unknown];
    assert.equal(all.length, total, `${JSON.stringify(path)} lost or duplicated a major`);
    assert.equal(new Set(all).size, total);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Honest failure modes — the module must never throw or guess
// ─────────────────────────────────────────────────────────────────────────────

test('an unknown major id returns unpublished rather than throwing', () => {
  const answer = eligibilityFor('quidditch', { track: 'academic', field: 'health' });
  assert.equal(answer.status, 'unpublished');
});

test('an incomplete or missing path claims nothing', () => {
  assert.equal(eligibilityFor('cs', null).status, 'unpublished');
  assert.equal(eligibilityFor('cs', undefined).status, 'unpublished');
  assert.equal(eligibilityFor('cs', { track: 'academic' }).status, 'unpublished');
  assert.equal(eligibilityFor('cs', { track: 'vocational' }).status, 'unpublished');
  assert.equal(isPathComplete({ track: 'academic' }), false);
  assert.equal(isPathComplete({ track: 'academic', field: 'health' }), true);
  assert.equal(isPathComplete(null), false);
});

test('collegesFor keeps the diploma and the technical bachelor apart', () => {
  const academic = collegesFor({ track: 'academic', field: 'health' });
  assert.ok(academic.bachelor.length > 0);
  assert.deepEqual(academic.diploma, []);
  assert.deepEqual(academic.technicalBachelor, []);

  const vocational = collegesFor({ track: 'vocational', program: 'it' });
  assert.deepEqual(vocational.bachelor, []);
  assert.ok(vocational.diploma.length > 0);
  assert.ok(vocational.technicalBachelor.length > 0);
  // They are different degrees; merging them is the error this app exists to avoid.
  assert.notDeepEqual(vocational.diploma, vocational.technicalBachelor);

  assert.deepEqual(collegesFor({ track: 'legacy', branch: 'scientific' }), {
    bachelor: [],
    diploma: [],
    technicalBachelor: [],
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. The published floor is a floor, never a prediction
// ─────────────────────────────────────────────────────────────────────────────

test('minimumAverageFor returns the published floor and compares an average to it', () => {
  const medicine = minimumAverageFor('medicine', 'public', 88);
  assert.ok(medicine);
  assert.equal(medicine.percent, 90);
  assert.equal(medicine.meets, false);
  assert.equal(medicine.marginPoints, -2);

  const passing = minimumAverageFor('medicine', 'public', 95);
  assert.equal(passing?.meets, true);
  assert.equal(passing?.marginPoints, 5);

  // No grade means no verdict — not a default of "eligible".
  assert.equal(minimumAverageFor('medicine', 'public')?.meets, null);
  assert.equal(minimumAverageFor('medicine', 'public')?.marginPoints, null);

  assert.equal(minimumAverageFor('quidditch', 'public'), null);
});

test('every published floor sits on one of the decision tiers', () => {
  const publicTiers = new Set(ADMISSION_MINIMUMS.publicUniversities.map((t) => t.percent));
  const privateTiers = new Set(ADMISSION_MINIMUMS.privateUniversities.map((t) => t.percent));
  for (const majorId of Object.keys(MAJOR_ELIGIBILITY)) {
    const pub = minimumAverageFor(majorId, 'public');
    const priv = minimumAverageFor(majorId, 'private');
    if (pub) assert.ok(publicTiers.has(pub.percent), `${majorId}: public floor ${pub.percent} is off-tier`);
    if (priv) assert.ok(privateTiers.has(priv.percent), `${majorId}: private floor ${priv.percent} is off-tier`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. The two different 30/70s
// ─────────────────────────────────────────────────────────────────────────────

test('partTwoLabel never calls BTEC coursework a national exam', () => {
  const academicAr = partTwoLabel('academic', 'ar');
  const vocationalAr = partTwoLabel('vocational', 'ar');
  const vocationalEn = partTwoLabel('vocational', 'en');

  assert.notEqual(academicAr, vocationalAr, 'the two 70% components must not read the same');
  assert.ok(!/امتحان وطني/.test(vocationalAr), 'the vocational 70% is coursework, not a national exam');
  assert.ok(!/national exam/i.test(vocationalEn));
});

test('computeAverage weights 30/70 of 1000 and refuses an incomplete input', () => {
  const full = computeAverage({ partOneMarks: 300, partTwoMarks: 700 });
  assert.equal(full.status, 'ok');
  assert.equal(full.status === 'ok' && full.percent, 100);

  const half = computeAverage({ partOneMarks: 150, partTwoMarks: 350 });
  assert.equal(half.status === 'ok' && half.percent, 50);

  assert.equal(computeAverage({ partOneMarks: 300, partTwoMarks: null }).status, 'incomplete');
  assert.equal(computeAverage({ partOneMarks: null, partTwoMarks: null }).status, 'incomplete');
});

// ── Regression: an unpublished table must not read as "nothing is open" ──────
//
// A previous-plan student has a COMPLETE path — they picked العلمي — but the
// Higher Education Council published its college table for the new plan only,
// so every major comes back `unpublished` for them. Code that filtered on
// "eligible or technical" therefore produced an empty list and told that student
// their average reached nothing, on both the interests test and the offline
// advisor. `pathConstrainsChoices` is the guard; these assertions are why.
test('a previous-plan path completes but must not filter any major away', () => {
  const legacy: StudyPath = { track: 'legacy', branch: 'scientific' };
  assert.equal(isPathComplete(legacy), true, 'a legacy branch is a finished choice');
  assert.equal(pathConstrainsChoices(legacy), false, 'but it has no published table to filter with');

  const reach = majorsFor(legacy);
  assert.equal(reach.eligible.length, 0);
  assert.equal(reach.technical.length, 0);
  assert.ok(reach.unknown.length > 0, 'every major is unknown, not blocked');
  assert.equal(reach.blocked.length, 0, 'nothing may be reported as blocked on an unpublished table');
});

test('a complete new-plan path does constrain', () => {
  assert.equal(pathConstrainsChoices({ track: 'academic', field: 'health' }), true);
  assert.equal(pathConstrainsChoices({ track: 'vocational', program: 'it' }), true);
  assert.equal(pathConstrainsChoices({ track: 'academic' }), false, 'a track without a field is not finished');
  assert.equal(pathConstrainsChoices(null), false);
});
