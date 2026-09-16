// Real, measured activity for the profile screen.
//
// Why this file exists: the profile used to print "12 calculations, 5 grants,
// 3 saved reports, 4 saved majors". Those were literals in JSX — nobody had
// done anything. Every counter here is derived from something the visitor
// actually did on this device, and a brand-new visitor sees zeros.
//
// Storage is per identity: a signed-in account keys off its user id, a guest
// keys off 'guest', so signing out never shows someone else's numbers.

import { getSessionUserId } from './account';
import type { StudentProfile } from './account';

export type ActivityKind =
  | 'visit' // opened one of the app's tools
  | 'calculation' // completed an ROI / cost calculation
  | 'comparison' // compared majors
  | 'simulation' // ran the admission simulator
  | 'aiQuestion' // asked the AI advisor
  | 'interestsTest'; // finished the interests test

export interface ActivityEvent {
  kind: ActivityKind;
  at: string; // ISO
  label?: string; // route or subject, for grouping
}

export interface SavedReport {
  id: string;
  kind: 'interests' | 'roi' | 'compare';
  title: string;
  at: string; // ISO
}

export interface ActivitySummary {
  toolsUsed: number; // distinct tools opened
  calculations: number;
  savedMajors: number;
  savedReports: number;
  aiQuestions: number;
  totalEvents: number;
  lastAt: string | null;
}

interface ActivityStore {
  events: ActivityEvent[];
  savedMajors: string[];
  reports: SavedReport[];
}

const STORE_PREFIX = 'murshidi.activity.';
/** Written by the interests test for a signed-in user (see BUILD_SPEC §6.5). */
const INTERESTS_REPORT_PREFIX = 'murshidi.riasec.';
/** Written by src/pages/Chat.tsx — the student's whole conversation with the advisor. */
const CHAT_PREFIX = 'murshidi.chat.';
const GUEST_SCOPE = 'guest';
const MAX_EVENTS = 200;

/**
 * Every localStorage key this device writes per identity. `clearIdentity` walks
 * this list, so a screen that adds a new per-identity key adds it here too and
 * delete-account keeps its promise without anyone having to remember.
 */
const IDENTITY_KEY_PREFIXES = [STORE_PREFIX, INTERESTS_REPORT_PREFIX, CHAT_PREFIX] as const;

/** Routes that are navigation, not a tool the visitor chose to use. */
const NON_TOOL_ROUTES = new Set(['/', '/home', '/auth', '/profile', '/profile/edit']);

export function activityScope(): string {
  return getSessionUserId() ?? GUEST_SCOPE;
}

function storeKey(scope: string): string {
  return `${STORE_PREFIX}${scope}`;
}

function readStore(scope: string): ActivityStore {
  try {
    const raw = localStorage.getItem(storeKey(scope));
    if (!raw) return { events: [], savedMajors: [], reports: [] };
    const parsed = JSON.parse(raw) as Partial<ActivityStore>;
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      savedMajors: Array.isArray(parsed.savedMajors) ? parsed.savedMajors : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
    };
  } catch {
    return { events: [], savedMajors: [], reports: [] };
  }
}

function writeStore(scope: string, store: ActivityStore): void {
  try {
    localStorage.setItem(storeKey(scope), JSON.stringify(store));
  } catch {
    /* activity tracking is best-effort and must never break a screen */
  }
}

/**
 * Records one thing the visitor did. Consecutive duplicates of the same tool
 * visit are collapsed so that bouncing between two screens does not inflate
 * the counters.
 */
export function recordActivity(kind: ActivityKind, label?: string): void {
  const scope = activityScope();
  const store = readStore(scope);
  const last = store.events[store.events.length - 1];
  if (last && last.kind === kind && last.label === label && kind === 'visit') return;
  store.events.push({ kind, at: new Date().toISOString(), label });
  if (store.events.length > MAX_EVENTS) {
    store.events = store.events.slice(store.events.length - MAX_EVENTS);
  }
  writeStore(scope, store);
}

/** Called by the shell on every route change; ignores non-tool routes. */
export function recordVisit(path: string): void {
  if (NON_TOOL_ROUTES.has(path)) return;
  recordActivity('visit', path);
}

export function getActivityLog(scope: string = activityScope()): ActivityEvent[] {
  return readStore(scope).events;
}

export function getSavedMajors(scope: string = activityScope()): string[] {
  return readStore(scope).savedMajors;
}

export function isMajorSaved(id: string, scope: string = activityScope()): boolean {
  return readStore(scope).savedMajors.includes(id);
}

/** Adds or removes a saved major. Returns the state after the toggle. */
export function toggleSavedMajor(id: string, scope: string = activityScope()): boolean {
  const store = readStore(scope);
  const index = store.savedMajors.indexOf(id);
  if (index >= 0) store.savedMajors.splice(index, 1);
  else store.savedMajors.push(id);
  writeStore(scope, store);
  return index < 0;
}

export function saveReport(report: SavedReport, scope: string = activityScope()): void {
  const store = readStore(scope);
  const index = store.reports.findIndex((r) => r.id === report.id);
  if (index >= 0) store.reports[index] = report;
  else store.reports.push(report);
  writeStore(scope, store);
}

/**
 * Saved reports for this identity. The interests test writes its own key for a
 * signed-in user, so that key is merged in here rather than counted twice.
 */
export function getSavedReports(scope: string = activityScope()): SavedReport[] {
  const reports = [...readStore(scope).reports];
  if (scope !== GUEST_SCOPE && !reports.some((r) => r.kind === 'interests')) {
    try {
      const raw = localStorage.getItem(`${INTERESTS_REPORT_PREFIX}${scope}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { at?: string; savedAt?: string };
        reports.push({
          id: `interests-${scope}`,
          kind: 'interests',
          // Screens label reports from `kind`; `title` is for the data export.
          title: 'Interests test report',
          at: parsed.at || parsed.savedAt || '',
        });
      }
    } catch {
      /* a malformed report key simply means no report to list */
    }
  }
  return reports;
}

export function getActivitySummary(scope: string = activityScope()): ActivitySummary {
  const store = readStore(scope);
  const tools = new Set<string>();
  let calculations = 0;
  let aiQuestions = 0;
  for (const event of store.events) {
    if (event.kind === 'visit' && event.label) tools.add(event.label);
    if (event.kind === 'calculation') calculations += 1;
    if (event.kind === 'aiQuestion') aiQuestions += 1;
  }
  const last = store.events[store.events.length - 1];
  return {
    toolsUsed: tools.size,
    calculations,
    savedMajors: store.savedMajors.length,
    savedReports: getSavedReports(scope).length,
    aiQuestions,
    totalEvents: store.events.length,
    lastAt: last ? last.at : null,
  };
}

/**
 * Wipes everything this device holds for one identity: the activity store, the
 * interests-test report, and the AI conversation.
 *
 * The conversation matters most here. Deleting the account used to leave the
 * student's whole chat sitting in `murshidi.chat.<scope>` while the confirmation
 * copy said every trace was erased — the copy was the honest one, so the code
 * moved to meet it.
 */
export function clearIdentity(scope: string): void {
  for (const prefix of IDENTITY_KEY_PREFIXES) {
    try {
      localStorage.removeItem(`${prefix}${scope}`);
    } catch {
      /* one unavailable key must not stop the rest being removed */
    }
  }
}

export interface ExportBundle {
  app: string;
  exportedAt: string;
  note: string;
  profile: StudentProfile | null;
  guest: boolean;
  activity: ActivityEvent[];
  savedMajors: string[];
  savedReports: SavedReport[];
}

/**
 * Everything this device holds about the visitor, minus the password digest —
 * that is deliberately excluded, it is not useful to the owner and exporting it
 * would only spread a hash around.
 */
export function buildExportBundle(profile: StudentProfile | null, isGuest: boolean): ExportBundle {
  const scope = profile ? profile.id : GUEST_SCOPE;
  const store = readStore(scope);
  return {
    app: 'Murshidi',
    exportedAt: new Date().toISOString(),
    note: 'Local export from this device. The password digest is intentionally not included.',
    profile,
    guest: isGuest,
    activity: store.events,
    savedMajors: store.savedMajors,
    savedReports: getSavedReports(scope),
  };
}

/** Triggers a browser download of a JSON file. Returns false if blocked. */
export function downloadJson(filename: string, data: unknown): boolean {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch {
    return false;
  }
}
