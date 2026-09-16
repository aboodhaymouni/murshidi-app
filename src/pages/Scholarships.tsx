// Scholarships — what Murshidi can honestly tell a student about funding.
//
// The previous version of this screen listed five real, named Jordanian bodies
// and attached to each of them a grant value, a set of eligibility conditions
// and a specific 2026 application deadline. None of that is published anywhere
// in this repository, and none of it was verifiable. A badge does not make a
// wrong deadline harmless to a student who plans around it, so the data was
// removed rather than re-labelled.
//
// What the app can stand behind without a citation is the part that does not
// change from year to year: the KINDS of body that fund university study, the
// questions that decide whether an offer actually suits you, and the documents
// to have ready before applications open. That is this page. No amount, no
// condition and no date appears on it, and none may be added without a
// published source and its publication date.
//
// It also carries no eligible / not-eligible verdict. The old page declared the
// student eligible from a hardcoded constant that never read their profile — it
// told a 62-average student they qualified for a grant whose own printed
// condition was «معدّل 88 فأعلى». With no sourced condition to test against
// there is nothing to compute, so the page shows the student their own stored
// average and says in as many words that the number is not a verdict.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote, Building2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CircleQuestionMark, ClipboardList, Globe, Handshake, Info, Landmark,
  MessageCircle, RotateCcw, School, Square, SquareCheckBig, UserRound,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import { dec, num } from '../lib/numerals';
import type { TranslationKey } from '../i18n/translations';

interface Funder {
  id: string;
  Icon: typeof Landmark;
  titleKey: TranslationKey;
  whatKey: TranslationKey;
  askKeys: readonly TranslationKey[];
}

/** Kinds of funding body, not named institutions. See the file header. */
const FUNDERS: readonly Funder[] = [
  {
    id: 'gov',
    Icon: Landmark,
    titleKey: 'support.sch.f.gov.title',
    whatKey: 'support.sch.f.gov.what',
    askKeys: ['support.sch.f.gov.a1', 'support.sch.f.gov.a2', 'support.sch.f.gov.a3'],
  },
  {
    id: 'university',
    Icon: School,
    titleKey: 'support.sch.f.university.title',
    whatKey: 'support.sch.f.university.what',
    askKeys: [
      'support.sch.f.university.a1',
      'support.sch.f.university.a2',
      'support.sch.f.university.a3',
    ],
  },
  {
    id: 'corporate',
    Icon: Building2,
    titleKey: 'support.sch.f.corporate.title',
    whatKey: 'support.sch.f.corporate.what',
    askKeys: [
      'support.sch.f.corporate.a1',
      'support.sch.f.corporate.a2',
      'support.sch.f.corporate.a3',
    ],
  },
  {
    id: 'charity',
    Icon: Handshake,
    titleKey: 'support.sch.f.charity.title',
    whatKey: 'support.sch.f.charity.what',
    askKeys: ['support.sch.f.charity.a1', 'support.sch.f.charity.a2', 'support.sch.f.charity.a3'],
  },
  {
    id: 'external',
    Icon: Globe,
    titleKey: 'support.sch.f.external.title',
    whatKey: 'support.sch.f.external.what',
    askKeys: [
      'support.sch.f.external.a1',
      'support.sch.f.external.a2',
      'support.sch.f.external.a3',
    ],
  },
  {
    id: 'loan',
    Icon: Banknote,
    titleKey: 'support.sch.f.loan.title',
    whatKey: 'support.sch.f.loan.what',
    askKeys: ['support.sch.f.loan.a1', 'support.sch.f.loan.a2', 'support.sch.f.loan.a3'],
  },
];

const ASK_KEYS: readonly TranslationKey[] = [
  'support.sch.ask.q1',
  'support.sch.ask.q2',
  'support.sch.ask.q3',
  'support.sch.ask.q4',
  'support.sch.ask.q5',
  'support.sch.ask.q6',
];

const DOC_KEYS: readonly TranslationKey[] = [
  'support.sch.docs.d1',
  'support.sch.docs.d2',
  'support.sch.docs.d3',
  'support.sch.docs.d4',
  'support.sch.docs.d5',
  'support.sch.docs.d6',
];

export default function Scholarships() {
  const { t, dir } = useLang();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openFunder, setOpenFunder] = useState<string | null>(null);
  // Deliberately component state and nothing else: the hint under the heading
  // promises this list is not written to the device and not sent anywhere.
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const doneCount = DOC_KEYS.filter((k) => checkedDocs[k]).length;
  const Forward = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const grade = user?.grade ?? null;
  const gradeText =
    grade === null ? null : Number.isInteger(grade) ? num(grade) : dec(grade, 1);

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader title={t('support.sch.title')} subtitle={t('support.sch.subtitle')} />

      {/* The honesty position comes first, before anything a student might act on. */}
      <div className="bg-white border-b border-gov-line px-4 py-4">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="text-gov-navy shrink-0 mt-0.5" strokeWidth={2.2} />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gov-ink leading-tight">
              {t('support.sch.notice.title')}
            </h2>
            <p className="text-xs text-gov-body leading-relaxed mt-1.5">
              {t('support.sch.notice.body')}
            </p>
            <p className="text-[11.5px] text-gov-muted leading-relaxed mt-2">
              {t('support.sch.notice.why')}
            </p>
          </div>
        </div>
      </div>

      {/* The student's own average — shown, explained, and explicitly not a verdict. */}
      <div className="p-4">
        <div className="gov-card p-4">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-md bg-gov-navy/[0.06] text-gov-navy flex items-center justify-center shrink-0">
              <UserRound size={17} />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gov-ink leading-tight">
                {t('support.sch.avg.title')}
              </h3>

              {gradeText !== null ? (
                <p className="flex items-baseline gap-2 mt-2">
                  <span className="text-[11px] text-gov-muted">{t('support.sch.avg.label')}</span>
                  <span className="text-xl font-bold tabular text-gov-navy leading-none">
                    {gradeText}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-gov-body leading-relaxed mt-2">
                  {user ? t('support.sch.avg.none') : t('support.sch.avg.guest')}
                </p>
              )}

              <p className="text-[11px] text-gov-muted leading-relaxed mt-2.5">
                {t('support.sch.avg.body')}
              </p>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn-ghost mt-3 min-h-[44px]"
              >
                {t('support.sch.avg.cta')}
                <Forward size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kinds of funding body. */}
      <section className="px-4">
        <h3 className="gov-section-title mb-1.5">{t('support.sch.funders.title')}</h3>
        <p className="text-[11px] text-gov-muted leading-relaxed mb-1.5">
          {t('support.sch.funders.noNames')}
        </p>
        <p className="text-[11px] text-gov-muted leading-relaxed mb-3">
          {t('support.sch.funders.hint')}
        </p>

        <div className="space-y-2.5">
          {FUNDERS.map((f) => (
            <FunderCard
              key={f.id}
              funder={f}
              open={openFunder === f.id}
              onToggle={() => setOpenFunder((cur) => (cur === f.id ? null : f.id))}
            />
          ))}
        </div>
      </section>

      {/* The six questions that settle any offer. */}
      <section className="p-4">
        <h3 className="gov-section-title mb-2">{t('support.sch.ask.title')}</h3>
        <div className="gov-card p-4">
          <p className="text-xs text-gov-body leading-relaxed">{t('support.sch.ask.lead')}</p>
          <ol className="space-y-2.5 mt-3">
            {ASK_KEYS.map((k, i) => (
              <li key={k} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gov-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-[1px] tabular">
                  {num(i + 1)}
                </span>
                <span className="text-xs text-gov-body leading-relaxed">{t(k)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Document checklist — session-only, as the hint promises. */}
      <section className="px-4">
        <h3 className="gov-section-title mb-2">{t('support.sch.docs.title')}</h3>
        <div className="gov-card p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] text-gov-muted leading-relaxed flex-1 min-w-0">
              {t('support.sch.docs.hint')}
            </p>
            <span className="gov-badge gov-badge-neutral shrink-0">
              <ClipboardList size={11} />
              {/* The slash sits between two numbers. Left to the bidi algorithm in an
                  RTL paragraph it takes the paragraph direction and the fraction
                  renders reversed — two of six done shows as «6 / 2». The isolate
                  pins the fraction to LTR; verified in the browser at 375×812. */}
              <bdi dir="ltr" className="tabular">
                {num(doneCount)} / {num(DOC_KEYS.length)}
              </bdi>
              {t('support.sch.docs.progress')}
            </span>
          </div>

          <ul className="mt-2.5">
            {DOC_KEYS.map((k) => {
              const on = Boolean(checkedDocs[k]);
              const Box = on ? SquareCheckBig : Square;
              return (
                <li key={k}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setCheckedDocs((cur) => ({ ...cur, [k]: !cur[k] }))}
                    className="w-full text-start flex items-start gap-2.5 py-2 px-1 min-h-[44px] rounded-md hover:bg-gov-bg-soft active:bg-gov-bg-soft"
                  >
                    <Box
                      size={16}
                      className={`shrink-0 mt-[2px] ${on ? 'text-gov-ok' : 'text-gov-muted'}`}
                    />
                    <span
                      className={`text-xs leading-relaxed ${on ? 'text-gov-muted line-through' : 'text-gov-body'}`}
                    >
                      {t(k)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {doneCount > 0 && (
            <button
              type="button"
              onClick={() => setCheckedDocs({})}
              className="btn-ghost mt-2 min-h-[44px]"
            >
              <RotateCcw size={12} />
              {t('support.sch.docs.reset')}
            </button>
          )}
        </div>
      </section>

      <div className="p-4">
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="btn-secondary w-full min-h-[44px]"
        >
          <MessageCircle size={14} />
          {t('support.sch.ai.cta')}
        </button>
      </div>
    </div>
  );
}

function FunderCard({
  funder,
  open,
  onToggle,
}: {
  funder: Funder;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useLang();
  const { Icon } = funder;
  const Chevron = open ? ChevronUp : ChevronDown;
  const panelId = `funder-${funder.id}`;

  return (
    <div className="gov-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full text-start px-4 py-3 flex items-start gap-3 min-h-[44px] hover:bg-gov-bg-soft active:bg-gov-bg-soft"
      >
        <span className="w-9 h-9 rounded-md bg-gov-navy/[0.06] text-gov-navy flex items-center justify-center shrink-0">
          <Icon size={17} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-gov-ink leading-tight">
            {t(funder.titleKey)}
          </span>
          <span className="block text-[11.5px] text-gov-body leading-relaxed mt-1">
            {t(funder.whatKey)}
          </span>
        </span>
        <Chevron size={16} className="text-gov-muted shrink-0 mt-1.5" />
      </button>

      {open && (
        <div id={panelId} className="px-4 py-3 border-t border-gov-line bg-gov-bg-soft">
          <p className="text-[11px] font-semibold text-gov-navy mb-2">
            {t('support.sch.funders.askTitle')}
          </p>
          <ul className="space-y-2">
            {funder.askKeys.map((k) => (
              <li key={k} className="flex items-start gap-2">
                <CircleQuestionMark size={12} className="text-gov-navy/60 shrink-0 mt-[3px]" />
                <span className="text-xs text-gov-body leading-relaxed">{t(k)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
