import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, UserRound } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

export default function PageHeader({ title, subtitle, back = true, right }: Props) {
  const navigate = useNavigate();
  const { dir, t } = useLang();
  const { isGuest } = useAuth();
  // In RTL, the back arrow points right (returning to previous, which is to the right);
  // in LTR, it points left.
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <div className="sticky top-0 z-40">
      <div className="gov-strip" />
      <div className="bg-white border-b border-gov-line safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          {back && (
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-md border border-gov-line flex items-center justify-center text-gov-body hover:bg-gov-bg-soft shrink-0"
              aria-label={t('btn.back')}
            >
              <BackIcon size={18} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gov-ink truncate leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-gov-muted truncate mt-0.5">{subtitle}</p>}
          </div>
          {/* Guest state is stated once, quietly. The way out of it lives on
              Profile, so this stays a label rather than a nag. */}
          {isGuest && (
            <span className="gov-badge gov-badge-neutral shrink-0" title={t('auth.guest.badgeTitle')}>
              <UserRound size={12} />
              {t('auth.guest.badge')}
            </span>
          )}
          {right}
        </div>
      </div>
    </div>
  );
}
