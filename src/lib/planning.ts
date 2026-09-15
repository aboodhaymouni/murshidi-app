export interface StudyAssumptions {
  creditFee: number;
  credits: number;
  years: number;
  annualOtherFees: number;
  monthlyLiving: number;
  annualBudget: number;
}

export function studyPlan(input: StudyAssumptions) {
  const limits: Record<keyof StudyAssumptions, [number, number]> = {
    creditFee: [0, 10000], credits: [1, 500], years: [1, 10],
    annualOtherFees: [0, 100000], monthlyLiving: [0, 10000], annualBudget: [0, 1000000],
  };
  for (const key of Object.keys(limits) as (keyof StudyAssumptions)[]) {
    const [min, max] = limits[key];
    if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max) return null;
  }
  const tuition = input.creditFee * input.credits;
  const other = input.years * (input.annualOtherFees + input.monthlyLiving * 12);
  const total = tuition + other;
  const annual = total / input.years;
  return { tuition, other, total, annual, gap: Math.max(0, annual - input.annualBudget), affordable: annual <= input.annualBudget };
}

export function normalizedProgram(text: string) {
  return text.normalize('NFKC').replace(/[\u064B-\u065F\u0670ـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
}

export interface ProgramChoice {
  id: string; university: string; program: string; academicYear: string;
  creditFee: number | null; creditHours: number | null; minimumEligibility: number | null;
  sourceId: string; universityCode?: string; programCode?: string; branch?: string;
}

export interface CutoffChoice {
  id: string; university: string; program: string; admissionYear: string;
  admissionChannel: string; certificateGroup: string | null; cutoff: number;
  sourceId: string; universityCode?: string;
}

export function previousCutoff(program: ProgramChoice, cutoffs: CutoffChoice[]) {
  return cutoffs.filter(row =>
    (row.universityCode && program.universityCode ? row.universityCode === program.universityCode : normalizedProgram(row.university) === normalizedProgram(program.university)) &&
    normalizedProgram(row.program) === normalizedProgram(program.program)
  ).sort((a, b) => Number(b.admissionYear) - Number(a.admissionYear))[0];
}

export function defaultPrograms(programs: ProgramChoice[]) {
  const computing = programs.filter(p => /علم الحاسوب|علوم الحاسوب/.test(p.program));
  return ['100', '400', '300'].map(code => computing.find(p => p.universityCode === code)).filter((p): p is ProgramChoice => Boolean(p)).concat(computing, programs).filter((p, i, all) => all.findIndex(x => x.id === p.id) === i).slice(0, 3);
}
