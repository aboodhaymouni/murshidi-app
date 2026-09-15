import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, back = true, right }: Props) {
  const navigate = useNavigate();
  const { dir, t } = useLang();
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gov-line safe-top">
      <div className="h-1 bg-gov-gold" />
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        {back && (
          <button onClick={() => navigate('/home')} className="min-w-[44px] min-h-[44px] rounded-lg border border-gov-line flex items-center justify-center text-gov-body hover:bg-gov-bg-soft" aria-label={t('nav.home')}>
            <BackIcon size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gov-ink leading-snug">{title}</h1>
          {subtitle && <p className="text-xs text-gov-muted mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
