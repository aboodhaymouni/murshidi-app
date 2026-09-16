import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, BookMarked, ChevronLeft, ChevronRight, Compass, Download, Globe, LogIn, LogOut,
  Pencil, Share2, ShieldCheck, Trash2, UserRound, X,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import HashemiteEmblem from '../components/HashemiteEmblem';
import { useLang } from '../i18n/LangContext';
import type { TranslationKey } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';
import { StudyPathPicker } from '../components/PathPicker';
import {
  governorates, hasCompletePath, initialsOf, isNameAvailable, localizeCity, passwordHashMode, storedHashModeForUser,
  validateGrade,
} from '../lib/account';
import type { StudyPath } from '../lib/account';
import { isPathComplete, pathLabel } from '../lib/tawjihi';
import {
  buildExportBundle, downloadJson, getActivitySummary, getSavedMajors, getSavedReports,
  toggleSavedMajor,
} from '../lib/activity';
import type { ActivitySummary, SavedReport } from '../lib/activity';
import { majorsData } from '../data/majors';
import { isoDate, num } from '../lib/numerals';

const REPORT_TITLE_KEYS = {
  interests: 'profile.reports.interests',
  roi: 'profile.reports.roi',
  compare: 'profile.reports.compare',
} as const satisfies Record<SavedReport['kind'], TranslationKey>;

const REPORT_ROUTES: Record<SavedReport['kind'], string> = {
  interests: '/personality',
  roi: '/roi',
  compare: '/compare',
};

function majorName(id: string, lang: 'ar' | 'en'): string {
  const major = majorsData.find((m) => m.id === id);
  if (!major) return id;
  return lang === 'ar' ? major.nameAr : major.nameEn;
}

/**
 * Arabic agrees its counted noun with the number — one, two, 3–10 and 11+ each
 * take a different form, and «2 تخصّص محفوظ» is wrong. One and two carry the
 * count in the word itself, so the digit is dropped for those.
 */
function savedCountLabel(n: number): { key: TranslationKey; showDigit: boolean } {
  if (n === 1) return { key: 'profile.savedMajors.countOne', showDigit: false };
  if (n === 2) return { key: 'profile.savedMajors.countTwo', showDigit: false };
  if (n <= 10) return { key: 'profile.savedMajors.countFew', showDigit: true };
  return { key: 'profile.savedMajors.count', showDigit: true };
}

export default function Profile() {
  const { t, lang, toggleLang, dir } = useLang();
  const navigate = useNavigate();
  const { user, isGuest, signOut, deleteAccount } = useAuth();
  const ChevronEnd = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<TranslationKey | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Counts are read straight from the device store for whoever is signed in
  // now, so signing out swaps the numbers instead of leaving stale ones on screen.
  const scope = user ? user.id : 'guest';
  const summary = useMemo<ActivitySummary>(() => getActivitySummary(scope), [scope]);
  const reports = useMemo<SavedReport[]>(() => getSavedReports(scope), [scope]);
  const [savedMajors, setSavedMajors] = useState<string[]>(() => getSavedMajors(scope));

  // The privacy list below states what happened to the password. Which of the
  // two lines is true depends on whether this origin has WebCrypto at all.
  // Describe the record this account actually carries, not what the browser in
  // front of us could produce now — they differ for an account made over http.
  const degraded = useMemo(
    () => (user ? storedHashModeForUser(user.id) : passwordHashMode()) === 'checksum',
    [user],
  );

  const removeSaved = useCallback(
    (id: string) => {
      toggleSavedMajor(id, scope);
      setSavedMajors(getSavedMajors(scope));
    },
    [scope],
  );

  const exportData = useCallback(() => {
    const bundle = buildExportBundle(user, isGuest);
    const stamp = bundle.exportedAt.slice(0, 10);
    const ok = downloadJson(`murshidi-data-${stamp}.json`, bundle);
    setNotice(ok ? 'profile.export.done' : 'profile.export.failed');
  }, [user, isGuest]);

  const shareApp = useCallback(async () => {
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: t('app.name'), text: t('app.tagline'), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice('profile.share.copied');
    } catch {
      setNotice('profile.share.failed');
    }
  }, [t]);

  const memberYear = user ? new Date(user.createdAt).getFullYear().toString() : null;
  const hasActivity = summary.toolsUsed + savedMajors.length + summary.savedReports > 0;

  return (
    <div className="min-h-screen bg-gov-bg pb-28">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} back={false} />

      {/* Identity */}
      <div className="bg-white border-b border-gov-line p-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-md bg-gov-navy text-white flex items-center justify-center text-base font-bold shrink-0">
              {initialsOf(user.name, lang)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gov-ink truncate">{user.name}</p>
              <p className="text-[11px] text-gov-muted mt-0.5 truncate">
                {t('pages.home.studentLabel')}
                {user.city ? ` · ${localizeCity(user.city, lang)}` : ''}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {user.grade === null ? (
                  <span className="gov-badge gov-badge-neutral">{t('profile.noGrade')}</span>
                ) : (
                  <span className="gov-badge gov-badge-info tabular">
                    {t('profile.gradeLabel')}: {user.grade}
                  </span>
                )}
                <span className="gov-badge gov-badge-neutral">
                  {t('profile.pathLabel')}:{' '}
                  {hasCompletePath(user) ? pathLabel(user.path, lang) : t('auth.path.none')}
                </span>
                {memberYear && (
                  <span className="gov-badge gov-badge-neutral tabular">
                    {t('profile.memberSince')} {memberYear}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-md bg-gov-bg border border-gov-line text-gov-navy flex items-center justify-center shrink-0">
                <UserRound size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gov-ink">{t('profile.guest.title')}</p>
                <p className="text-[11.5px] text-gov-muted leading-relaxed mt-0.5">
                  {t('profile.guest.desc')}
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/auth')} className="btn-primary w-full mt-3">
              <LogIn size={15} />
              {t('profile.guest.cta')}
            </button>
          </div>
        )}
      </div>

      {/* The study path — the one fact the rest of the app reads */}
      <div className="bg-white border-b border-gov-line px-4 py-3">
        {user && !hasCompletePath(user) && (
          <div className="rounded-gov border border-gov-gold/50 bg-gov-bg-soft p-3 mb-2">
            <p className="text-[12.5px] font-bold text-gov-ink text-start">{t('profile.path.set')}</p>
            <p className="text-[11.5px] text-gov-muted leading-relaxed mt-1 text-start">
              {t('profile.path.setSub')}
            </p>
            <button onClick={() => navigate('/profile/edit')} className="btn-secondary w-full mt-2">
              {t('profile.edit.open')}
            </button>
          </div>
        )}
        <button
          onClick={() => navigate('/field')}
          className="w-full flex items-center gap-3 text-start rounded-gov border border-gov-line px-3 py-2.5 hover:bg-gov-bg-soft transition-colors"
        >
          <div className="w-9 h-9 rounded-md bg-gov-navy/10 flex items-center justify-center text-gov-navy shrink-0">
            <Compass size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gov-ink">{t('profile.field.open')}</p>
            <p className="text-[11px] text-gov-muted mt-0.5 leading-relaxed">{t('profile.field.openSub')}</p>
          </div>
          <ChevronEnd size={16} className="text-gov-muted shrink-0" />
        </button>
      </div>

      {/* Activity — counted, never invented */}
      <div className="bg-white border-b border-gov-line px-4 py-3">
        <p className="gov-section-title mb-2">{t('profile.activity')}</p>
        <div className="grid grid-cols-3 gap-2">
          <ActivityCard label={t('profile.activity.toolsUsed')} value={summary.toolsUsed} />
          <ActivityCard label={t('profile.activity.savedMajors')} value={savedMajors.length} />
          <ActivityCard label={t('profile.activity.savedReports')} value={summary.savedReports} />
        </div>
        <p className="text-[10.5px] text-gov-muted leading-relaxed mt-2">
          {hasActivity ? t('profile.activity.note') : t('profile.activity.empty')}
        </p>
      </div>

      {notice && (
        <div className="px-4 pt-3">
          <p role="status" className="text-[12px] text-gov-body bg-white border border-gov-line rounded-gov px-3 py-2">
            {t(notice)}
          </p>
        </div>
      )}

      {/* Language */}
      <div className="p-4">
        <div className="gov-card overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gov-navy/10 flex items-center justify-center text-gov-navy shrink-0">
              <Globe size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gov-ink">{t('profile.item.language')}</p>
              <p className="text-[11px] text-gov-muted mt-0.5">
                {lang === 'ar' ? 'العربيّة' : 'English'}
              </p>
            </div>
            <div className="bg-gov-bg p-0.5 rounded-md border border-gov-line flex items-center shrink-0">
              <button
                type="button"
                onClick={() => lang !== 'ar' && toggleLang()}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  lang === 'ar' ? 'bg-gov-navy text-white' : 'text-gov-muted'
                }`}
              >
                AR
              </button>
              <button
                type="button"
                onClick={() => lang !== 'en' && toggleLang()}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  lang === 'en' ? 'bg-gov-navy text-white' : 'text-gov-muted'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My data */}
      <div className="px-4 space-y-4">
        <div>
          <h3 className="gov-section-title mb-2">{t('profile.section.data')}</h3>
          <div className="gov-card divide-y divide-gov-line">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-gov-ink">{t('profile.reports.title')}</p>
              {reports.length === 0 ? (
                <p className="text-[11.5px] text-gov-muted mt-1">{t('profile.reports.none')}</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {reports.map((report) => (
                    <li key={report.id}>
                      <button
                        onClick={() => navigate(REPORT_ROUTES[report.kind])}
                        className="w-full flex items-center gap-2 text-start px-2 py-2 rounded-gov border border-gov-line hover:bg-gov-bg-soft"
                      >
                        <Award size={15} className="text-gov-navy shrink-0" />
                        <span className="flex-1 min-w-0 text-[12.5px] text-gov-body truncate">
                          {t(REPORT_TITLE_KEYS[report.kind])}
                        </span>
                        {report.at && (
                          <span className="text-[10.5px] text-gov-muted tabular shrink-0" dir="ltr">
                            {isoDate(report.at)}
                          </span>
                        )}
                        <ChevronEnd size={15} className="text-gov-muted shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-gov-ink">{t('profile.activity.savedMajors')}</p>
              {savedMajors.length === 0 ? (
                <p className="text-[11.5px] text-gov-muted mt-1 leading-relaxed">
                  {t('profile.savedMajors.none')}
                </p>
              ) : (
                <>
                  <p className="text-[11.5px] text-gov-muted mt-1">
                    {savedCountLabel(savedMajors.length).showDigit && (
                      <span className="tabular">{num(savedMajors.length)} </span>
                    )}
                    {t(savedCountLabel(savedMajors.length).key)}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {savedMajors.map((id) => (
                      <li
                        key={id}
                        className="flex items-center gap-2 rounded-gov border border-gov-line px-2 py-1.5"
                      >
                        <BookMarked size={14} className="text-gov-navy shrink-0" />
                        <span className="flex-1 min-w-0 text-[12.5px] text-gov-body truncate text-start">
                          {majorName(id, lang)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSaved(id)}
                          aria-label={t('profile.savedMajors.remove')}
                          title={t('profile.savedMajors.remove')}
                          className="w-11 h-11 -my-2 rounded-gov flex items-center justify-center text-gov-muted hover:bg-gov-bg-soft shrink-0"
                        >
                          <X size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <button
              onClick={exportData}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gov-bg-soft text-start transition-colors"
            >
              <div className="w-9 h-9 rounded-md bg-gov-bg flex items-center justify-center text-gov-navy shrink-0">
                <Download size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gov-ink">{t('profile.export.title')}</p>
                <p className="text-[11px] text-gov-muted mt-0.5 leading-relaxed">{t('profile.export.sub')}</p>
              </div>
              <ChevronEnd size={16} className="text-gov-muted shrink-0" />
            </button>
          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="gov-section-title mb-2">{t('profile.section.account')}</h3>
          <div className="gov-card divide-y divide-gov-line">
            {user && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gov-bg-soft text-start transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-gov-bg flex items-center justify-center text-gov-navy shrink-0">
                  <Pencil size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gov-ink">{t('profile.edit.open')}</p>
                  <p className="text-[11px] text-gov-muted mt-0.5">{t('profile.edit.openSub')}</p>
                </div>
                <ChevronEnd size={16} className="text-gov-muted shrink-0" />
              </button>
            )}

            <button
              onClick={() => setShowPrivacy((v) => !v)}
              aria-expanded={showPrivacy}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gov-bg-soft text-start transition-colors"
            >
              <div className="w-9 h-9 rounded-md bg-gov-bg flex items-center justify-center text-gov-green shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gov-ink">{t('profile.privacy.title')}</p>
              </div>
              <ChevronEnd
                size={16}
                className={`text-gov-muted shrink-0 transition-transform ${showPrivacy ? 'rotate-90' : ''}`}
              />
            </button>
            {showPrivacy && (
              <div className="px-4 py-3 bg-gov-bg-soft">
                <ul className="space-y-1.5">
                  {([
                    'auth.privacy.noId',
                    'auth.privacy.local',
                    degraded ? 'auth.privacy.hashWeak' : 'auth.privacy.hash',
                    'auth.privacy.ai',
                    'auth.privacy.wipe',
                  ] as TranslationKey[]).map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-gov-muted shrink-0 mt-2" />
                      <span className="text-[11.5px] text-gov-muted leading-relaxed">{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={shareApp}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gov-bg-soft text-start transition-colors"
            >
              <div className="w-9 h-9 rounded-md bg-gov-bg flex items-center justify-center text-gov-navy shrink-0">
                <Share2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gov-ink">{t('profile.share.title')}</p>
              </div>
              <ChevronEnd size={16} className="text-gov-muted shrink-0" />
            </button>
          </div>
        </div>

        {/* Sensitive actions */}
        {(user || isGuest) && (
          <div>
            <h3 className="gov-section-title mb-2">{t('profile.section.danger')}</h3>
            <div className="space-y-2">
              <button
                onClick={signOut}
                className="w-full min-h-[44px] rounded-gov border border-gov-line bg-white text-gov-body text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gov-bg-soft"
              >
                <LogOut size={15} />
                {user ? t('profile.signOut.title') : t('profile.signOut.guest')}
              </button>

              {user && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full min-h-[44px] rounded-gov border border-gov-danger/30 bg-white text-gov-danger text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  {t('profile.delete.title')}
                </button>
              )}

              {user && confirmDelete && (
                <div role="alertdialog" aria-label={t('profile.delete.confirmTitle')}
                  className="rounded-gov-lg border border-gov-danger/40 bg-white p-4">
                  <p className="text-sm font-bold text-gov-danger">{t('profile.delete.confirmTitle')}</p>
                  <p className="text-[12px] text-gov-body leading-relaxed mt-1.5">
                    {t('profile.delete.confirmBody')}
                  </p>
                  <div className="flex flex-col gap-2 mt-3">
                    <button
                      onClick={deleteAccount}
                      className="w-full min-h-[44px] rounded-gov bg-gov-danger text-white text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={15} />
                      {t('profile.delete.confirmCta')}
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="btn-secondary w-full">
                      {t('profile.delete.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 mt-6">
        <div className="bg-white border border-gov-line rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HashemiteEmblem size={24} />
          </div>
          {/* The emblem and the two names are here because the data on the
              screens above is published by that ministry — not because anyone
              endorsed this app. The two lines below say so, in that order, and
              must not be removed while the emblem stays. */}
          <p className="text-[11px] font-semibold text-gov-body">{t('app.kingdom')}</p>
          <p className="text-[11px] text-gov-muted">{t('app.ministry')}</p>
          <div className="my-2 h-px bg-gov-line" />
          <p className="text-[10.5px] font-semibold text-gov-body leading-relaxed">
            {t('profile.footer.independent')}
          </p>
          <p className="text-[10px] text-gov-muted leading-relaxed mt-1">
            {t('profile.footer.dataSource')}
          </p>
          <div className="my-2 h-px bg-gov-line" />
          <p className="text-[10px] text-gov-muted">{t('app.name')} · {t('app.version')}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gov-line rounded-gov p-3 text-center">
      <p className="text-lg font-bold tabular text-gov-ink">{value}</p>
      <p className="text-[10px] text-gov-muted mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

export function ProfileEdit() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const cities = useMemo(() => governorates(lang), [lang]);
  const [name, setName] = useState(user?.name ?? '');
  const [grade, setGrade] = useState(user?.grade === null || user?.grade === undefined ? '' : String(user.grade));
  const [city, setCity] = useState(user?.city ?? '');
  const [path, setPath] = useState<StudyPath | null>(user?.path ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // The route is wrapped in RequireAuth mode="account", so a signed-out visitor
  // never reaches this; the check keeps the types honest.
  if (!user) return null;

  const cityOptions = cities.includes(city) || city === '' ? cities : [city, ...cities];

  const save = () => {
    setSaved(false);
    setError(null);
    const parsed = validateGrade(grade);
    if (!parsed.ok) {
      setError(t('auth.error.grade'));
      return;
    }
    const clean = name.trim().replace(/\s+/g, ' ');
    if (clean.length < 2 || !isNameAvailable(clean, user.id)) {
      setError(t('profile.edit.error'));
      return;
    }
    // A half-chosen path is worse than none: the rest of the app would show a
    // track with no college list behind it. Either it is complete or it is null.
    if (path && !isPathComplete(path)) {
      setError(t('auth.error.path'));
      return;
    }
    updateProfile({
      name: clean,
      grade: parsed.grade,
      city: city || cities[0],
      path,
    });
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-gov-bg pb-28">
      <PageHeader title={t('profile.edit.title')} subtitle={t('profile.edit.subtitle')} />
      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="gov-card p-5 space-y-4">
          <div>
            <label className="gov-label" htmlFor="edit-name">{t('auth.field.name')}</label>
            <input
              id="edit-name"
              className="gov-input"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              maxLength={60}
              autoComplete="name"
            />
          </div>

          <StudyPathPicker
            value={path}
            onChange={(next) => { setPath(next); setSaved(false); }}
            idPrefix="edit"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="gov-label" htmlFor="edit-grade">{t('auth.field.grade')}</label>
              <input
                id="edit-grade"
                className="gov-input tabular"
                value={grade}
                onChange={(e) => { setGrade(e.target.value.replace(/[^\d.]/g, '')); setSaved(false); }}
                placeholder={t('auth.field.gradePh')}
                inputMode="decimal"
                maxLength={5}
              />
            </div>
            <div>
              <label className="gov-label" htmlFor="edit-city">{t('auth.field.city')}</label>
              <select
                id="edit-city"
                className="gov-input"
                value={city || cities[0]}
                onChange={(e) => { setCity(e.target.value); setSaved(false); }}
              >
                {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-gov-danger leading-relaxed">{error}</p>}
          {saved && <p role="status" className="text-sm text-gov-green font-semibold">{t('profile.edit.saved')}</p>}

          <div className="flex flex-col gap-2">
            <button onClick={save} className="btn-primary w-full">{t('profile.edit.save')}</button>
            <button onClick={() => navigate('/profile')} className="btn-secondary w-full">
              {t('profile.edit.cancel')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
