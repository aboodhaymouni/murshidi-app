import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';

export default function Simulate() {
  const { lang } = useLang(); const ar = lang === 'ar';
  const [years, setYears] = useState(4); const [delay, setDelay] = useState(0); const [annual, setAnnual] = useState('3000');
  const cost = annual.trim() === '' ? NaN : Number(annual); const valid = Number.isFinite(cost) && cost >= 0 && cost <= 100000;
  const items = [
    { year: 2026, title: ar ? 'افهم خياراتك' : 'Understand your options', text: ar ? 'قارن البرامج وشروطها وكلفتها، وناقش القرار مع أسرتك.' : 'Compare programs, requirements and costs with your family.' },
    { year: 2027, title: ar ? 'جرّب المجال مبكرًا' : 'Try the field early', text: ar ? 'حدّد مشروعًا صغيرًا أو نشاطًا جامعيًا لتختبر اهتمامك.' : 'Choose a small project or university activity to test your interests.' },
    { year: 2026 + years + delay, title: ar ? 'موعد تخطيط للتخرّج' : 'Planned graduation point', text: ar ? 'هذا الموعد حسب سنواتك المدخلة، وليس توقعًا لمعدلك أو ضمانًا للتخرّج.' : 'This date follows your inputs; it does not predict grades or guarantee graduation.' },
  ];
  return <div className="min-h-screen bg-gov-bg pb-28"><PageHeader title={ar ? 'خطّة دراسة مرنة' : 'A flexible study plan'} subtitle={ar ? 'جرّب أثر الوقت على الكلفة' : 'Explore how time affects cost'} /><main className="max-w-3xl mx-auto p-4 space-y-4">
    <div className="gov-card p-4 space-y-4"><h2 className="font-bold text-lg text-gov-navy">{ar ? 'ماذا لو احتجت سنة إضافية؟' : 'What if you need an extra year?'}</h2><p className="text-sm text-gov-muted">{ar ? 'أداة تخطيط بافتراضات تختارها؛ لا تعطي احتمالات توظيف أو رواتب متوقعة.' : 'A planning exercise using your assumptions; no employment probabilities or salary predictions.'}</p>
      <label className="block text-sm">{ar ? `مدة الدراسة: ${years} سنوات` : `Study duration: ${years} years`}<input aria-label={ar ? 'مدة الدراسة' : 'Study duration'} type="range" min="2" max="6" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full min-h-[44px]" /></label>
      <label className="block text-sm">{ar ? 'كلفة سنة إضافية • افتراض بالدينار' : 'Cost of an additional year • assumed JOD'}<input type="number" min="0" max="100000" value={annual} onChange={e => setAnnual(e.target.value)} className="border border-gov-line rounded-lg p-3 w-full mt-2" /></label>
      <div className="flex gap-2">{[0, 1, 2].map(n => <button key={n} onClick={() => setDelay(n)} aria-pressed={delay === n} className={`${delay === n ? 'btn-primary' : 'btn-secondary'} flex-1`}>{ar ? (n === 0 ? 'بلا تأخير' : `+ ${n} سنة`) : (n === 0 ? 'No delay' : `+ ${n} year`)}</button>)}</div>
    </div>
    <div className="rounded-xl bg-gov-navy text-white p-5" aria-live="polite"><p className="text-sm">{ar ? 'الكلفة الإضافية في هذا السيناريو' : 'Additional cost in this scenario'}</p><p className="text-4xl font-bold mt-3">{valid ? (cost * delay).toLocaleString(ar ? 'ar-JO' : 'en-GB') : '—'} <span className="text-lg">{ar ? 'د.أ' : 'JOD'}</span></p><p className="mt-3 text-xs text-blue-100">{ar ? 'يفترض ثبات كلفة السنة، ولا يشمل دخلًا محتملًا ضائعًا أو تضخمًا.' : 'Assumes unchanged annual costs; excludes potential lost income and inflation.'}</p></div>
    <div className="gov-card p-4 divide-y divide-gov-line">{items.map((item, i) => <div key={i} className="py-4 flex gap-4"><strong className="text-gov-navy tabular">{item.year}</strong><div><h3 className="font-bold text-sm">{item.title}</h3><p className="mt-2 text-xs text-gov-muted leading-relaxed">{item.text}</p></div></div>)}</div>
    <Link to="/roi" className="btn-primary w-full">{ar ? 'ابنِ خطة الكلفة بالتفصيل' : 'Build a detailed cost plan'}</Link>
  </main></div>;
}
