// The study-path question, asked once for the whole app.
//
// Three screens need it — sign-up, the profile edit form, and the /field
// explorer — and asking it three times in three slightly different shapes is how
// the three drift apart. It lived inside Auth.tsx when it was first written,
// which meant two pages importing a component from a third page; this is its
// own module so nothing imports a screen to get a control.
//
// It never infers: a track with no detail chosen stays incomplete, and the
// caller checks `isPathComplete` before saving anything.

import { useMemo } from 'react';
import { useLang } from '../i18n/LangContext';
import type { TranslationKey } from '../i18n/translations';
import {
  LEGACY_BRANCHES, TRACKS, academicFields, vocationalPrograms,
} from '../lib/tawjihi';
import type {
  AcademicFieldId, LegacyBranchId, StudyPath, TrackId, VocationalProgramId,
} from '../lib/tawjihi';

/** One plain line per track about where it leads. The names come from tawjihi.ts. */
const TRACK_LEAD: Record<TrackId, TranslationKey> = {
  academic: 'auth.track.academicLead',
  vocational: 'auth.track.vocationalLead',
  legacy: 'auth.track.legacyLead',
};

/**
 * Track first, then field / programme / branch.
 *
 * Exported because two other screens ask the same question — the profile edit
 * form of an existing student, and /field of a student exploring what another
 * choice would open — and asking it three times in three slightly different
 * shapes is how the three drift apart. It never infers: a track with no detail
 * chosen stays incomplete, and `isPathComplete` is what the caller checks
 * before saving.
 *
 * `variant` changes only the presentation. 'steps' is the signup framing, with
 * the numbered steps and the explanation of why the question is being asked.
 * 'compact' is the switcher on /field, where the student already knows and is
 * comparing one field against another.
 */
export function StudyPathPicker({
  value,
  onChange,
  idPrefix,
  variant = 'steps',
}: {
  value: StudyPath | null;
  onChange: (next: StudyPath | null) => void;
  idPrefix: string;
  variant?: 'steps' | 'compact';
}) {
  const { t, lang } = useLang();
  const track = value?.track ?? null;
  const steps = variant === 'steps';

  const fields = useMemo(() => academicFields(), []);
  const programs = useMemo(() => vocationalPrograms(), []);

  return (
    <fieldset className="border-0 p-0 m-0 space-y-3">
      {steps ? (
        <>
          <legend className="gov-label p-0">{t('auth.path.legend')}</legend>
          <p className="text-[11.5px] text-gov-muted leading-relaxed text-start">{t('auth.path.hint')}</p>
          <p className="text-[11px] font-bold text-gov-muted text-start">{t('auth.path.step1')}</p>
        </>
      ) : (
        <legend className="gov-label p-0">{t('field.picker.track')}</legend>
      )}

      <div className={steps ? 'grid gap-2' : 'grid grid-cols-3 gap-1.5'}>
        {TRACKS.map((tr) => {
          const active = track === tr.id;
          return (
            <button
              key={tr.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? value : { track: tr.id })}
              className={`w-full text-start rounded-gov border min-h-[44px] transition-colors ${
                steps ? 'p-3' : 'px-2 py-2 text-center'
              } ${
                active
                  ? 'border-gov-navy bg-gov-navy/[0.06]'
                  : 'border-gov-line bg-white hover:bg-gov-bg-soft'
              }`}
            >
              {steps ? (
                <>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        active ? 'border-gov-navy' : 'border-gov-line'
                      }`}
                    >
                      {active && <span className="w-2 h-2 rounded-full bg-gov-navy" />}
                    </span>
                    <span className="text-[13px] font-bold text-gov-ink">
                      {lang === 'ar' ? tr.nameAr : tr.nameEn}
                    </span>
                  </span>
                  <span className="block text-[11.5px] text-gov-muted leading-relaxed mt-1 ps-6">
                    {t(TRACK_LEAD[tr.id])}
                  </span>
                </>
              ) : (
                <span
                  className={`block text-[11px] leading-tight ${
                    active ? 'font-bold text-gov-navy' : 'font-semibold text-gov-body'
                  }`}
                >
                  {lang === 'ar' ? tr.nameAr : tr.nameEn}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {track && (
        <div className="space-y-2">
          {steps && (
            <p className="text-[11px] font-bold text-gov-muted text-start">{t('auth.path.step2')}</p>
          )}

          {track === 'academic' && (
            <div>
              <label className="gov-label" htmlFor={`${idPrefix}-field`}>
                {t('auth.path.chooseField')}
              </label>
              <select
                id={`${idPrefix}-field`}
                className="gov-input"
                value={value?.field ?? ''}
                onChange={(e) =>
                  onChange({
                    track: 'academic',
                    ...(e.target.value ? { field: e.target.value as AcademicFieldId } : {}),
                  })
                }
              >
                <option value="">{t('auth.path.fieldPh')}</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>{lang === 'ar' ? f.nameAr : f.nameEn}</option>
                ))}
              </select>
            </div>
          )}

          {track === 'vocational' && (
            <div>
              <label className="gov-label" htmlFor={`${idPrefix}-program`}>
                {t('auth.path.chooseProgram')}
              </label>
              <select
                id={`${idPrefix}-program`}
                className="gov-input"
                value={value?.program ?? ''}
                onChange={(e) =>
                  onChange({
                    track: 'vocational',
                    ...(e.target.value ? { program: e.target.value as VocationalProgramId } : {}),
                  })
                }
              >
                <option value="">{t('auth.path.programPh')}</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{lang === 'ar' ? p.nameAr : p.nameEn}</option>
                ))}
              </select>
              {steps && <p className="gov-hint">{t('auth.path.vocationalNote')}</p>}
            </div>
          )}

          {track === 'legacy' && (
            <div>
              <label className="gov-label" htmlFor={`${idPrefix}-branch`}>
                {t('auth.path.chooseBranch')}
              </label>
              <select
                id={`${idPrefix}-branch`}
                className="gov-input"
                value={value?.branch ?? ''}
                onChange={(e) =>
                  onChange({
                    track: 'legacy',
                    ...(e.target.value ? { branch: e.target.value as LegacyBranchId } : {}),
                  })
                }
              >
                <option value="">{t('auth.path.branchPh')}</option>
                {LEGACY_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.nameEn}</option>
                ))}
              </select>
              {steps && <p className="gov-hint">{t('auth.path.legacyNote')}</p>}
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
}
