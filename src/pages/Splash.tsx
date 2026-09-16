import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight,
  Calculator, FileSearch, Sparkles, BookOpen,
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { translations, type TranslationKey } from '../i18n/translations';
import { isOnboarded, setOnboarded } from '../lib/account';
import { majorsData, universitiesData } from '../data/majors';
import BrandSplash from '../components/BrandSplash';
import MizanLogo from '../components/MizanLogo';

interface Stat { value: string; labelKey: TranslationKey; }
interface Slide {
  icon: typeof Calculator;
  iconBg: string;
  iconColor: string;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  stats?: Stat[];
}

// Every stat value below is COUNTED from the app's own content at runtime —
// none of them is typed in by hand, so none of them can drift from what the
// app actually ships (BUILD_SPEC §0.1, §4.4). Slides 1 and 2 carry no stats
// because the figures they used to show (100K Tawjihi students, 26.4%
// graduate unemployment, 50K+ job postings) are not traceable to a published
// source, and an unsourced number in front of a national jury is a liability.
const MAJOR_COUNT = String(majorsData.length);
const UNIVERSITY_COUNT = String(universitiesData.length);
const LANGUAGE_COUNT = String(Object.keys(translations).length);

const slides: Slide[] = [
  {
    icon: BookOpen,
    iconBg: 'bg-gov-navy/[0.08]',
    iconColor: 'text-gov-navy',
    badgeKey: 'splash.slide1.badge',
    titleKey: 'splash.slide1.title',
    descKey: 'splash.slide1.desc',
  },
  {
    icon: FileSearch,
    iconBg: 'bg-gov-green/10',
    iconColor: 'text-gov-green',
    badgeKey: 'splash.slide2.badge',
    titleKey: 'splash.slide2.title',
    descKey: 'splash.slide2.desc',
  },
  {
    icon: Calculator,
    iconBg: 'bg-gov-gold/10',
    iconColor: 'text-gov-gold',
    badgeKey: 'splash.slide3.badge',
    titleKey: 'splash.slide3.title',
    descKey: 'splash.slide3.desc',
    stats: [
      { value: MAJOR_COUNT, labelKey: 'splash.stat.majors' },
      { value: UNIVERSITY_COUNT, labelKey: 'splash.stat.universities' },
    ],
  },
  {
    icon: Sparkles,
    iconBg: 'bg-gov-navy/[0.08]',
    iconColor: 'text-gov-navy',
    badgeKey: 'splash.slide4.badge',
    titleKey: 'splash.slide4.title',
    descKey: 'splash.slide4.desc',
    stats: [
      { value: '0', labelKey: 'splash.stat.fees' },
      { value: LANGUAGE_COUNT, labelKey: 'splash.stat.languages' },
    ],
  },
];

export default function Splash() {
  const navigate = useNavigate();
  const { t, dir } = useLang();

  // Read when the brand frame ENDS rather than when it starts: on a fresh device
  // the demo identity is seeded asynchronously and may finish in between.
  const [returningVisitor] = useState(() => isOnboarded());
  const [phase, setPhase] = useState<'brand' | 'slides'>('brand');
  const [step, setStep] = useState(0);

  const handleBrandDone = useCallback(() => {
    if (returningVisitor || isOnboarded()) navigate('/home', { replace: true });
    else setPhase('slides');
  }, [returningVisitor, navigate]);

  const finish = () => {
    setOnboarded();
    navigate('/home', { replace: true });
  };

  // The brand frame is the whole screen: the skip button, the indicator pills
  // and the action bar are not rendered at all until the slides begin.
  if (phase === 'brand') {
    return <BrandSplash onDone={handleBrandDone} />;
  }

  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const slide = slides[step];
  const isLast = step === slides.length - 1;
  const Icon = slide.icon;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <div className="gov-strip" />

      {/* Top bar */}
      <div className="safe-top">
        <div className="px-4 h-12 flex items-center justify-between">
          <MizanLogo size={32} />
          <button
            type="button"
            onClick={finish}
            className="h-9 px-3 text-xs font-semibold text-gov-muted hover:text-gov-navy hover:bg-gov-bg-soft rounded-md transition-colors"
          >
            {t('btn.skip')}
          </button>
        </div>
      </div>

      <div key={step} className="flex-1 min-h-0 flex flex-col px-6 py-6 animate-fadeInUp">
        <div className="flex justify-center mb-8 mt-4 animate-fadeInUp animate-delay-100">
          <div className={`w-28 h-28 rounded-3xl ${slide.iconBg} flex items-center justify-center`}>
            <Icon size={48} className={slide.iconColor} strokeWidth={1.6} />
          </div>
        </div>

        <div className="text-center mb-3 animate-fadeInUp animate-delay-150">
          <span className="inline-block text-[11px] font-bold text-gov-navy tracking-wider uppercase">
            {t(slide.badgeKey)}
          </span>
        </div>

        <h2 className="text-[24px] font-bold text-gov-ink text-center mb-4 leading-snug animate-fadeInUp animate-delay-200">
          {t(slide.titleKey)}
        </h2>

        <p className="text-[15px] text-gov-body text-center leading-loose px-2 mb-7 animate-fadeInUp animate-delay-250">
          {t(slide.descKey)}
        </p>

        {slide.stats && (
          <div className="mt-auto animate-fadeInUp animate-delay-300">
            <div className="grid grid-cols-2 gap-3">
              {slide.stats.map((s) => (
                <div
                  key={s.labelKey}
                  className="bg-gov-bg-soft border border-gov-line rounded-xl p-4 text-center"
                >
                  <p className="text-2xl font-bold text-gov-navy tabular leading-none">{s.value}</p>
                  <p className="text-[11px] text-gov-muted mt-1.5 leading-tight">{t(s.labelKey)}</p>
                </div>
              ))}
            </div>
            <p className="text-[10.5px] text-gov-muted/90 text-center mt-2.5 leading-snug">
              {t('splash.statsNote')}
            </p>
          </div>
        )}
      </div>

      {/* Indicator pills */}
      <div
        role="group"
        aria-label={`${t('splash.step')} ${step + 1} ${t('splash.of')} ${slides.length}`}
        className="flex justify-center gap-1.5 pb-4"
      >
        {slides.map((s, i) => (
          <div
            key={s.titleKey}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-gov-navy' : 'w-1.5 bg-gov-line'
            }`}
          />
        ))}
      </div>

      {/* Action bar */}
      <div className="border-t border-gov-line bg-white safe-bottom">
        <div className="px-5 py-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="btn-secondary px-4 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t('btn.back')}
          >
            <PrevIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLast) finish();
              else setStep(step + 1);
            }}
            className="btn-primary flex-1"
          >
            <span>{isLast ? t('btn.enterPlatform') : t('btn.next')}</span>
            <NextIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
