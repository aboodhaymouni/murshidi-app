// Generates src/lib/tawjihi.data.ts from docs/tawjihi-2026-official.json.
//
// The JSON is the artefact a human checks against the Ministry's PDFs in docs/sources/.
// The generated module is what the app imports. Regenerate with:  npm run tawjihi:gen
// Never hand-edit the generated file — edit the JSON and re-run this.

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'docs/tawjihi-2026-official.json');
const out = resolve(root, 'src/lib/tawjihi.data.ts');

const data = JSON.parse(readFileSync(src, 'utf8'));

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const list = (xs, indent) => xs.map((x) => `${indent}${q(x)},`).join('\n');

const fields = data.academicFields
  .map(
    (f) => `  {
    id: ${q(f.id)},
    nameAr: ${q(f.nameAr)},
    nameEn: ${q(f.nameEn)},
    colleges: [
${list(f.colleges, '      ')}
    ],
  },`,
  )
  .join('\n');

const programs = data.vocationalPrograms
  .map(
    (p) => `  {
    id: ${q(p.id)},
    order: ${p.order},
    nameAr: ${q(p.nameAr)},
    nameEn: ${q(p.nameEn)},
    diploma: [
${list(p.diploma, '      ')}
    ],
    technicalBachelor: [
${list(p.technicalBachelor, '      ')}
    ],
  },`,
  )
  .join('\n');

const eligibility = Object.entries(data.appMajorEligibility)
  .map(([majorId, e]) => {
    const parts = [
      `    academicFields: [${e.academicFields.map(q).join(', ')}]`,
      `    officialCollege: ${q(e.officialCollege)}`,
      `    explicit: ${e.explicit}`,
      e.coveredBy ? `    coveredBy: ${q(e.coveredBy)}` : null,
      `    vocationalPrograms: [${e.vocationalPrograms.map(q).join(', ')}]`,
      e.vocationalDegree ? `    vocationalDegree: ${q(e.vocationalDegree)}` : null,
      `    vocationalNote: ${q(e.vocationalNote)}`,
      e.minimumAverage
        ? `    minimumAverage: { public: ${e.minimumAverage.public}, private: ${e.minimumAverage.private}, tierAr: ${q(e.minimumAverage.tierAr)} }`
        : null,
    ].filter(Boolean);
    return `  ${q(majorId)}: {\n${parts.join(',\n')},\n  },`;
  })
  .join('\n');

const am = data.admissionMinimums;
const tiers = (xs) =>
  xs
    .map((t) => `    { percent: ${t.percent}, outOf1400: ${t.outOf1400}, ar: ${q(t.ar)} },`)
    .join('\n');

const s = data.source;

const file = `// GENERATED FILE — do not edit by hand.
// Source of truth: docs/tawjihi-2026-official.json (checked against the Ministry PDFs in
// docs/sources/). Regenerate with: npm run tawjihi:gen
//
// Authority: ${s.authority}
// Decision page dated ${s.pageDate}, effective from the ${s.appliesFrom} academic year.
// Retrieved ${s.retrieved}.

export const TAWJIHI_SOURCE = {
  authorityAr: ${q(s.authority)},
  authorityEn: ${q(s.authorityEn)},
  decisionPage: ${q(s.decisionPage)},
  pageDate: ${q(s.pageDate)},
  pdfAcademic: ${q(s.pdfAcademic)},
  pdfVocational: ${q(s.pdfVocational)},
  appliesFrom: ${q(s.appliesFrom)},
  retrieved: ${q(s.retrieved)},
  militaryMarkerAr: ${q(s.militaryMarker)},
} as const;

export interface AcademicFieldRecord {
  id: string;
  nameAr: string;
  nameEn: string;
  colleges: string[];
}

export interface VocationalProgramRecord {
  id: string;
  order: number;
  nameAr: string;
  nameEn: string;
  diploma: string[];
  technicalBachelor: string[];
}

export interface AdmissionTier {
  percent: number;
  outOf1400: number;
  ar: string;
}

export interface MajorMinimumAverage {
  /** Official minimum to APPLY at a public university — not the competitive cut-off. */
  public: number;
  private: number;
  tierAr: string;
}

export interface MajorEligibilityRecord {
  academicFields: string[];
  officialCollege: string;
  explicit: boolean;
  coveredBy?: string;
  vocationalPrograms: string[];
  vocationalDegree?: string;
  vocationalNote: string;
  minimumAverage?: MajorMinimumAverage;
}

export const ACADEMIC_FIELDS: AcademicFieldRecord[] = [
${fields}
];

export const VOCATIONAL_PROGRAMS: VocationalProgramRecord[] = [
${programs}
];

export const MAJOR_ELIGIBILITY: Record<string, MajorEligibilityRecord> = {
${eligibility}
};

/**
 * The published minimum average required to APPLY — قرار مجلس التعليم العالي 295/2026.
 * This is NOT the competitive cut-off (الحد الأدنى التنافسي), which had not been
 * published for 2026/2027 when this file was generated.
 */
export const ADMISSION_MINIMUMS = {
  source: {
    documentAr: ${q(am.source.document)},
    decisionAr: ${q(am.source.decision)},
    legalBasisAr: ${q(am.source.legalBasis)},
    url: ${q(am.source.url)},
    localCopy: ${q(am.source.localCopy)},
    sectionAr: ${q(am.source.section)},
    retrieved: ${q(am.source.retrieved)},
  },
  universalSubjectFloorAr: ${q(am.universalSubjectFloor.ar)},
  universalSubjectFloorEn: ${q(am.universalSubjectFloor.en)},
  note1400Ar: ${q(am.note1400Column.ar)},
  note1400En: ${q(am.note1400Column.en)},
  technicalEngineeringPercent: ${am.technicalEngineeringBachelor.percent},
  technicalEngineeringAr: ${q(am.technicalEngineeringBachelor.ar)},
  publicUniversities: [
${tiers(am.publicUniversities)}
  ] as AdmissionTier[],
  privateUniversities: [
${tiers(am.privateUniversities)}
  ] as AdmissionTier[],
};
`;

writeFileSync(out, file, 'utf8');
console.log(
  `wrote ${out}\n  ${data.academicFields.length} academic fields` +
    `\n  ${data.vocationalPrograms.length} vocational programmes` +
    `\n  ${Object.keys(data.appMajorEligibility).length} mapped majors`,
);
