import { useState } from 'react';
import { UserRound, Globe, ShieldCheck, Save } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';

interface LocalProfile { name: string; stage: string; }
const storageKey = 'murshidi.profile';
function readProfile(): LocalProfile {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string' && 'stage' in value && typeof value.stage === 'string') {
      return { name: value.name.slice(0, 60), stage: ['school','university','parent'].includes(value.stage) ? value.stage : 'school' };
    }
  } catch { /* A local profile is optional when storage is unavailable. */ }
  return { name: '', stage: 'school' };
}

export default function Profile() {
  const { lang, setLang } = useLang();
  const ar = lang === 'ar';
  const [profile, setProfile] = useState(readProfile);
  const [status, setStatus] = useState<'saved' | 'error' | null>(null);
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    try { localStorage.setItem(storageKey, JSON.stringify({ ...profile, name: profile.name.trim() })); setStatus('saved'); }
    catch { setStatus('error'); }
  };
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar?'ملفك وإعداداتك':'Your profile & settings'} subtitle={ar?'مساحة محفوظة على هذا الجهاز':'A space saved on this device'} back={false}/>
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <section className="rounded-2xl bg-gov-navy p-5 text-white flex items-center gap-4"><div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><UserRound size={28} className="text-gov-gold"/></div><div><h1 className="text-lg font-bold">{ar?'رحلتك تبدأ منك.':'Your journey starts with you.'}</h1><p className="text-xs text-white/80 mt-1">{ar?'لا يلزم إنشاء حساب لتجربة مُرشِدي.':'No account is required to explore Murshidi.'}</p></div></section>
      <form onSubmit={save} className="gov-card p-5 space-y-4">
        <h2 className="text-base font-bold">{ar?'عرّف بنفسك، إذا أحببت':'Introduce yourself, if you like'}</h2>
        <div><label className="gov-label" htmlFor="profile-name">{ar?'الاسم المفضل (اختياري)':'Preferred name (optional)'}</label><input id="profile-name" maxLength={60} autoComplete="nickname" className="gov-input" value={profile.name} onChange={e=>{setProfile({...profile,name:e.target.value});setStatus(null);}}/></div>
        <div><label className="gov-label" htmlFor="profile-stage">{ar?'أستخدم مُرشِدي بصفتي':'I use Murshidi as'}</label><select id="profile-stage" value={profile.stage} className="gov-input" onChange={e=>{setProfile({...profile,stage:e.target.value});setStatus(null);}}><option value="school">{ar?'طالب/طالبة ثانوية':'A secondary school student'}</option><option value="university">{ar?'طالب/طالبة جامعة':'A university student'}</option><option value="parent">{ar?'ولي أمر':'A parent or guardian'}</option></select></div>
        <button type="submit" className="btn-primary w-full"><Save size={16}/>{ar?'حفظ على هذا الجهاز':'Save on this device'}</button>
        {status && <p role="status" className={'text-sm '+(status==='saved'?'text-gov-green':'text-gov-danger')}>{status==='saved'?(ar?'حُفظ ملفك على هذا الجهاز.':'Your profile is saved on this device.'):(ar?'تعذّر الحفظ في المتصفح. يمكنك متابعة استخدام التطبيق دون ملف.':'Browser storage is unavailable. You can keep using the app without a profile.')}</p>}
      </form>
      <section className="gov-card p-5"><div className="flex items-center gap-3 mb-4"><Globe size={22} className="text-gov-navy"/><h2 className="text-base font-bold">{ar?'لغة الواجهة':'Interface language'}</h2></div><div className="grid grid-cols-2 gap-3">{(['ar','en'] as const).map(l=><button key={l} onClick={()=>setLang(l)} aria-pressed={lang===l} className={'min-h-[44px] px-4 py-2 rounded-lg border font-semibold '+(lang===l?'bg-gov-navy border-gov-navy text-white':'border-gov-line text-gov-navy')}>{l==='ar'?'العربية':'English'}</button>)}</div></section>
      <section className="gov-card p-5"><ShieldCheck size={23} className="text-gov-green"/><h2 className="font-bold text-base mt-3">{ar?'بياناتك واضحة لك':'Your data, explained'}</h2><p className="text-sm text-gov-body leading-loose mt-2">{ar?'الاسم والصفة محفوظان في متصفح هذا الجهاز فقط، ولا يُرسلان مع تحديث البيانات العامة. لا نطلب رقمًا وطنيًا. روابط الجهات الخارجية تخضع لسياسات تلك الجهات.':'Your name and role stay in this browser and are not sent with public-data updates. We do not request a national ID. External links are governed by the destination’s policies.'}</p></section>
      <p className="text-xs text-gov-muted text-center">مُرشِدي • Murshidi • Vcoders • 2026</p>
    </main>
  </div>;
}
