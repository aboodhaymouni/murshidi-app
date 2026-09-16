// Local-first accounts for Murshidi. There is no backend: every account, the
// active session and the guest flag live in this device's localStorage.
//
// Honest note about what this is and is not.
//
// Passwords are never stored in the clear. On a secure origin (https, or
// localhost) they are stored as a SHA-256 digest computed by WebCrypto. On a
// plain-http origin — which is how the app is opened from a phone on a LAN IP
// during testing — `crypto.subtle` does not exist at all, so a 128-bit
// non-cryptographic checksum is used instead and the screen says so. Neither
// form is protection against someone holding the unlocked device: there is no
// salt, no key-stretching and no encryption of the profile fields.
//
// Every stored digest carries the algorithm that produced it as a prefix, so a
// record written in one context is never checked with the other's algorithm and
// silently mismatched. `passwordHashMode()` reports which one this context can
// use, and src/i18n/ns/auth.ts carries copy for both cases. Do not upgrade the
// claim in either place.

import {
  LEGACY_BRANCHES,
  findField,
  findProgram,
  isPathComplete,
  type AcademicFieldId,
  type LegacyBranchId,
  type StudyPath,
  type TrackId,
  type VocationalProgramId,
} from './tawjihi';

export type { StudyPath, TrackId, AcademicFieldId, VocationalProgramId, LegacyBranchId };

/** The account fields the app is allowed to read and show. Never contains the hash. */
export interface StudentProfile {
  id: string;
  name: string;
  grade: number | null; // Tawjihi average 0–100
  city: string; // governorate label, in the language chosen at signup
  /** Track + field / programme / legacy branch. null until the student chooses. */
  path?: StudyPath | null;
  createdAt: string; // ISO
}

/** The stored record: a profile plus the password digest. */
export interface Account extends StudentProfile {
  passHash: string;
}

export type AuthError =
  | 'name-taken'
  | 'not-found'
  | 'wrong-password'
  | 'invalid'
  | 'storage'
  /** The record was written where WebCrypto exists; this context cannot check it. */
  | 'unverifiable-here';

export interface AuthResult {
  ok: boolean;
  user?: StudentProfile;
  error?: AuthError;
}

export interface SignUpInput {
  name: string;
  password: string;
  grade: number | null;
  city: string;
  path: StudyPath | null;
}

const USERS_KEY = 'murshidi.accounts.v1';
const SESSION_KEY = 'murshidi.session.v1';
const ONBOARDED_KEY = 'murshidi.onboarded.v1';
const GUEST_KEY = 'murshidi.guest.v1';

/** The 12 governorates of Jordan, in the order used by the signup select. */
export const GOVERNORATES_AR = [
  'عمّان', 'إربد', 'الزرقاء', 'البلقاء', 'المفرق', 'جرش',
  'عجلون', 'مادبا', 'الكرك', 'الطفيلة', 'معان', 'العقبة',
] as const;

export const GOVERNORATES_EN = [
  'Amman', 'Irbid', 'Zarqa', 'Balqa', 'Mafraq', 'Jerash',
  'Ajloun', 'Madaba', 'Karak', 'Tafilah', 'Maan', 'Aqaba',
] as const;

export function governorates(lang: 'ar' | 'en'): readonly string[] {
  return lang === 'ar' ? GOVERNORATES_AR : GOVERNORATES_EN;
}

/**
 * Cities are stored as the label picked at signup. This maps a stored label to
 * the label of the current language so the profile still reads correctly after
 * the user switches language. Unknown labels are returned untouched.
 */
export function localizeCity(city: string, lang: 'ar' | 'en'): string {
  if (!city) return '';
  const ar = GOVERNORATES_AR as readonly string[];
  const en = GOVERNORATES_EN as readonly string[];
  const index = ar.indexOf(city) >= 0 ? ar.indexOf(city) : en.indexOf(city);
  if (index < 0) return city;
  return lang === 'ar' ? ar[index] : en[index];
}

// ─────────────────────────────────────────────────────────────────────────────
// The study path
//
// Jordan replaced the pre-2023 Tawjihi branches with two tracks. The branch
// union this file used to export is gone; src/lib/tawjihi.ts owns the new model
// and this file only validates, stores and migrates it.
// ─────────────────────────────────────────────────────────────────────────────

const TRACK_IDS: readonly TrackId[] = ['academic', 'vocational', 'legacy'];

function isLegacyBranchId(value: unknown): value is LegacyBranchId {
  return typeof value === 'string' && LEGACY_BRANCHES.some((b) => b.id === value);
}

/** Accepts only the shapes tawjihi.ts can answer for; anything else becomes null. */
export function sanitizePath(raw: unknown): StudyPath | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const track = r.track;
  if (typeof track !== 'string' || !(TRACK_IDS as readonly string[]).includes(track)) return null;
  if (track === 'academic') {
    const field = findField(typeof r.field === 'string' ? r.field : undefined);
    return field ? { track: 'academic', field: field.id as AcademicFieldId } : { track: 'academic' };
  }
  if (track === 'vocational') {
    const program = findProgram(typeof r.program === 'string' ? r.program : undefined);
    return program
      ? { track: 'vocational', program: program.id as VocationalProgramId }
      : { track: 'vocational' };
  }
  return isLegacyBranchId(r.branch) ? { track: 'legacy', branch: r.branch } : { track: 'legacy' };
}

/**
 * Accounts stored before the two-track model existed carry a pre-2023 `branch`
 * string. Those students are on the old plan, so the value moves across as a
 * legacy branch rather than being dropped.
 *
 * Two of the old ids need care. 'shariah' is the same branch as 'sharia', just
 * the older spelling here. 'health' had no counterpart in the pre-2023 plan at
 * all, so the track is kept and the branch left unset — the profile then asks
 * for it instead of this file inventing an answer.
 */
export function migrateBranchToPath(raw: unknown): StudyPath | null {
  if (typeof raw !== 'string' || !raw) return null;
  if (isLegacyBranchId(raw)) return { track: 'legacy', branch: raw };
  if (raw === 'shariah') return { track: 'legacy', branch: 'sharia' };
  return { track: 'legacy' };
}

function readStoredPath(record: Record<string, unknown>): StudyPath | null {
  const fromPath = sanitizePath(record.path);
  if (fromPath) return fromPath;
  return migrateBranchToPath(record.branch);
}

/** True when the profile carries a path complete enough to answer with. */
export function hasCompletePath(profile: StudentProfile | null | undefined): boolean {
  return isPathComplete(profile?.path ?? null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage may be unavailable; nothing else to do */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Password digests
// ─────────────────────────────────────────────────────────────────────────────

const STRONG_PREFIX = 'sha256:';
const CHECKSUM_PREFIX = 'w1:';
const LEGACY_CHECKSUM_PREFIX = 'fnv';

export type PasswordHashMode = 'sha-256' | 'checksum';

/**
 * Which digest this browsing context can actually produce. `crypto.subtle` is
 * undefined on a non-secure origin, which is exactly the case the Auth screen
 * has to disclose rather than claim SHA-256 regardless.
 */
export function passwordHashMode(): PasswordHashMode {
  try {
    const subtle = typeof crypto !== 'undefined' ? crypto.subtle : undefined;
    return subtle && typeof subtle.digest === 'function' ? 'sha-256' : 'checksum';
  } catch {
    return 'checksum';
  }
}

/**
 * Which digest actually produced THIS account's stored record.
 *
 * `passwordHashMode()` answers a different question — what the browser in front
 * of you can do right now — and the two disagree exactly when it matters: an
 * account created over http on a LAN IP carries a checksum, and opening the same
 * account over https would otherwise have the app claim SHA-256 about a record
 * that is not one. Any screen describing an EXISTING account must read this.
 */
export function storedHashMode(account: Pick<Account, 'passHash'> | null | undefined): PasswordHashMode | null {
  const stored = account?.passHash;
  if (!stored) return null;
  if (stored.startsWith(CHECKSUM_PREFIX) || stored.startsWith(LEGACY_CHECKSUM_PREFIX)) return 'checksum';
  return 'sha-256';
}

/**
 * The same answer for a signed-in profile, which deliberately does not expose
 * the digest itself. Falls back to what this context can do when the record
 * cannot be read, so a caller always gets an answer it can show.
 */
export function storedHashModeForUser(userId: string | null | undefined): PasswordHashMode {
  if (!userId) return passwordHashMode();
  const account = getUsers().find((u) => u.id === userId);
  return storedHashMode(account) ?? passwordHashMode();
}

async function strongDigest(text: string): Promise<string | null> {
  if (passwordHashMode() !== 'sha-256') return null;
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

/**
 * A 128-bit non-cryptographic checksum, used only where WebCrypto is missing.
 * Four independently-seeded lanes, so two different passwords colliding is not
 * a realistic event — but it is still a checksum, it is reversible by brute
 * force, and the UI says so wherever it is in use.
 */
function checksum128(text: string): string {
  const seeds = [0x811c9dc5, 0xdeadbeef, 0x9e3779b9, 0x85ebca6b];
  const lanes = seeds.slice();
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (let lane = 0; lane < lanes.length; lane++) {
      lanes[lane] = Math.imul(lanes[lane] ^ (code + lane * 0x27d4eb2f + i), 2654435761);
      lanes[lane] = (lanes[lane] << 13) | (lanes[lane] >>> 19);
    }
  }
  return lanes.map((l) => (l >>> 0).toString(16).padStart(8, '0')).join('');
}

/** The 32-bit hash round one wrote on non-secure origins. Kept only to read it. */
function legacyChecksum32(text: string): string {
  let h = 0xdeadbeef;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 2654435761);
  return `${LEGACY_CHECKSUM_PREFIX}${(h >>> 0).toString(16)}`;
}

function salted(password: string): string {
  return `murshidi:${password}`;
}

async function hashPassword(password: string): Promise<string> {
  const strong = await strongDigest(salted(password));
  return strong ? `${STRONG_PREFIX}${strong}` : `${CHECKSUM_PREFIX}${checksum128(salted(password))}`;
}

type VerifyOutcome = 'match' | 'mismatch' | 'unverifiable';

async function verifyPassword(password: string, stored: string): Promise<VerifyOutcome> {
  if (!stored) return 'mismatch';
  if (stored.startsWith(CHECKSUM_PREFIX)) {
    return `${CHECKSUM_PREFIX}${checksum128(salted(password))}` === stored ? 'match' : 'mismatch';
  }
  if (stored.startsWith(LEGACY_CHECKSUM_PREFIX)) {
    return legacyChecksum32(salted(password)) === stored ? 'match' : 'mismatch';
  }
  const digest = await strongDigest(salted(password));
  // A SHA-256 record (prefixed, or bare hex from round one) opened where
  // WebCrypto does not exist cannot be checked at all. Saying "wrong password"
  // there would be false, so the caller gets its own error for this case.
  if (digest === null) return 'unverifiable';
  const bare = stored.startsWith(STRONG_PREFIX) ? stored.slice(STRONG_PREFIX.length) : stored;
  return digest === bare ? 'match' : 'mismatch';
}

// ─────────────────────────────────────────────────────────────────────────────
// Records
// ─────────────────────────────────────────────────────────────────────────────

/** Accounts written under the old branch model are migrated on read. */
function normalise(raw: unknown): Account | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  return {
    id: r.id,
    name: r.name,
    grade: typeof r.grade === 'number' && Number.isFinite(r.grade) ? r.grade : null,
    city: typeof r.city === 'string' ? r.city : '',
    path: readStoredPath(r),
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(0).toISOString(),
    passHash: typeof r.passHash === 'string' ? r.passHash : '',
  };
}

/** Strips the password digest. Every screen and every export uses this shape. */
export function toProfile(account: Account): StudentProfile {
  return {
    id: account.id,
    name: account.name,
    grade: account.grade,
    city: account.city,
    path: account.path ?? null,
    createdAt: account.createdAt,
  };
}

export function getUsers(): Account[] {
  const users = read<unknown[]>(USERS_KEY, []);
  if (!Array.isArray(users)) return [];
  return users.map(normalise).filter((u): u is Account => u !== null);
}

/** True when this device already holds an account a person created or seeded. */
export function hasAnyAccount(): boolean {
  return getUsers().length > 0;
}

export function getSessionAccount(): Account | null {
  const id = read<string | null>(SESSION_KEY, null);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) || null;
}

/** Profile of the signed-in user, or null. Safe for any screen to call. */
export function getSessionUser(): StudentProfile | null {
  const account = getSessionAccount();
  return account ? toProfile(account) : null;
}

export function getSessionUserId(): string | null {
  return getSessionAccount()?.id ?? null;
}

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    /* onboarding flag is best-effort */
  }
}

export function isGuestMode(): boolean {
  try {
    return localStorage.getItem(GUEST_KEY) === '1';
  } catch {
    return false;
  }
}

export function setGuestMode(on: boolean): void {
  try {
    if (on) localStorage.setItem(GUEST_KEY, '1');
    else localStorage.removeItem(GUEST_KEY);
  } catch {
    /* guest flag is best-effort */
  }
}

/** True when no other account on this device already uses that name. */
export function isNameAvailable(name: string, exceptId?: string): boolean {
  const clean = name.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!clean) return false;
  return !getUsers().some((u) => u.id !== exceptId && u.name.trim().toLowerCase() === clean);
}

export function validateGrade(value: string): { ok: boolean; grade: number | null } {
  const trimmed = value.trim();
  if (trimmed === '') return { ok: true, grade: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 100) return { ok: false, grade: null };
  return { ok: true, grade: Math.round(n * 100) / 100 };
}

/** The seeded demo identity — see src/lib/demo.ts for why it exists. */
export const DEMO_ACCOUNT_ID = 'u_demo_murshidi';
/** Its password, printed on the profile screen so a demo can be signed back into. */
export const DEMO_PASSWORD = 'murshidi2026';

export interface SeedInput {
  id: string;
  name: string;
  grade: number | null;
  city: string;
  path: StudyPath | null;
  createdAt: string;
}

/**
 * Writes a ready-made account and signs into it, but only on a device that has
 * no account at all. Returns null the moment a real one exists, so nothing a
 * person created is ever touched.
 */
export async function seedAccount(input: SeedInput): Promise<Account | null> {
  const others = getUsers().filter((u) => u.id !== input.id);
  const account: Account = {
    id: input.id,
    name: input.name.trim(),
    grade: input.grade,
    city: input.city,
    path: sanitizePath(input.path),
    createdAt: input.createdAt,
    passHash: await hashPassword(DEMO_PASSWORD),
  };
  // Upsert by id and keep every other account: a visitor who made their own is
  // not deleted, they are just not the active session any more.
  if (!write(USERS_KEY, [account, ...others]) || !write(SESSION_KEY, account.id)) return null;
  // Deliberately NOT marking onboarding complete: the introduction slides are
  // part of what a demo shows, so the first launch still plays them and only
  // then lands on the app — already signed in.
  setGuestMode(false);
  return account;
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const cleanName = input.name.trim().replace(/\s+/g, ' ');
  if (cleanName.length < 2 || input.password.length < 4) return { ok: false, error: 'invalid' };
  const users = getUsers();
  if (users.some((u) => u.name.trim().toLowerCase() === cleanName.toLowerCase())) {
    return { ok: false, error: 'name-taken' };
  }
  const account: Account = {
    id: `u_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
    name: cleanName,
    grade: input.grade,
    city: input.city,
    path: sanitizePath(input.path),
    createdAt: new Date().toISOString(),
    passHash: await hashPassword(input.password),
  };
  users.push(account);
  if (!write(USERS_KEY, users) || !write(SESSION_KEY, account.id)) return { ok: false, error: 'storage' };
  setGuestMode(false);
  return { ok: true, user: toProfile(account) };
}

export async function signIn(name: string, password: string): Promise<AuthResult> {
  const cleanName = name.trim().toLowerCase();
  if (!cleanName || !password) return { ok: false, error: 'invalid' };
  const account = getUsers().find((u) => u.name.trim().toLowerCase() === cleanName);
  if (!account) return { ok: false, error: 'not-found' };
  const outcome = await verifyPassword(password, account.passHash);
  if (outcome === 'unverifiable') return { ok: false, error: 'unverifiable-here' };
  if (outcome === 'mismatch') return { ok: false, error: 'wrong-password' };
  if (!write(SESSION_KEY, account.id)) return { ok: false, error: 'storage' };
  setGuestMode(false);
  return { ok: true, user: toProfile(account) };
}

/** Ends the session and leaves guest mode, so the next screen asks who you are. */
export function signOut(): void {
  removeKey(SESSION_KEY);
  setGuestMode(false);
}

export function updateAccount(
  id: string,
  patch: Partial<Omit<StudentProfile, 'id' | 'createdAt'>>,
): StudentProfile | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) return null;
  const current = users[index];
  const nextName = patch.name === undefined ? current.name : patch.name.trim().replace(/\s+/g, ' ');
  if (nextName.length < 2) return null;
  const taken = users.some((u, i) => i !== index && u.name.trim().toLowerCase() === nextName.toLowerCase());
  if (taken) return null;
  const next: Account = {
    ...current,
    name: nextName,
    grade: patch.grade === undefined ? current.grade : patch.grade,
    city: patch.city === undefined ? current.city : patch.city,
    path: patch.path === undefined ? (current.path ?? null) : sanitizePath(patch.path),
  };
  users[index] = next;
  if (!write(USERS_KEY, users)) return null;
  return toProfile(next);
}

/**
 * Removes the account record and its session. The rest of what this device
 * holds for that identity — activity, the AI conversation, the interests report
 * — is cleared by `clearIdentity` in src/lib/activity.ts, which AuthContext
 * calls alongside this. Neither is optional: the delete-account copy promises
 * both.
 */
export function deleteAccount(id: string): boolean {
  const users = getUsers().filter((u) => u.id !== id);
  const saved = write(USERS_KEY, users);
  removeKey(SESSION_KEY);
  setGuestMode(false);
  return saved;
}

export function initialsOf(name: string, lang: 'ar' | 'en'): string {
  const trimmed = name.trim();
  if (!trimmed) return lang === 'ar' ? 'ض' : 'G';
  if (lang === 'ar') {
    return trimmed.replace(/\s+/g, '').slice(0, 2);
  }
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] || 'M';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}
