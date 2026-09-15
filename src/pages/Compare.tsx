import { useState } from 'react';
import { ArrowLeftRight, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import DataStatus from '../components/DataStatus';
import ProgramPicker from '../components/ProgramPicker';
import { usePublicData } from '../data/PublicDataContext';
import { useLang } from '../i18n/LangContext';
import { defaultPrograms, previousCutoff } from '../lib/planning';

export default function Compare() {
  const { lang } = useLang(); const ar = lang === 'ar'; const { data } = usePublicData();
  const [ids, setIds] = useState<string[]>([]); const [picker, setPicker] = useState<number | null>(null);
  const selected = ids.length ? ids.map(id => data.programs.find(p => p.id === id)).filter(p => p !== undefined) : defaultPrograms(data.programs);
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar ? 'قارن على أساس واضح' : 'Compare with clear evidence'} subtitle={ar ? 'برامج جامعية • رسوم رسمية • قبول سابق' : 'University programs • official fees • past cutoffs'} />
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="rounded-xl bg-gov-navy text-white p-5"><ArrowLeftRight size={24} className="mb-3" /><h2 className="text-xl font-bold">{ar ? 'خياراتك أمامك بوضوح' : 'Your options, clearly presented'}</h2><p className="mt-2 text-sm text-blue-100 leading-relaxed">{ar ? 'قارن حتى 3 برامج، ووازن رسوم الجامعة مع ميزانيتك. أسماء البرامج كما وردت في المصدر الرسمي.' : 'Compare up to 3 programs and weigh fees against your budget. Program names retain their official Arabic wording.'}</p></div>
      {picker !== null && <section className="gov-card p-4"><ProgramPicker programs={data.programs} selected={selected[picker]?.id} excluded={selected.filter((_, i) => i !== picker).map(p => p.id)} onSelect={id => { const next = selected.map(p => p.id); next[picker] = id; setIds(next); setPicker(null); }} /><button className="btn-secondary mt-3" onClick={() => setPicker(null)}>{ar ? 'إغلاق' : 'Close'}</button></section>}
      <div className="grid md:grid-cols-3 gap-3">{selected.map((p, index) => {
        const cutoff = previousCutoff(p, data.cutoffs);
        return <article key={p.id} className="gov-card p-4 border-t-4 border-t-gov-navy space-y-3">
          <div className="flex justify-between items-start gap-3"><div dir="rtl"><h3 className="text-base font-bold text-gov-navy">{p.program}</h3><p className="text-sm text-gov-muted mt-1">{p.university}</p></div><button onClick={() => setPicker(index)} className="btn-secondary p-3" aria-label={ar ? `تغيير البرنامج ${index + 1}` : `Change program ${index + 1}`}><Pencil size={15} /></button></div>
          <div className="flex items-center justify-between border-t border-gov-line pt-3"><div><p className="text-xs text-gov-muted">{ar ? 'رسم الساعة • العادي' : 'Regular credit fee'}</p><p className="text-[10px] text-gov-muted mt-1">{p.academicYear}</p></div><strong className="text-2xl text-gov-navy tabular">{p.creditFee ?? '—'} <span className="text-xs font-normal">{ar ? 'د.أ' : 'JOD'}</span></strong></div>
          <div className="flex justify-between gap-2 text-xs"><span className="text-gov-muted">{ar ? 'حد التقديم • مرشح العلمي' : 'Application minimum • scientific filter'}</span><strong className="whitespace-nowrap">{p.minimumEligibility === null ? '—' : `${p.minimumEligibility}%`}</strong></div>
          <div className="flex justify-between gap-2 text-xs"><span className="text-gov-muted">{ar ? `حد تنافسي سابق ${cutoff?.admissionYear ?? ''}` : `Past competitive cutoff ${cutoff?.admissionYear ?? ''}`}</span><strong className="whitespace-nowrap">{cutoff ? `${cutoff.cutoff}%` : (ar ? 'غير متاح' : 'Unavailable')}</strong></div>
          <Link to={`/roi?program=${encodeURIComponent(p.id)}`} className="btn-secondary w-full">{ar ? 'خطّط لكلفة هذا البرنامج' : 'Plan this program’s cost'}</Link>
        </article>;
      })}</div>
      {!selected.length && <p className="gov-card p-4">{ar ? 'لا تتوفر برامج الآن. جرّب تحديث المصادر.' : 'Programs are unavailable. Try refreshing the sources.'}</p>}
      <div className="gov-card p-4"><p className="text-xs text-gov-muted leading-relaxed">{ar ? 'شرط التقديم يختلف عن القبول التنافسي. الحدود السابقة للثانوية الأردنية لا تضمن القبول، ولا تنطبق أهلية العلمي تلقائيًا على الحقول الجديدة. الرسم للساعة فقط؛ الرسوم الإضافية والمعيشة تحسبها في خطتك.' : 'Application minimums differ from competitive cutoffs. Past Jordanian-certificate cutoffs do not guarantee admission. Scientific eligibility does not automatically apply to new fields. Credit fees exclude other fees and living costs.'}</p></div>
      <Link to={`/roi?program=${encodeURIComponent(selected[0]?.id ?? '')}`} className="btn-primary w-full">{ar ? 'حوّل المقارنة إلى خطة كلفة' : 'Turn this comparison into a cost plan'}</Link>
      <DataStatus sourceId="admhec-programs" compact /><DataStatus sourceId="admhec-cutoffs" compact />
    </main>
  </div>;
}
