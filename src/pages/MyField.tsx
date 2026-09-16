// «حقلي وكلياتي» — the student's own row of the Higher Education Council table.
//
// Everything on this screen is either read straight out of src/lib/tawjihi.ts
// (which is generated from docs/tawjihi-2026-official.json, transcribed from the
// Ministry's own PDFs) or is framing copy from src/i18n/ns/field.ts. No list is
// re-typed here, no college name is "improved", and nothing is added that the
// published document does not contain.
//
// Three distinctions the screen exists to make, because getting them wrong is
// the most common way a student is misled:
//
//   1. الدبلوم المتوسط and البكالوريوس التقني/التطبيقي are different degrees, so
//      the vocational track gets two separate, separately-labelled lists.
//   2. The published floor to be ALLOWED to apply is not the competitive minimum
//      that actually decides admission — and the 2026/2027 competitive minimums
//      have not been published at all.
//   3. Where the document named a broader college (تكنولوجيا المعلومات) rather
//      than a specific major, the screen says «ضمن …» instead of implying the
//      document named the major itself.
//
// The field switcher is the point of the screen for a grade-9 or grade-10
// student: it lets them see what a different choice would open before they make
// it. Switching never touches the stored profile — the badge says plainly when
// what is on screen is not their own path.

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookMarked, Bookmark, Compass, ExternalLink, FileText, GraduationCap,
  Info, Layers, Lock, ScrollText, TriangleAlert,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { StudyPathPicker } from '../components/PathPicker';
import { useLang } from '../i18n/LangContext';
import type { TranslationKey } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';
import { getSavedMajors, toggleSavedMajor } from '../lib/activity';
import { majorsData } from '../data/majors';
import { num } from '../lib/numerals';
import {
  ADMISSION_MINIMUMS, TAWJIHI_SOURCE, collegesFor, eligibilityFor, isPathComplete, pathLabel,
} from '../lib/tawjihi';
import type { Eligibility, StudyPath } from '../lib/tawjihi';

/**
 * The two Ministry PDFs this screen transcribes ship with the app, under
 * public/sources/, so a reader can open the source document and check a college
 * list against it with no network at all — a booth, a plane, a jury room. The
 * live Ministry URLs are listed underneath as the canonical citation.
 * BASE_URL keeps the path right under the GitHub-Pages sub-path build.
 */
const SHIPPED_PDF_BASE = `${import.meta.env.BASE_URL || '/'}sources/`.replace(/\/{2,}/g, '/');

/** The document marks military-college entries with three asterisks. */
function splitMilitaryMarker(entry: string): { text: string; military: boolean } {
  const military = entry.includes('***');
  return { text: entry.replace(/\*\*\*/g, '').trim(), military };
}

/**
 * Official wording, always rendered right-to-left and tagged `lang="ar"`, because
 * these strings are the Ministry's Arabic and stay Arabic in the English UI —
 * translating a college name here would put a name on screen that appears in no
 * official document.
 */
function OfficialTerm({ children, className = '' }: { children: string; className?: string }) {
  return (
    <span dir="rtl" lang="ar" className={`text-start ${className}`}>
      {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, title, lead }: { icon: typeof Info; title: string; lead?: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="text-gov-navy shrink-0 mt-0.5" />
      <div className="min-w-0">
        <h2 className="text-[13.5px] font-bold text-gov-ink text-start leading-tight">{title}</h2>
        {lead && <p className="text-[11.5px] text-gov-muted leading-relaxed mt-1 text-start">{lead}</p>}
      </div>
    </div>
  );
}

/**
 * How many entries, in an Arabic that agrees with the number. Arabic counts one,
 * two, 3–10 and 11+ differently, and «3 بنداً» is wrong in front of a jury that
 * reads Arabic. One and two carry the count in the word itself, so the digit is
 * dropped for those.
 */
function countLabel(n: number): { key: TranslationKey; showDigit: boolean } {
  if (n === 1) return { key: 'field.colleges.oneItem', showDigit: false };
  if (n === 2) return { key: 'field.colleges.twoItems', showDigit: false };
  if (n <= 10) return { key: 'field.colleges.fewItems', showDigit: true };
  return { key: 'field.colleges.itemsLabel', showDigit: true };
}

/** One of the official lists: a count, the entries, and the military legend. */
function CollegeList({ entries }: { entries: string[] }) {
  const { t } = useLang();
  const hasMilitary = entries.some((e) => e.includes('***'));

  if (entries.length === 0) {
    return <p className="text-[12px] text-gov-muted leading-relaxed mt-2 text-start">{t('field.colleges.none')}</p>;
  }

  const count = countLabel(entries.length);

  return (
    <>
      <p className="text-[11px] text-gov-muted mt-2 text-start">
        {count.showDigit && (
          <span className="tabular font-bold text-gov-navy">{num(entries.length)} </span>
        )}
        {t(count.key)}
      </p>
      <ul className="mt-2 grid gap-1.5">
        {entries.map((entry, index) => {
          const { text, military } = splitMilitaryMarker(entry);
          return (
            <li
              key={`${text}-${index}`}
              className="flex items-start gap-2 rounded-gov border border-gov-line bg-white px-3 py-2"
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-gov-navy/40 shrink-0 mt-[7px]" />
              <OfficialTerm className="flex-1 min-w-0 text-[12.5px] text-gov-body leading-relaxed">
                {text}
              </OfficialTerm>
              {military && (
                <span className="gov-badge gov-badge-neutral shrink-0" title={TAWJIHI_SOURCE.militaryMarkerAr}>
                  <Lock size={10} strokeWidth={2.4} />*
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {hasMilitary && (
        <p className="text-[10.5px] text-gov-muted leading-relaxed mt-2 text-start">{t('field.military')}</p>
      )}
    </>
  );
}

interface MajorRow {
  id: string;
  name: string;
  eligibility: Eligibility;
}

export default function MyField() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { user } = useAuth();

  const myPath = user?.path ?? null;
  const [viewPath, setViewPath] = useState<StudyPath | null>(myPath);
  const [saved, setSaved] = useState<string[]>(() => (user ? getSavedMajors() : []));

  const complete = isPathComplete(viewPath);
  const colleges = useMemo(() => collegesFor(viewPath), [viewPath]);

  const rows = useMemo<MajorRow[]>(
    () =>
      majorsData.map((m) => ({
        id: m.id,
        name: lang === 'ar' ? m.nameAr : m.nameEn,
        eligibility: eligibilityFor(m.id, viewPath),
      })),
    [viewPath, lang],
  );

  const eligibleRows = rows.filter((r) => r.eligibility.status === 'eligible');
  const technicalRows = rows.filter((r) => r.eligibility.status === 'eligible-technical');
  const blockedRows = rows.filter((r) => r.eligibility.status === 'not-eligible');

  const sameAsMine =
    Boolean(myPath) &&
    myPath?.track === viewPath?.track &&
    myPath?.field === viewPath?.field &&
    myPath?.program === viewPath?.program &&
    myPath?.branch === viewPath?.branch;

  const toggleSave = useCallback((id: string) => {
    toggleSavedMajor(id);
    setSaved(getSavedMajors());
  }, []);

  const minimumTables: { key: TranslationKey; tiers: typeof ADMISSION_MINIMUMS.publicUniversities }[] = [
    { key: 'field.min.public', tiers: ADMISSION_MINIMUMS.publicUniversities },
    { key: 'field.min.private', tiers: ADMISSION_MINIMUMS.privateUniversities },
  ];

  return (
    <div className="min-h-screen bg-gov-bg pb-28">
      <PageHeader title={t('field.title')} subtitle={t('field.subtitle')} />

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* ── Where every list on this screen comes from ─────────────────── */}
        <section className="gov-card p-4">
          <SectionTitle icon={ScrollText} title={t('field.source.title')} />
          <p className="text-[12px] text-gov-body leading-relaxed mt-2 text-start">
            <OfficialTerm>
              {lang === 'ar' ? TAWJIHI_SOURCE.authorityAr : TAWJIHI_SOURCE.authorityEn}
            </OfficialTerm>
          </p>
          <dl className="mt-3 grid gap-1.5 text-[11.5px]">
            {[
              { label: t('field.source.decision'), value: TAWJIHI_SOURCE.pageDate },
              { label: t('field.source.effective'), value: TAWJIHI_SOURCE.appliesFrom },
              { label: t('field.source.retrieved'), value: TAWJIHI_SOURCE.retrieved },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-2">
                <dt className="text-gov-muted shrink-0">{item.label}</dt>
                <dd className="font-semibold text-gov-ink tabular" dir="ltr">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 grid gap-1.5">
            {[
              { href: `${SHIPPED_PDF_BASE}mohe-academic-2026-2027.pdf`, label: t('field.source.pdfAcademic') },
              { href: `${SHIPPED_PDF_BASE}mohe-vocational-2026-2027.pdf`, label: t('field.source.pdfVocational') },
              { href: TAWJIHI_SOURCE.pdfAcademic, label: t('field.source.pdfAcademicLive') },
              { href: TAWJIHI_SOURCE.pdfVocational, label: t('field.source.pdfVocationalLive') },
              { href: TAWJIHI_SOURCE.decisionPage, label: t('field.source.page') },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[12px] font-semibold text-gov-navy underline underline-offset-2 decoration-gov-navy/30 hover:decoration-gov-navy min-h-[24px]"
              >
                <FileText size={13} className="shrink-0" />
                <span className="min-w-0 flex-1 text-start">{link.label}</span>
                <ExternalLink size={12} className="shrink-0 opacity-70" />
              </a>
            ))}
          </div>
          <p className="text-[10.5px] text-gov-muted leading-relaxed mt-3 text-start">
            {t('field.source.localCopy')}
          </p>
          <p className="text-[10.5px] text-gov-muted leading-relaxed mt-1 text-start">
            {t('field.source.verbatim')}
          </p>
        </section>

        {/* ── Switch what is displayed, without touching the stored profile ── */}
        <section className="gov-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <SectionTitle icon={Compass} title={t('field.picker.title')} lead={t('field.picker.hint')} />
            {myPath && (
              <span
                className={`gov-badge shrink-0 ${sameAsMine ? 'gov-badge-success' : 'gov-badge-warn'}`}
              >
                {sameAsMine ? t('field.picker.mine') : t('field.picker.exploring')}
              </span>
            )}
          </div>

          <StudyPathPicker value={viewPath} onChange={setViewPath} idPrefix="field" variant="compact" />

          {myPath && !sameAsMine && (
            <button type="button" onClick={() => setViewPath(myPath)} className="btn-secondary w-full">
              {t('field.picker.backToMine')}
            </button>
          )}

          {!myPath && (
            <div className="rounded-gov border border-gov-line bg-gov-bg-soft p-3">
              <p className="text-[12.5px] font-bold text-gov-ink text-start">{t('field.picker.noPath')}</p>
              <p className="text-[11.5px] text-gov-muted leading-relaxed mt-1 text-start">
                {t('field.picker.noPathBody')}
              </p>
              {user && (
                <button
                  type="button"
                  onClick={() => navigate('/profile/edit')}
                  className="btn-secondary w-full mt-2"
                >
                  {t('field.picker.setPath')}
                </button>
              )}
            </div>
          )}

          {viewPath && complete && (
            <p className="text-[12px] text-gov-body text-start">
              <span className="text-gov-muted">{t('profile.pathLabel')}: </span>
              <span className="font-bold text-gov-ink">{pathLabel(viewPath, lang)}</span>
            </p>
          )}
        </section>

        {/* ── The lists themselves ───────────────────────────────────────── */}
        {viewPath?.track === 'legacy' && (
          <section className="gov-card p-4">
            <SectionTitle icon={TriangleAlert} title={t('field.legacy.title')} />
            <p className="text-[12px] text-gov-body leading-relaxed mt-2 text-start">{t('field.legacy.body')}</p>
            <p className="text-[11.5px] text-gov-muted leading-relaxed mt-2 text-start">
              {t('field.legacy.explore')}
            </p>
          </section>
        )}

        {viewPath && viewPath.track !== 'legacy' && !complete && (
          <section className="gov-card p-4">
            <p className="text-[12.5px] text-gov-body leading-relaxed text-start">
              {t('field.picker.pickDetail')}
            </p>
          </section>
        )}

        {complete && viewPath?.track === 'academic' && (
          <section className="gov-card p-4">
            <SectionTitle
              icon={GraduationCap}
              title={t('field.colleges.bachelor')}
              lead={t('field.colleges.bachelorLead')}
            />
            <CollegeList entries={colleges.bachelor} />
          </section>
        )}

        {complete && viewPath?.track === 'vocational' && (
          <>
            <div className="bg-white border border-gov-line rounded-gov-lg p-3 flex items-start gap-2">
              <Layers size={15} className="text-gov-navy shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-gov-body leading-relaxed text-start">
                {t('field.colleges.differentDegrees')}
              </p>
            </div>

            <section className="gov-card p-4">
              <SectionTitle
                icon={BookMarked}
                title={t('field.colleges.diploma')}
                lead={t('field.colleges.diplomaLead')}
              />
              <CollegeList entries={colleges.diploma} />
            </section>

            <section className="gov-card p-4">
              <SectionTitle
                icon={GraduationCap}
                title={t('field.colleges.technical')}
                lead={t('field.colleges.technicalLead')}
              />
              <CollegeList entries={colleges.technicalBachelor} />
            </section>
          </>
        )}

        {/* ── The app's own majors, read through this path ────────────────── */}
        {complete && viewPath?.track !== 'legacy' && (
          <section className="gov-card p-4 space-y-3">
            <SectionTitle icon={Info} title={t('field.majors.title')} lead={t('field.majors.lead')} />

            <MajorGroup
              title={t('field.majors.eligible')}
              tone="gov-badge-success"
              rows={eligibleRows}
              saved={saved}
              canSave={Boolean(user)}
              onToggle={toggleSave}
            />
            <MajorGroup
              title={t('field.majors.technical')}
              tone="gov-badge-info"
              rows={technicalRows}
              saved={saved}
              canSave={Boolean(user)}
              onToggle={toggleSave}
            />
            <MajorGroup
              title={t('field.majors.blocked')}
              tone="gov-badge-neutral"
              lead={t('field.majors.blockedLead')}
              rows={blockedRows}
              saved={saved}
              canSave={false}
              onToggle={toggleSave}
            />

            {!user && (
              <p className="text-[10.5px] text-gov-muted leading-relaxed text-start">
                {t('field.majors.guestNote')}
              </p>
            )}
          </section>
        )}

        {/* ── Published floors, and the number that is missing ────────────── */}
        <section className="gov-card p-4">
          <SectionTitle icon={ScrollText} title={t('field.min.title')} lead={t('field.min.lead')} />

          {minimumTables.map(({ key, tiers }) => (
            <div key={key} className="mt-3">
              <p className="text-[12px] font-bold text-gov-ink text-start">{t(key)}</p>
              <div className="gov-table-wrap mt-1.5">
                <table className="gov-table w-full">
                  <thead>
                    <tr>
                      <th className="text-start">{t('field.min.tierCol')}</th>
                      <th className="text-end">{t('field.min.percentCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier) => (
                      <tr key={`${key}-${tier.percent}`}>
                        <td className="text-start">
                          <OfficialTerm className="block text-[11.5px] leading-relaxed">{tier.ar}</OfficialTerm>
                        </td>
                        <td className="text-end tabular font-bold whitespace-nowrap">{num(tier.percent)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <p className="text-[10.5px] text-gov-muted leading-relaxed mt-2 text-start">
            {t('field.min.arabicWording')}
          </p>

          <div className="mt-3 rounded-gov border border-gov-line bg-gov-bg-soft p-3">
            <p className="text-[12px] font-bold text-gov-ink text-start">{t('field.min.subjectFloorTitle')}</p>
            <p className="text-[11.5px] text-gov-body leading-relaxed mt-1">
              <OfficialTerm className="block">{ADMISSION_MINIMUMS.universalSubjectFloorAr}</OfficialTerm>
            </p>
            {lang === 'en' && (
              <p className="text-[11px] text-gov-muted leading-relaxed mt-1 text-start">
                {ADMISSION_MINIMUMS.universalSubjectFloorEn}
              </p>
            )}
          </div>

          <div className="mt-3 rounded-gov border border-gov-gold/50 bg-white p-3">
            <p className="flex items-center gap-2 text-[12px] font-bold text-gov-ink text-start">
              <TriangleAlert size={14} className="text-gov-gold shrink-0" />
              {t('field.min.competitiveTitle')}
            </p>
            <p className="text-[11.5px] text-gov-body leading-relaxed mt-1.5 text-start">
              {t('field.min.competitive')}
            </p>
            <a
              href="https://www.admhec.gov.jo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-[11.5px] font-semibold text-gov-navy underline underline-offset-2 decoration-gov-navy/30 hover:decoration-gov-navy"
            >
              {t('field.min.competitiveLink')}
              <ExternalLink size={11} className="shrink-0 opacity-70" />
            </a>
          </div>

          <div className="mt-3 flex items-start gap-1.5">
            <FileText size={12} className="text-gov-muted shrink-0 mt-[2px]" />
            <p className="text-[10.5px] leading-relaxed text-gov-muted text-start">
              {t('field.min.decision')}:{' '}
              <a
                href={ADMISSION_MINIMUMS.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-navy font-semibold underline underline-offset-2 decoration-gov-navy/30 hover:decoration-gov-navy"
              >
                <OfficialTerm>{ADMISSION_MINIMUMS.source.decisionAr}</OfficialTerm>
              </a>{' '}
              — <OfficialTerm>{ADMISSION_MINIMUMS.source.sectionAr}</OfficialTerm>
            </p>
          </div>
        </section>

        {/* ── Today's table is today's table ──────────────────────────────── */}
        <section className="bg-white border border-gov-line rounded-gov-lg p-4">
          <SectionTitle icon={Info} title={t('field.change.title')} />
          <p className="text-[11.5px] text-gov-body leading-relaxed mt-2 text-start">{t('field.change.body')}</p>
        </section>

        <p className="text-[10.5px] text-gov-muted leading-relaxed text-start px-1">{t('field.disclaimer')}</p>
      </main>
    </div>
  );
}

function MajorGroup({
  title,
  tone,
  lead,
  rows,
  saved,
  canSave,
  onToggle,
}: {
  title: string;
  tone: string;
  lead?: string;
  rows: MajorRow[];
  saved: string[];
  canSave: boolean;
  onToggle: (id: string) => void;
}) {
  const { t, lang } = useLang();

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={`gov-badge ${tone}`}>{title}</span>
        <span className="text-[11px] text-gov-muted tabular">{num(rows.length)}</span>
      </div>
      {lead && <p className="text-[11px] text-gov-muted leading-relaxed mt-1 text-start">{lead}</p>}

      {rows.length === 0 ? (
        <p className="text-[11.5px] text-gov-muted mt-1.5 text-start">{t('field.majors.none')}</p>
      ) : (
        <ul className="mt-2 grid gap-1.5">
          {rows.map((row) => {
            const isSaved = saved.includes(row.id);
            const detail = describe(row.eligibility, lang);
            return (
              <li
                key={row.id}
                className="rounded-gov border border-gov-line bg-white px-3 py-2 flex items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold text-gov-ink text-start">{row.name}</p>
                  {detail.college && (
                    <p className="text-[11px] text-gov-muted leading-relaxed mt-0.5">
                      <OfficialTerm className="block">{detail.college}</OfficialTerm>
                    </p>
                  )}
                  {detail.within && (
                    <p className="text-[10.5px] text-gov-muted leading-relaxed mt-0.5 text-start">
                      {t('field.majors.within')} <OfficialTerm>{detail.within}</OfficialTerm> —{' '}
                      {t('field.majors.withinHint')}
                    </p>
                  )}
                  {detail.reason && (
                    <p className="text-[10.5px] text-gov-muted leading-relaxed mt-0.5 text-start">{detail.reason}</p>
                  )}
                </div>
                {canSave && (
                  <button
                    type="button"
                    onClick={() => onToggle(row.id)}
                    aria-pressed={isSaved}
                    aria-label={isSaved ? t('field.majors.unsave') : t('field.majors.save')}
                    title={isSaved ? t('field.majors.unsave') : t('field.majors.save')}
                    className={`w-11 h-11 -my-1 rounded-gov flex items-center justify-center shrink-0 transition-colors ${
                      isSaved ? 'text-gov-navy bg-gov-navy/[0.08]' : 'text-gov-muted hover:bg-gov-bg-soft'
                    }`}
                  >
                    {isSaved ? <BookMarked size={16} /> : <Bookmark size={16} />}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Turns one `Eligibility` into the three optional lines the card can show.
 * Uses the module's own reason strings in the reader's language rather than
 * rephrasing them, so the wording on screen is the wording the module can
 * defend. College names stay Arabic in both languages — see `OfficialTerm`.
 */
function describe(
  eligibility: Eligibility,
  lang: 'ar' | 'en',
): { college?: string; within?: string; reason?: string } {
  if (eligibility.status === 'eligible') {
    return {
      college: eligibility.explicit ? eligibility.officialCollege : undefined,
      within: eligibility.explicit ? undefined : eligibility.coveredBy ?? eligibility.officialCollege,
    };
  }
  if (eligibility.status === 'eligible-technical') {
    return {
      college: eligibility.officialCollege,
      reason: lang === 'ar' ? eligibility.noteAr : eligibility.noteEn,
    };
  }
  return { reason: lang === 'ar' ? eligibility.reasonAr : eligibility.reasonEn };
}
