import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calculator, BarChart3, MessageCircle, User } from 'lucide-react';
import { useKeyboardOpen } from '../hooks/useKeyboardOpen';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import type { TranslationKey } from '../i18n/translations';

// Six tabs is the ceiling at 375px: each one still clears a 44px tap target and
// each label still fits on one line. «حقلي» / "My field" is deliberately the
// short form of the screen's own title for that reason — the full «حقلي وكلياتي»
// would wrap and push the bar out of shape.
const items: { to: string; key: TranslationKey; icon: typeof Home }[] = [
  { to: '/home', key: 'nav.home', icon: Home },
  { to: '/roi', key: 'nav.calculator', icon: Calculator },
  { to: '/market', key: 'nav.market', icon: BarChart3 },
  { to: '/chat', key: 'nav.consultation', icon: MessageCircle },
  { to: '/profile', key: 'nav.profile', icon: User },
];

const HIDDEN_ON = new Set(['/', '/auth']);

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const keyboardOpen = useKeyboardOpen();
  const { t } = useLang();
  const { user, isGuest, ready } = useAuth();

  // The splash and the three doors are chrome-free, and nothing is navigable
  // until the visitor has an identity — otherwise the bar flashes behind a
  // redirect to /auth.
  if (HIDDEN_ON.has(location.pathname) || keyboardOpen) return null;
  if (!ready || (!user && !isGuest)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gov-line"
      style={{
        boxShadow: '0 -4px 20px -4px rgba(1, 48, 112, 0.10)',
      }}
    >
      <div className="safe-bottom">
        <div className="flex items-stretch h-16 px-1">
          {items.map(({ to, key, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 mx-0.5 my-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gov-navy/[0.08] text-gov-navy'
                    : 'text-gov-muted hover:text-gov-body active:bg-gov-bg-soft'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <span className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {to === '/profile' && isGuest && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-0.5 -end-0.5 w-1.5 h-1.5 rounded-full bg-gov-gold"
                    />
                  )}
                </span>
                <span className={`text-[10.5px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {t(key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
