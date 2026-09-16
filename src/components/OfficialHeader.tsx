import MizanLogo from './MizanLogo';
import { UserRound, Info } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';

/**
 * The app's own masthead.
 *
 * It used to open with a government-style navy strip carrying the Hashemite
 * ornament, «المملكة الأردنيّة الهاشميّة» and «وزارة التعليم العالي والبحث العلمي»
 * with no qualifier, on every screen. Read plainly, that is a claim of official
 * standing the project does not have, so the strip is gone.
 *
 * What replaces it is the wording BrandSplash already uses: the app is an
 * independent guidance tool, and the Ministry is named only as the publisher of
 * the data the app reads — never as a partner, a sponsor or an endorsing body.
 * The line is permanent and unconditional, because the claim it corrects was.
 */
export default function OfficialHeader() {
  const { t } = useLang();
  const { isGuest } = useAuth();
  return (
    <div className="bg-white border-b border-gov-line safe-top">
      <div className="gov-strip" />

      {/* App identification */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        <MizanLogo size={40} showText variant="wordmark" />
        {/* Same guest marker PageHeader shows, so Home is not the one screen
            where guest mode is invisible. There is no notification system in
            this build, so no bell and no unread dot. */}
        {isGuest && (
          <span className="gov-badge gov-badge-neutral shrink-0" title={t('auth.guest.badgeTitle')}>
            <UserRound size={12} />
            {t('auth.guest.badge')}
          </span>
        )}
      </div>

      {/* What this app is, and what it is not. */}
      <div className="px-4 pb-2.5 flex items-start gap-1.5">
        <Info size={12} strokeWidth={2.2} className="text-gov-muted shrink-0 mt-[3px]" />
        <div className="min-w-0 text-start">
          <p className="text-[11px] font-semibold text-gov-body leading-snug">
            {t('tools.masthead.independent')}
          </p>
          <p className="text-[10px] text-gov-muted leading-snug mt-0.5">
            {t('tools.masthead.dataSource')}
          </p>
        </div>
      </div>
    </div>
  );
}
