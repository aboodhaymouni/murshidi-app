import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CheckCircle2 } from 'lucide-react';
import OfficialHeader from '../components/OfficialHeader';
import { useLang } from '../i18n/LangContext';

export default function Splash() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const ar = lang === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const points = ar ? [
    ['افهم خياراتك', 'برامج جامعية ورسوم من مصادر عامة رسمية.'],
    ['قارن بوضوح', 'معدلك وميزانيتك وميولك في قرار واحد.'],
    ['تحقّق من المصدر', 'سنة المرجع وحالة التحديث ظاهرتان أمامك.'],
  ] : [
    ['Know your options', 'University programs and fees from official public sources.'],
    ['Compare clearly', 'Bring your grade, budget and interests into one decision.'],
    ['Check the source', 'See the reference period and update status.'],
  ];
  return (
    <div className="min-h-screen bg-white">
      <OfficialHeader />
      <main className="max-w-3xl mx-auto px-6 py-8 md:py-14">
        <span className="gov-badge gov-badge-info">{ar ? 'مُرشِدي • فريق Vcoders' : 'Murshidi • Team Vcoders'}</span>
        <div className="w-20 h-20 rounded-2xl bg-gov-navy text-gov-gold flex items-center justify-center my-6"><BookOpen size={38} /></div>
        <h1 className="text-3xl md:text-5xl font-bold text-gov-navy leading-snug">{ar ? 'مستقبلك يستحق قرارًا أوضح.' : 'Your future deserves a clearer decision.'}</h1>
        <p className="text-base text-gov-body leading-loose mt-4 mb-7">{ar ? 'من حيرة التخصص إلى مقارنة تفهمها أنت وعائلتك. استكشف الخيارات، احسب الكلفة، وارجع للمعلومة الأصلية.' : 'From uncertainty to a comparison you and your family understand. Explore programs, estimate costs, and follow every fact to its source.'}</p>
        <div className="space-y-4">
          {points.map(([title, desc]) => <div key={title} className="flex gap-3"><CheckCircle2 size={21} className="text-gov-green shrink-0 mt-1" /><div><h2 className="text-sm font-bold text-gov-ink">{title}</h2><p className="text-sm text-gov-muted mt-1">{desc}</p></div></div>)}
        </div>
        <button onClick={() => navigate('/home')} className="btn-primary w-full mt-8"><Calculator size={18} />{ar ? 'ابدأ رحلتك' : 'Explore your options'}<Arrow size={18} /></button>
        <p className="text-xs text-gov-muted leading-relaxed mt-4 text-center">{ar ? 'مشروع طلابي مستقل لدعم القرار الأكاديمي. القرار والقبول النهائي لدى الطالب والجهات المختصة.' : 'An independent student project for academic decision support. Admission decisions remain with the relevant institutions.'}</p>
      </main>
    </div>
  );
}
