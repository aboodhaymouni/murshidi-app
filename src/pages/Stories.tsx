// Graduate stories — composite, illustrative journeys.
//
// The previous version of this screen put invented salaries, invented timelines
// and invented "helpful" counts against named individuals ("م. العزب") at named
// real universities, and then computed aggregate statistics from those six
// invented records — a satisfaction rate, an average salary, an average time to
// first job — and printed them as if they were survey findings.
//
// Two things changed. The people are now personas with no name and no named
// university (public / private only), so nothing here can be mistaken for a
// testimony that a real graduate gave. And the aggregate row is gone: a written
// sample is not something you derive a statistic from, and the notice at the top
// of the page says exactly that. The per-journey figures that remain are
// illustrative and every card carries the badge next to them.

import { useState } from 'react';
import { Check, Info, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SourceNote from '../components/SourceNote';
import { useLang } from '../i18n/LangContext';
import { jod, num } from '../lib/numerals';
import type { TranslationKey } from '../i18n/translations';

type TagId = 'satisfied' | 'regret' | 'switch' | 'travel' | 'remote' | 'stability' | 'longStudy';

const TAG_KEYS: Record<TagId, TranslationKey> = {
  satisfied: 'support.stories.tag.satisfied',
  regret: 'support.stories.tag.regret',
  switch: 'support.stories.tag.switch',
  travel: 'support.stories.tag.travel',
  remote: 'support.stories.tag.remote',
  stability: 'support.stories.tag.stability',
  longStudy: 'support.stories.tag.longStudy',
};

const TAG_ORDER: readonly TagId[] = [
  'satisfied',
  'regret',
  'switch',
  'travel',
  'remote',
  'stability',
  'longStudy',
];

const UNI_KEYS: Record<'public' | 'private', TranslationKey> = {
  public: 'support.stories.uni.public',
  private: 'support.stories.uni.private',
};

interface Story {
  id: string;
  personaKey: TranslationKey;
  majorKey: TranslationKey;
  quoteKey: TranslationKey;
  adviceKey: TranslationKey;
  uni: 'public' | 'private';
  /** Graduation year. Rendered as plain digits — a year never takes a thousands separator. */
  cohort: number;
  /** Illustrative monthly figure, in JOD. Badged on every card. */
  salary: number;
  monthsToJob: number;
  wouldRedo: boolean;
  tags: readonly TagId[];
}

const STORIES: readonly Story[] = [
  {
    id: 's1',
    personaKey: 'support.stories.s1.persona',
    majorKey: 'support.stories.s1.major',
    quoteKey: 'support.stories.s1.quote',
    adviceKey: 'support.stories.s1.advice',
    uni: 'public',
    cohort: 2021,
    salary: 700,
    monthsToJob: 11,
    wouldRedo: false,
    tags: ['regret', 'switch'],
  },
  {
    id: 's2',
    personaKey: 'support.stories.s2.persona',
    majorKey: 'support.stories.s2.major',
    quoteKey: 'support.stories.s2.quote',
    adviceKey: 'support.stories.s2.advice',
    uni: 'public',
    cohort: 2021,
    salary: 1850,
    monthsToJob: 2,
    wouldRedo: true,
    tags: ['satisfied', 'remote'],
  },
  {
    id: 's3',
    personaKey: 'support.stories.s3.persona',
    majorKey: 'support.stories.s3.major',
    quoteKey: 'support.stories.s3.quote',
    adviceKey: 'support.stories.s3.advice',
    uni: 'public',
    cohort: 2015,
    salary: 1400,
    monthsToJob: 4,
    wouldRedo: true,
    tags: ['satisfied', 'longStudy'],
  },
  {
    id: 's4',
    personaKey: 'support.stories.s4.persona',
    majorKey: 'support.stories.s4.major',
    quoteKey: 'support.stories.s4.quote',
    adviceKey: 'support.stories.s4.advice',
    uni: 'public',
    cohort: 2017,
    salary: 1100,
    monthsToJob: 8,
    wouldRedo: true,
    tags: ['satisfied', 'travel'],
  },
  {
    id: 's5',
    personaKey: 'support.stories.s5.persona',
    majorKey: 'support.stories.s5.major',
    quoteKey: 'support.stories.s5.quote',
    adviceKey: 'support.stories.s5.advice',
    uni: 'public',
    cohort: 2019,
    salary: 850,
    monthsToJob: 5,
    wouldRedo: true,
    tags: ['satisfied', 'stability'],
  },
  {
    id: 's6',
    personaKey: 'support.stories.s6.persona',
    majorKey: 'support.stories.s6.major',
    quoteKey: 'support.stories.s6.quote',
    adviceKey: 'support.stories.s6.advice',
    uni: 'private',
    cohort: 2022,
    salary: 2100,
    monthsToJob: 3,
    wouldRedo: true,
    tags: ['satisfied', 'remote'],
  },
];

const INITIAL_VISIBLE = 3;

export default function Stories() {
  const { t } = useLang();
  const [filter, setFilter] = useState<TagId | 'all'>('all');
  const [showAll, setShowAll] = useState(false);

  const filtered =
    filter === 'all' ? STORIES : STORIES.filter((s) => s.tags.includes(filter));
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader title={t('support.stories.title')} subtitle={t('support.stories.subtitle')} />

      {/* Read this first — what these journeys are, and what no one may read out of them. */}
      <div className="bg-white border-b border-gov-line px-4 py-4">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="text-gov-navy shrink-0 mt-0.5" strokeWidth={2.2} />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gov-ink leading-tight">
              {t('support.stories.notice.title')}
            </h2>
            <p className="text-xs text-gov-body leading-relaxed mt-1.5">
              {t('support.stories.notice.body')}
            </p>
            <p className="text-[11.5px] text-gov-muted leading-relaxed mt-2">
              {t('support.stories.notice.noStats')}
            </p>
            <SourceNote source="illustrative" className="mt-2.5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gov-line px-4 py-2.5">
        <p className="text-[10px] text-gov-muted mb-1.5">{t('support.stories.filterTitle')}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip
            label={t('support.stories.filter.all')}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          {TAG_ORDER.map((tag) => (
            <Chip
              key={tag}
              label={t(TAG_KEYS[tag])}
              active={filter === tag}
              onClick={() => setFilter(tag)}
            />
          ))}
        </div>
      </div>

      <p className="px-4 pt-3 text-[11px] text-gov-muted">
        {t('support.stories.count')}:{' '}
        <span className="tabular font-semibold text-gov-body">{num(filtered.length)}</span>
      </p>

      <div className="p-4 space-y-3">
        {visible.map((s) => (
          <StoryCard key={s.id} story={s} />
        ))}

        {filtered.length === 0 && (
          <p className="gov-card p-4 text-xs text-gov-muted text-center">
            {t('support.stories.empty')}
          </p>
        )}
      </div>

      {visible.length < filtered.length && (
        <div className="px-4">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="btn-secondary w-full min-h-[44px]"
          >
            {t('support.stories.more')}
          </button>
        </div>
      )}
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  const { t, lang } = useLang();
  const extraTags = story.tags.filter((tag) => tag !== 'satisfied' && tag !== 'regret');

  return (
    <div className="gov-card overflow-hidden">
      <div className="px-4 py-3 border-b border-gov-line">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gov-ink leading-tight">{t(story.personaKey)}</p>
            <p className="text-[11px] text-gov-muted mt-1 leading-relaxed">
              {t(story.majorKey)} · {t(UNI_KEYS[story.uni])} ·{' '}
              {t('support.stories.card.cohort')} <span className="tabular">{String(story.cohort)}</span>
            </p>
          </div>
          <SourceNote source="illustrative" compact className="mt-0.5" />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {story.wouldRedo ? (
            <span className="gov-badge gov-badge-success">
              <Check size={10} />
              {t('support.stories.tag.satisfied')}
            </span>
          ) : (
            <span className="gov-badge gov-badge-danger">
              <X size={10} />
              {t('support.stories.tag.regret')}
            </span>
          )}
          {extraTags.map((tag) => (
            <span key={tag} className="gov-badge gov-badge-neutral">
              {t(TAG_KEYS[tag])}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="border-s-2 border-gov-navy/30 ps-3 mb-3">
          <p className="text-sm text-gov-body leading-relaxed">{t(story.quoteKey)}</p>
        </div>

        <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3 mb-3">
          <p className="text-[11px] font-semibold text-gov-navy mb-1">
            {t('support.stories.card.advice')}
          </p>
          <p className="text-xs text-gov-body leading-relaxed">{t(story.adviceKey)}</p>
        </div>

        <table className="gov-table">
          <tbody>
            <tr>
              <td className="text-gov-muted">{t('support.stories.card.salary')}</td>
              <td className="text-end font-semibold tabular">{jod(story.salary, lang)}</td>
            </tr>
            <tr>
              <td className="text-gov-muted">{t('support.stories.card.months')}</td>
              <td className="text-end font-semibold tabular">{num(story.monthsToJob)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap border transition-colors min-h-[38px] ${
        active
          ? 'bg-gov-navy text-white border-gov-navy'
          : 'bg-white text-gov-body border-gov-line hover:bg-gov-bg-soft'
      }`}
    >
      {label}
    </button>
  );
}
