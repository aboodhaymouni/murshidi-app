import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Info, LogIn, ShieldCheck, TriangleAlert, UserPlus, UserRound } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import type { AuthRedirectState } from '../components/RequireAuth';
import { StudyPathPicker } from '../components/PathPicker';
import { useLang } from '../i18n/LangContext';
import type { TranslationKey } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';
import { governorates, passwordHashMode, validateGrade } from '../lib/account';
import type { AuthError } from '../lib/account';
import { isPathComplete } from '../lib/tawjihi';
import type { StudyPath } from '../lib/tawjihi';

const ERROR_KEYS = {
  'name-taken': 'auth.error.nameTaken',
  'not-found': 'auth.error.notFound',
  'wrong-password': 'auth.error.wrongPassword',
  invalid: 'auth.error.invalid',
  storage: 'auth.error.storage',
  'unverifiable-here': 'auth.error.unverifiableHere',
} as const satisfies Record<AuthError, TranslationKey>;

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useLang();
  const { user, isGuest, signIn, signUp, signOut, continueAsGuest } = useAuth();

  const redirect = (location.state ?? null) as AuthRedirectState | null;
  const destination = redirect?.from && redirect.from !== '/auth' ? redirect.from : '/home';
  const gateReason = redirect?.reason;

  const cities = useMemo(() => governorates(lang), [lang]);

  // What this browsing context can actually do to a password. On a plain-http
  // origin `crypto.subtle` does not exist, so the copy below changes with it
  // rather than claiming SHA-256 regardless of what the code did.
  const hashMode = useMemo(() => passwordHashMode(), []);
  const degraded = hashMode === 'checksum';

  const [tab, setTab] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [city, setCity] = useState<string>('');
  const [path, setPath] = useState<StudyPath | null>(null);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const privacyKeys: TranslationKey[] = [
    'auth.privacy.noId',
    'auth.privacy.local',
    degraded ? 'auth.privacy.hashWeak' : 'auth.privacy.hash',
    'auth.privacy.ai',
    'auth.privacy.wipe',
  ];

  const go = (to: string) => navigate(to, { replace: true });

  if (user) {
    return (
      <div className="min-h-screen bg-gov-bg pb-28">
        <PageHeader title={t('auth.title')} subtitle={t('auth.subtitle')} back={false} />
        <main className="max-w-3xl mx-auto p-4 space-y-3">
          <div className="gov-card p-5 text-center">
            <p className="text-sm font-semibold text-gov-ink">{t('auth.already.title')}</p>
            <p className="text-sm text-gov-body mt-1">{user.name}</p>
            <button onClick={() => go(destination)} className="btn-primary w-full mt-4">
              {t('auth.already.continue')}
            </button>
            <button onClick={signOut} className="btn-secondary w-full mt-2">
              {t('auth.already.switch')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === 'up') {
      const parsed = validateGrade(grade);
      if (!parsed.ok) {
        setError(t('auth.error.grade'));
        return;
      }
      if (!path) {
        setError(t('auth.error.track'));
        return;
      }
      if (!isPathComplete(path)) {
        setError(t('auth.error.path'));
        return;
      }
      setBusy(true);
      const result = await signUp({
        name,
        password,
        grade: parsed.grade,
        city: city || cities[0],
        path,
      });
      setBusy(false);
      if (result.ok) {
        go(destination);
        return;
      }
      setError(t(ERROR_KEYS[result.error ?? 'invalid']));
      return;
    }

    setBusy(true);
    const result = await signIn(name, password);
    setBusy(false);
    if (result.ok) {
      go(destination);
      return;
    }
    setError(t(ERROR_KEYS[result.error ?? 'invalid']));
  };

  const asGuest = () => {
    continueAsGuest();
    go(destination);
  };

  return (
    <div className="min-h-screen bg-gov-bg pb-10">
      <PageHeader title={t('auth.title')} subtitle={t('auth.subtitle')} back={isGuest && !gateReason} />

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {gateReason && (
          <div
            role="status"
            className="bg-white border border-gov-line rounded-gov-lg p-3 flex items-start gap-2"
          >
            <Info size={15} className="text-gov-navy shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-gov-body leading-relaxed">
              {gateReason === 'account' ? t('auth.gate.accountNeeded') : t('auth.gate.signInNeeded')}
            </p>
          </div>
        )}

        <p className="text-[12.5px] text-gov-muted leading-relaxed text-start">{t('auth.doors.hint')}</p>

        {/* The password promise, matched to what this origin can actually do. */}
        {degraded && (
          <div
            role="status"
            className="bg-white border border-gov-gold/50 rounded-gov-lg p-3 flex items-start gap-2"
          >
            <TriangleAlert size={15} className="text-gov-gold shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold text-gov-ink text-start">{t('auth.insecure.title')}</p>
              <p className="text-[11.5px] text-gov-body leading-relaxed mt-1 text-start">
                {t('auth.insecure.body')}
              </p>
            </div>
          </div>
        )}

        {/* Door 1 + 2 — sign in / create account */}
        <div className="gov-card p-1.5 grid grid-cols-2 gap-1.5">
          {(['in', 'up'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => { setTab(k); setError(null); }}
              aria-pressed={tab === k}
              className={`min-h-[44px] rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
                tab === k ? 'bg-gov-navy text-white' : 'text-gov-muted'
              }`}
            >
              {k === 'in' ? <LogIn size={15} /> : <UserPlus size={15} />}
              {k === 'in' ? t('auth.tab.signIn') : t('auth.tab.signUp')}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="gov-card p-5 space-y-4">
          <div>
            <label className="gov-label" htmlFor="auth-name">{t('auth.field.name')}</label>
            <input
              id="auth-name"
              className="gov-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.field.namePh')}
              maxLength={60}
              autoComplete="name"
            />
            {tab === 'up' && <p className="gov-hint">{t('auth.field.nameHint')}</p>}
          </div>

          {tab === 'up' && (
            <>
              <StudyPathPicker value={path} onChange={setPath} idPrefix="auth" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="gov-label" htmlFor="auth-grade">{t('auth.field.grade')}</label>
                  <input
                    id="auth-grade"
                    className="gov-input tabular"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder={t('auth.field.gradePh')}
                    inputMode="decimal"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="gov-label" htmlFor="auth-city">{t('auth.field.city')}</label>
                  <select
                    id="auth-city"
                    className="gov-input"
                    value={city || cities[0]}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <p className="gov-hint -mt-2">{t('auth.field.gradeHint')}</p>
            </>
          )}

          <div>
            <label className="gov-label" htmlFor="auth-pw">{t('auth.field.password')}</label>
            {/* The field itself is ltr so a Latin password reads correctly; the
                wrapper shares that direction so the toggle lands on the same
                side as the padding reserved for it, in both languages. */}
            <div className="relative" dir="ltr">
              <input
                id="auth-pw"
                type={showPw ? 'text' : 'password'}
                className="gov-input text-start pe-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.field.passwordPh')}
                autoComplete={tab === 'in' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? t('auth.hidePassword') : t('auth.showPassword')}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-gov-muted p-1.5"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-gov-danger leading-relaxed">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? t('auth.submit.busy') : tab === 'in' ? t('auth.submit.signIn') : t('auth.submit.signUp')}
          </button>
        </form>

        {/* Door 3 — guest */}
        <div className="gov-card p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-gov-bg flex items-center justify-center text-gov-navy shrink-0">
              <UserRound size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gov-ink">{t('auth.guest.title')}</p>
              <p className="text-[12px] text-gov-muted leading-relaxed mt-0.5">{t('auth.guest.desc')}</p>
            </div>
          </div>
          <button type="button" onClick={asGuest} className="btn-secondary w-full mt-3">
            {t('auth.guest.cta')}
          </button>
        </div>

        {/* Privacy — stated at the level it actually is */}
        <div className="bg-white border border-gov-line rounded-gov-lg p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-gov-ink">
            <ShieldCheck size={15} className="text-gov-green shrink-0" />
            {t('auth.privacy.title')}
          </p>
          <ul className="mt-2 space-y-1.5">
            {privacyKeys.map((key) => (
              <li key={key} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-gov-muted shrink-0 mt-2" />
                <span className="text-[11.5px] text-gov-muted leading-relaxed">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
