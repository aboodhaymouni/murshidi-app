import { useNavigate } from 'react-router-dom';
import {
  Calculator, BarChart3, Sparkles, Brain, Users, MessageCircle,
  TrendingUp, GraduationCap, Wallet, ChevronLeft, ChevronRight, FileText, CheckCircle2,
  Landmark,
} from 'lucide-react';
import OfficialHeader from '../components/OfficialHeader';
import SourceNote from '../components/SourceNote';
import { jobMarketTrends, nationalStats, dosUnemployment, DATASET_SOURCES } from '../data/majors';
import { useLang } from '../i18n/LangContext';
import type { TranslationKey } from '../i18n/translations';
import { localizeCity } from '../lib/account';
import { useAuth } from '../context/AuthContext';
import { isoDate, num, pct, signedPct } from '../lib/numerals';
import { collegesFor, isPathComplete, pathLabel, type StudyPath } from '../lib/tawjihi';

interface Service {
  to: string;
  icon: typeof Calculator;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

const services: Service[] = [
  { to: '/roi',           icon: Calculator,    titleKey: 'service.calculator.title',    descKey: 'service.calculator.desc' },
  { to: '/compare',       icon: BarChart3,     titleKey: 'service.compare.title',       descKey: 'service.compare.desc' },
  { to: '/simulate',      icon: Sparkles,      titleKey: 'service.simulate.title',      descKey: 'service.simulate.desc' },
  { to: '/personality',   icon: Brain,         titleKey: 'service.personality.title',   descKey: 'service.personality.desc' },
  { to: '/stories',       icon: Users,         titleKey: 'service.stories.title',       descKey: 'service.stories.desc' },
  { to: '/future',        icon: TrendingUp,    titleKey: 'service.future.title',        descKey: 'service.future.desc' },
  { to: '/scholarships',  icon: Wallet,        titleKey: 'service.scholarships.title',  descKey: 'service.scholarships.desc' },
  { to: '/alternatives',  icon: GraduationCap, titleKey: 'service.alternatives.title',  descKey: 'service.alternatives.desc' },
];

export default function Home() {
  const navigate = useNavigate();
  const { t, lang, dir } = useLang();
  const ChevronEnd = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const { user } = useAuth();
  // Nothing here is invented: a visitor without a profile gets no name, no
  // governorate and no average, rather than a stand-in for one.
  const heroName = user?.name ?? t('profile.guest.title');
  const heroCity = user?.city ? localizeCity(user.city, lang) : null;
  const heroGrade = user?.grade ?? null;
  const path: StudyPath | null = user?.path ?? null;
  const pathKnown = isPathComplete(path);
  const colleges = collegesFor(path);

  return (
    <div className="min-h-screen bg-gov-bg pb-28">
      <OfficialHeader />

      {/* Welcome bar */}
      <div className="bg-white border-b border-gov-line px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] text-gov-muted">{t('pages.home.welcome')}</p>
          <span className="text-[10px] text-gov-muted tabular">{isoDate(new Date())}</span>
        </div>
        <p className="text-base font-bold text-gov-ink leading-tight text-start">
          {heroName}
        </p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="gov-badge gov-badge-info">{t('pages.home.studentLabel')}</span>
          {/* The student's own row of the Ministry's table starts here: the
              track and field are what the eligibility answer is read from. */}
          <span className={`gov-badge ${pathKnown ? 'gov-badge-neutral' : 'gov-badge-warn'}`}>
            {t('tools.path.label')}: {pathKnown ? pathLabel(path, lang) : t('tools.path.unset')}
          </span>
          {heroCity && <span className="gov-badge gov-badge-neutral">{heroCity}</span>}
          {heroGrade !== null && (
            <span className="gov-badge gov-badge-neutral tabular">
              {t('profile.gradeLabel')}: {num(heroGrade)}
            </span>
          )}
        </div>
      </div>

      {/* Hook */}
      <div className="p-4">
        <div className="relative overflow-hidden rounded-3xl bg-gov-navy text-white shadow-[0_16px_40px_-16px_rgba(1,48,112,0.6)]">
          <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full border-[22px] border-white/5" />
          <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full border-[14px] border-white/5" />
          <div className="relative p-5">
            <p className="text-[12px] font-semibold text-gov-gold text-start">
              {t('tools.home.hook.eyebrow')}
            </p>
            <h2 className="text-[27px] font-bold leading-[1.5] mt-2 text-start">
              {t('tools.home.hook.titleA')}
              <br />
              <span className="text-gov-gold">{t('tools.home.hook.titleB')}</span>
            </h2>
            <p className="text-[13.5px] text-white/85 leading-loose mt-3 text-start">
              {t('tools.home.hook.body')}
            </p>
            <button
              onClick={() => navigate('/compare')}
              className="w-full min-h-[52px] mt-5 rounded-xl bg-white text-gov-navy text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
            >
              <Calculator size={19} strokeWidth={2.2} />
              {t('tools.home.hook.cta')}
              <ChevronEnd size={17} />
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-white/70 mt-3.5">
              <CheckCircle2 size={13} className="text-gov-gold shrink-0" />
              {t('tools.home.hook.assurance')}
            </p>
          </div>
        </div>
      </div>

      {/* My field & colleges — the student's own row of the official table */}
      <div className="px-4">
        <div className="gov-card p-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gov-navy/5 flex items-center justify-center text-gov-navy shrink-0">
              <Landmark size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 text-start">
              <h3 className="text-sm font-bold text-gov-ink leading-tight">{t('tools.home.field.title')}</h3>
              <p className="text-[11px] text-gov-muted mt-0.5">
                {pathKnown ? pathLabel(path, lang) : t('tools.path.unset')}
              </p>
            </div>
          </div>

          {!pathKnown && (
            <>
              <p className="text-[11.5px] text-gov-body leading-relaxed mt-3 text-start">
                {t('tools.path.setPrompt')}
              </p>
              <button onClick={() => navigate('/profile/edit')} className="btn-secondary w-full mt-2">
                {t('tools.path.setCta')}
              </button>
            </>
          )}

          {pathKnown && path?.track === 'legacy' && (
            <p className="text-[11.5px] text-gov-body leading-relaxed mt-3 text-start">
              {t('tools.path.legacyLine')}
            </p>
          )}

          {pathKnown && path?.track === 'academic' && (
            <div className="mt-3">
              {colleges.bachelor.length > 0 ? (
                <CountTile label={t('tools.home.field.bachelorCount')} value={colleges.bachelor.length} />
              ) : (
                <p className="text-[11.5px] text-gov-body leading-relaxed text-start">
                  {t('tools.home.field.empty')}
                </p>
              )}
            </div>
          )}

          {pathKnown && path?.track === 'vocational' && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <CountTile label={t('tools.home.field.diplomaCount')} value={colleges.diploma.length} />
                <CountTile label={t('tools.home.field.techCount')} value={colleges.technicalBachelor.length} />
              </div>
              <p className="text-[11.5px] text-gov-body leading-relaxed text-start">
                {t('tools.home.field.vocationalLine')}
              </p>
            </div>
          )}

          {pathKnown && (
            <button onClick={() => navigate('/field')} className="btn-primary w-full mt-3">
              {t('tools.home.field.cta')}
              <ChevronEnd size={16} />
            </button>
          )}

          <div className="mt-3 pt-3 border-t border-gov-line">
            <SourceNote source="mohe-2026" note={t('tools.path.sourceLine')} />
            <p className="text-[10.5px] text-gov-muted leading-relaxed mt-1.5 text-start">
              {t('tools.path.changeNote')}
            </p>
          </div>
        </div>
      </div>

      {/* Services list */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="gov-section-title">{t('pages.home.servicesTitle')}</h3>
          <span className="text-[11px] text-gov-muted tabular">{num(services.length)}</span>
        </div>

        <div className="gov-card divide-y divide-gov-line overflow-hidden">
          {services.map((s) => (
            <button
              key={s.to}
              onClick={() => navigate(s.to)}
              className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gov-bg-soft active:bg-gov-bg text-start transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gov-bg flex items-center justify-center text-gov-navy shrink-0">
                <s.icon size={17} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gov-ink leading-tight">{t(s.titleKey)}</p>
                <p className="text-[11px] text-gov-muted mt-0.5 leading-snug">{t(s.descKey)}</p>
              </div>
              <ChevronEnd size={16} className="text-gov-muted shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Live market */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="gov-section-title">{t('pages.home.topJobsTitle')}</h3>
            <SourceNote source={DATASET_SOURCES.jobMarketTrends} compact />
          </div>
          <button onClick={() => navigate('/market')} className="text-[11px] text-gov-navy font-semibold hover:underline">
            {t('btn.viewAll')}
          </button>
        </div>

        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>{t('tools.home.jobs.occupation')}</th>
                <th className="text-end">{t('tools.home.jobs.postings')}</th>
                <th className="text-end w-16">{t('tools.home.jobs.change')}</th>
              </tr>
            </thead>
            <tbody>
              {jobMarketTrends.topHiring.slice(0, 5).map((job, i) => (
                <tr key={job.id}>
                  <td className="text-gov-muted tabular">{num(i + 1)}</td>
                  <td className="font-medium text-gov-ink">{lang === 'ar' ? job.nameAr : job.nameEn}</td>
                  <td className="text-end tabular">{num(job.count)}</td>
                  <td className={`text-end tabular font-semibold ${job.change >= 0 ? 'text-gov-ok' : 'text-gov-danger'}`}>
                    {signedPct(job.change, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2 bg-gov-bg-soft border-t border-gov-line">
            <SourceNote source={DATASET_SOURCES.jobMarketTrends} note={t('data.note.postings')} />
          </div>
        </div>
      </div>

      {/* Official indicator — the one figure on this screen with a published source */}
      <div className="px-4 mt-5">
        <h3 className="gov-section-title mb-2">{t('data.home.officialTitle')}</h3>
        <div className="gov-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 text-start">
              <p className="text-[11px] text-gov-muted leading-tight">{t('stat.unemployment')}</p>
              <p className="text-2xl font-bold text-gov-ink tabular mt-1 leading-none">
                {pct(dosUnemployment.jordanians, 1)}
              </p>
              <p className="text-[10px] text-gov-muted mt-1.5">
                {t('data.dos.period')} · {t('data.home.dosVsLastYear')}{' '}
                {pct(dosUnemployment.jordaniansPrevYear, 1)} {t('data.dos.periodPrev')}
              </p>
            </div>
            <div className="min-w-0 text-end">
              <p className="text-[11px] text-gov-muted leading-tight">{t('data.home.dosTotal')}</p>
              <p className="text-2xl font-bold text-gov-body tabular mt-1 leading-none">
                {pct(dosUnemployment.totalPopulation, 1)}
              </p>
              <p className="text-[10px] text-gov-muted mt-1.5">
                {t('data.home.dosVsLastYear')} {pct(dosUnemployment.totalPopulationPrevYear, 1)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gov-line">
            <SourceNote source={dosUnemployment.source} />
          </div>
        </div>
      </div>

      {/* Platform impact — demo-stage figures, badged as such.
          The «الكلفة الوطنيّة السنويّة 280 م.د» tile that used to sit here was a
          macroeconomic claim with no source anywhere in the repo, so it is gone
          rather than badged: the app does not put a national cost figure on
          screen that it cannot trace to a publication. */}
      <div className="px-4 mt-5">
        <h3 className="gov-section-title mb-2">{t('data.home.impactTitle')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <Stat label={t('stat.studentsHelped')} value={num(nationalStats.studentsHelped)} />
          <Stat label={t('stat.jobsAnalyzed')} value={num(nationalStats.jobsScraped)} />
        </div>
        <SourceNote
          className="mt-2"
          source={DATASET_SOURCES.nationalStats}
          note={t('data.note.impact')}
        />
      </div>

      {/* Counsellor CTA */}
      <div className="px-4 mt-5">
        <button
          onClick={() => navigate('/chat')}
          className="w-full gov-card-interactive p-4 text-start"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gov-green/10 flex items-center justify-center text-gov-green shrink-0">
              <MessageCircle size={20} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gov-ink">{t('pages.home.consultation')}</p>
              <p className="text-[11px] text-gov-muted mt-0.5">{t('pages.home.consultationDesc')}</p>
            </div>
            <ChevronEnd size={16} className="text-gov-muted" />
          </div>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-4 mt-5">
        <div className="bg-gov-bg-soft border border-gov-line rounded-lg p-3 flex items-start gap-2">
          <FileText size={14} className="text-gov-muted shrink-0 mt-0.5" />
          <p className="text-[11px] text-gov-muted leading-relaxed text-start">{t('pages.home.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-gov border border-gov-line bg-gov-bg-soft px-3 py-2.5 text-start">
      <p className="text-[11px] text-gov-muted leading-tight">{label}</p>
      <p className="text-xl font-bold text-gov-ink tabular mt-1 leading-none">{num(value)}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="gov-card p-3 text-start">
      <p className="text-[11px] text-gov-muted leading-tight">{label}</p>
      <p className="text-lg font-bold tabular mt-1 leading-none text-gov-ink">{value}</p>
    </div>
  );
}
