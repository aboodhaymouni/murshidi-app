import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calculator, CheckCircle2, Pencil, Printer, Wallet } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataStatus from '../components/DataStatus';
import ProgramPicker from '../components/ProgramPicker';
import { usePublicData } from '../data/PublicDataContext';
import { useLang } from '../i18n/LangContext';
import { defaultPrograms, previousCutoff, studyPlan } from '../lib/planning';

export default function ROICalculator() {
  const { lang } = useLang(); const ar = lang === 'ar';
  const { data } = usePublicData();
  const [searchParams] = useSearchParams();
  const [programId, setProgramId] = useState(searchParams.get('program') ?? '');
  const [picking, setPicking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [values, setValues] = useState({ gpa: '95', credits: '132', years: '4', annualOtherFees: '300', monthlyLiving: '100', annualBudget: '4000' });
  const program = data.programs.find(p => p.id === programId) ?? defaultPrograms(data.programs)[0];
  const cutoff = program ? previousCutoff(program, data.cutoffs) : undefined;
  const number = (key: keyof typeof values) => values[key].trim() === '' ? NaN : Number(values[key]);
  const result = program && program.creditFee !== null ? studyPlan({ creditFee: program.creditFee, credits: number('credits'), years: number('years'), annualOtherFees: number('annualOtherFees'), monthlyLiving: number('monthlyLiving'), annualBudget: number('annualBudget') }) : null;
  const validGpa = Number.isFinite(number('gpa')) && number('gpa') >= 0 && number('gpa') <= 100;
  const money = (n: number) => n.toLocaleString(ar ? 'ar-JO' : 'en-GB', { maximumFractionDigits: 0 });
  const currency = ar ? 'د.أ' : 'JOD';
  const fields: { key: keyof typeof values; label: string; min: number; max: number; step?: string }[] = [
    { key: 'gpa', label: ar ? 'معدّل التوجيهي للمقارنة التاريخية' : 'Tawjihi grade for historical comparison', min: 0, max: 100, step: '0.01' },
    { key: 'annualBudget', label: ar ? 'ميزانيتك السنوية • د.أ' : 'Your annual budget • JOD', min: 0, max: 1000000 },
    { key: 'credits', label: ar ? 'ساعات الخطة • افتراض تعدّله' : 'Degree credits • your assumption', min: 1, max: 500 },
    { key: 'years', label: ar ? 'سنوات الدراسة • افتراض' : 'Study years • assumption', min: 1, max: 10 },
    { key: 'annualOtherFees', label: ar ? 'رسوم أخرى سنويًا • افتراض بالدينار' : 'Other annual fees • assumed JOD', min: 0, max: 100000 },
    { key: 'monthlyLiving', label: ar ? 'نقل ومعيشة شهريًا • افتراض بالدينار' : 'Monthly transport/living • assumed JOD', min: 0, max: 10000 },
  ];
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar ? 'خطّط لكلفة دراستك' : 'Plan your study costs'} subtitle={ar ? 'رسم رسمي + افتراضاتك = صورة أوضح' : 'Official fee + your assumptions = a clearer plan'} />
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="gov-card p-4 border-t-4 border-t-gov-navy">
        <div className="flex items-start gap-3"><span className="bg-gov-navy text-white p-3 rounded-lg"><Calculator size={22} /></span><div className="flex-1 min-w-0"><p className="text-[11px] text-gov-muted">{ar ? 'البرنامج المختار • العادي' : 'Selected program • regular admission'}</p><h2 className="font-bold text-lg text-gov-navy" dir="rtl">{program?.program ?? (ar ? 'لا توجد برامج محمّلة' : 'No programs loaded')}</h2><p className="text-sm text-gov-muted" dir="rtl">{program?.university}</p></div><button className="btn-secondary p-3 print:hidden" aria-label={ar ? 'تغيير البرنامج' : 'Change program'} onClick={() => { setPicking(!picking); setShowResult(false); }}><Pencil size={16} /></button></div>
        {program && <div className="mt-4 pt-3 border-t border-gov-line flex justify-between gap-3"><span className="text-xs text-gov-muted">{ar ? `رسم الساعة المنشور • ${program.academicYear}` : `Published credit fee • ${program.academicYear}`}</span><strong className="text-gov-navy tabular">{program.creditFee === null ? (ar ? 'غير منشور' : 'Not published') : `${program.creditFee} ${currency}`}</strong></div>}
      </div>
      {picking && <div className="gov-card p-4 print:hidden"><ProgramPicker programs={data.programs} selected={program?.id} onSelect={id => { setProgramId(id); setPicking(false); setShowResult(false); }} /></div>}
      {!showResult ? <form className="gov-card p-4 space-y-4" onSubmit={e => { e.preventDefault(); if (result && validGpa) { setShowResult(true); window.scrollTo(0, 0); } }}>
        <h2 className="font-bold text-gov-ink">{ar ? 'ابنِ سيناريو يناسب أسرتك' : 'Build a scenario for your family'}</h2>
        <p className="text-xs text-gov-muted leading-relaxed">{ar ? 'ساعات الخطة والرسوم الإضافية والمعيشة قيم توضيحية قابلة للتعديل؛ راجع خطة الجامعة قبل القرار. يُحسب بند المعيشة على 12 شهرًا في السنة.' : 'Credits, other fees and living costs are editable examples. Check the university study plan. Living costs cover 12 months per year.'}</p>
        <div className="grid grid-cols-2 gap-3">{fields.map(field => <label key={field.key} className="text-xs font-semibold text-gov-body space-y-2"><span className="block min-h-8">{field.label}</span><input required type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step ?? '1'} value={values[field.key]} onChange={e => setValues({ ...values, [field.key]: e.target.value })} className="w-full min-h-[48px] border border-gov-line rounded-lg p-3 text-base tabular bg-white" dir="ltr" /></label>)}</div>
        <button className="btn-primary w-full" type="submit" disabled={!result || !validGpa}>{ar ? 'احسب الكلفة وقارن بميزانيتي' : 'Calculate costs against my budget'}</button>
        {program?.creditFee === null && <p role="status" className="text-sm text-gov-muted">{ar ? 'لا يتوفر رسم موثق لهذا البرنامج. اختر برنامجًا آخر.' : 'No verified fee is available. Choose another program.'}</p>}
      </form> : result && <>
        <div className="rounded-xl bg-gov-navy text-white p-5"><div className="flex gap-2 items-center text-sm opacity-90"><Wallet size={18} />{ar ? 'الكلفة السنوية التقديرية' : 'Estimated annual cost'}</div><p className="text-4xl font-bold tabular mt-3">{money(result.annual)} <span className="text-lg font-medium">{currency}</span></p><p className="text-xs mt-3 opacity-80">{ar ? `${money(result.total)} د.أ طوال ${values.years} سنوات، حسب افتراضاتك` : `${money(result.total)} JOD over ${values.years} years, using your assumptions`}</p></div>
        <div className={`gov-card p-4 border-s-4 ${result.affordable ? 'border-s-gov-green' : 'border-s-amber-500'}`} role="status"><div className="flex gap-2 items-center"><CheckCircle2 size={20} className="text-gov-navy" /><h2 className="font-bold text-gov-ink">{result.affordable ? (ar ? 'ضمن ميزانيتك في هذا السيناريو' : 'Within your budget in this scenario') : (ar ? 'يحتاج تعديلًا في الخطة' : 'This plan needs an adjustment')}</h2></div><p className="text-sm text-gov-muted mt-2">{ar ? `ميزانيتك: ${money(number('annualBudget'))} د.أ سنويًا` : `Your budget: ${money(number('annualBudget'))} JOD per year`}{!result.affordable && (ar ? ` • الفجوة: ${money(result.gap)} د.أ سنويًا` : ` • Gap: ${money(result.gap)} JOD per year`)}</p></div>
        <div className="gov-card p-4 space-y-3"><h2 className="font-bold text-gov-ink">{ar ? 'من أين جاءت الكلفة؟' : 'What makes up the cost?'}</h2><div className="flex justify-between text-sm"><span>{ar ? 'الرسوم الدراسية لكامل الخطة' : 'Tuition for the full degree'}</span><strong>{money(result.tuition)} {currency}</strong></div><div className="flex justify-between text-sm"><span>{ar ? 'رسوم أخرى ومعيشة طوال الدراسة' : 'Other fees and living costs'}</span><strong>{money(result.other)} {currency}</strong></div><p className="text-[11px] text-gov-muted">{ar ? 'لا يشمل الحساب تغيّر الرسوم أو التضخم أو التمويل. ليس توقعًا للدخل أو ضمانًا للتوظيف.' : 'Fee changes, inflation and financing are excluded. This is not an income forecast or employment guarantee.'}</p></div>
        <div className="gov-card p-4 space-y-2"><h2 className="font-bold text-gov-ink">{ar ? 'مرجع القبول قبل أن تقرّر' : 'Admission context before deciding'}</h2><p className="text-sm">{cutoff ? (ar ? `حد تنافسي منشور ${cutoff.admissionYear}: ${cutoff.cutoff}%` : `Published competitive cutoff ${cutoff.admissionYear}: ${cutoff.cutoff}%`) : (ar ? 'لم نجد حدًا تاريخيًا مطابقًا لهذا البرنامج.' : 'No matching historical cutoff was found.')}</p>{cutoff && <p className="text-xs text-gov-muted">{ar ? `معدّلك ${number('gpa')}%؛ الفارق عن هذا المرجع ${(number('gpa') - cutoff.cutoff).toFixed(2)} نقطة.` : `Your grade is ${number('gpa')}%; difference from this reference: ${(number('gpa') - cutoff.cutoff).toFixed(2)} points.`}</p>}<p className="text-xs text-gov-muted leading-relaxed">{ar ? 'الحد السابق للثانوية الأردنية مرجع تاريخي، ولا يضمن القبول الحالي. شروط الدليل المعروض تخص مرشح العلمي؛ تحقّق من فرعك وسنة شهادتك في القبول الموحد.' : 'Past cutoffs for Jordanian certificates do not guarantee admission. The catalog uses the scientific-stream filter. Verify your stream and certificate year with Unified Admission.'}</p></div>
        <div className="flex gap-2 print:hidden"><button onClick={() => setShowResult(false)} className="btn-secondary flex-1"><Pencil size={16} />{ar ? 'عدّل الافتراضات' : 'Edit assumptions'}</button><button onClick={() => window.print()} className="btn-primary flex-1"><Printer size={16} />{ar ? 'اطبع الخطة' : 'Print plan'}</button></div>
      </>}
      <DataStatus sourceId="admhec-programs" compact />{showResult && <DataStatus sourceId="admhec-cutoffs" compact />}
    </main>
  </div>;
}
