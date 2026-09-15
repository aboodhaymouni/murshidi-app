import MizanLogo from './MizanLogo';
import { Globe } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

export default function OfficialHeader() {
  const { lang, toggleLang } = useLang();
  return (
    <header className="bg-white border-b border-gov-line safe-top">
      <div className="h-1 bg-gov-gold" />
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <MizanLogo size={44} showText variant="wordmark" />
        <button onClick={toggleLang} className="min-w-[44px] min-h-[44px] px-3 rounded-lg border border-gov-line text-gov-navy flex items-center gap-2 text-xs font-bold" aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
          <Globe size={16} /><span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
        </button>
      </div>
    </header>
  );
}
