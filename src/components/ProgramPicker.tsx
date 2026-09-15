import { useId, useState } from 'react';
import { Search } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { normalizedProgram, type ProgramChoice } from '../lib/planning';

export default function ProgramPicker({ programs, selected, onSelect, excluded = [] }: {
  programs: ProgramChoice[]; selected?: string; onSelect: (id: string) => void; excluded?: string[];
}) {
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const id = useId();
  const filtered = programs.filter(p => !excluded.includes(p.id) && normalizedProgram(`${p.program} ${p.university}`).includes(normalizedProgram(query)));
  return <div className="space-y-2">
    <label htmlFor={id} className="text-xs font-semibold text-gov-ink">{lang === 'ar' ? 'ابحث باسم التخصص أو الجامعة' : 'Search the official Arabic program or university name'}</label>
    <div className="relative"><Search size={16} className="absolute start-3 top-3.5 text-gov-muted" /><input id={id} className="w-full min-h-[44px] border border-gov-line rounded-lg ps-10 pe-3 text-sm bg-white" value={query} onChange={e => setQuery(e.target.value)} placeholder={lang === 'ar' ? 'مثال: علم الحاسوب' : 'Example: علم الحاسوب'} /></div>
    <p className="text-[11px] text-gov-muted" aria-live="polite">{lang === 'ar' ? `${filtered.length} برنامج مطابق • تظهر أول 30 نتيجة` : `${filtered.length} matches • first 30 shown`}</p>
    <div className="max-h-64 overflow-y-auto border border-gov-line rounded-lg divide-y divide-gov-line bg-white">
      {filtered.slice(0, 30).map(p => <button type="button" key={p.id} onClick={() => onSelect(p.id)} aria-pressed={selected === p.id} className={`w-full text-start p-3 min-h-[52px] ${selected === p.id ? 'bg-blue-50 border-s-4 border-gov-navy' : 'hover:bg-gov-bg-soft'}`} dir="rtl"><span className="block text-sm font-semibold text-gov-ink">{p.program}</span><span className="text-xs text-gov-muted">{p.university}</span></button>)}
      {!filtered.length && <p className="p-4 text-sm text-gov-muted">{lang === 'ar' ? 'لا توجد نتائج. جرّب كلمة أقصر.' : 'No results. Try a shorter term.'}</p>}
    </div>
  </div>;
}
