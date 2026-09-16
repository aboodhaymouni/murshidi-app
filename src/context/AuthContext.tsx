import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  deleteAccount as deleteStoredAccount,
  getSessionUser,
  hasAnyAccount,
  isGuestMode,
  setGuestMode,
  signIn as signInAccount,
  signOut as signOutAccount,
  signUp as signUpAccount,
  toProfile,
  updateAccount,
} from '../lib/account';
import type { AuthResult, SignUpInput, StudentProfile } from '../lib/account';
import { clearIdentity } from '../lib/activity';
import { seedDemoIdentity } from '../lib/demo';

export type {
  AcademicFieldId, AuthResult, LegacyBranchId, SignUpInput, StudentProfile,
  StudyPath, TrackId, VocationalProgramId,
} from '../lib/account';

export interface AuthValue {
  /** null = nobody is signed in (the visitor may still be a guest). */
  user: StudentProfile | null;
  /** true when the visitor chose "continue as guest". */
  isGuest: boolean;
  /** false until localStorage has been read once; guards hold the shell meanwhile. */
  ready: boolean;
  signIn(name: string, password: string): Promise<AuthResult>;
  signUp(input: SignUpInput): Promise<AuthResult>;
  signOut(): void;
  continueAsGuest(): void;
  updateProfile(patch: Partial<Omit<StudentProfile, 'id' | 'createdAt'>>): void;
  deleteAccount(): void;
}

interface SessionState {
  user: StudentProfile | null;
  isGuest: boolean;
  ready: boolean;
}

const SIGNED_OUT: SessionState = { user: null, isGuest: false, ready: true };

/**
 * The single read of localStorage. It runs in the state initialiser rather than
 * in an effect so that `ready` is already true on the first paint — a guard
 * that redirected on frame one and corrected itself on frame two would bounce a
 * signed-in visitor through /auth on every reload. `ready` stays part of the
 * value because it is never true before this read has happened.
 */
function readSession(): SessionState {
  const stored = getSessionUser();
  if (stored) return { user: stored, isGuest: false, ready: true };
  const guest = isGuestMode();
  // Not signed in and not a guest: a demo identity may still be seeded on the
  // first launch of a fresh device, so hold `ready` until that has been decided
  // rather than flashing the sign-in screen for one frame.
  return { user: null, isGuest: guest, ready: guest || hasAnyAccount() };
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [session, setSession] = useState<SessionState>(readSession);
  const { user, isGuest, ready } = session;

  // First launch on a device that has never had an account lands signed into a
  // prepared demo profile, so a live demo opens on a working app instead of an
  // empty form. A device that already has an account is never touched.
  useEffect(() => {
    let cancelled = false;
    seedDemoIdentity()
      .then((account) => {
        if (cancelled) return;
        // A null result means the demo was already seeded on this device, so
        // whatever session is on screen is the right one — leave it alone.
        if (account) setSession({ user: toProfile(account), isGuest: false, ready: true });
        else setSession((current) => (current.ready ? current : SIGNED_OUT));
      })
      .catch(() => {
        if (!cancelled) setSession((current) => (current.ready ? current : SIGNED_OUT));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (name: string, password: string): Promise<AuthResult> => {
    const result = await signInAccount(name, password);
    if (result.ok && result.user) {
      setSession({ user: result.user, isGuest: false, ready: true });
    }
    return result;
  }, []);

  const signUp = useCallback(async (input: SignUpInput): Promise<AuthResult> => {
    const result = await signUpAccount(input);
    if (result.ok && result.user) {
      setSession({ user: result.user, isGuest: false, ready: true });
    }
    return result;
  }, []);

  const signOut = useCallback(() => {
    signOutAccount();
    setSession(SIGNED_OUT);
  }, []);

  const continueAsGuest = useCallback(() => {
    setGuestMode(true);
    setSession({ user: null, isGuest: true, ready: true });
  }, []);

  // A guest has no record to write to, so this is deliberately a no-op for them:
  // editing a profile is one of the things that genuinely needs an account.
  const updateProfile = useCallback(
    (patch: Partial<Omit<StudentProfile, 'id' | 'createdAt'>>) => {
      if (!user) return;
      const next = updateAccount(user.id, patch);
      if (next) setSession({ user: next, isGuest: false, ready: true });
    },
    [user],
  );

  // Order matters: the per-identity keys are cleared while the id is still
  // known, then the record itself. `clearIdentity` covers the activity store,
  // the interests report AND the AI conversation, which is what the
  // delete-account copy promises.
  const deleteAccount = useCallback(() => {
    if (!user) return;
    clearIdentity(user.id);
    deleteStoredAccount(user.id);
    setSession(SIGNED_OUT);
  }, [user]);

  const value = useMemo<AuthValue>(
    () => ({ user, isGuest, ready, signIn, signUp, signOut, continueAsGuest, updateProfile, deleteAccount }),
    [user, isGuest, ready, signIn, signUp, signOut, continueAsGuest, updateProfile, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const FALLBACK: AuthValue = {
  user: null,
  isGuest: false,
  ready: false,
  signIn: async () => ({ ok: false, error: 'storage' }),
  signUp: async () => ({ ok: false, error: 'storage' }),
  signOut: () => {},
  continueAsGuest: () => {},
  updateProfile: () => {},
  deleteAccount: () => {},
};

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs next to the provider it reads; src/i18n/LangContext.tsx follows the same shape
export function useAuth(): AuthValue {
  return useContext(AuthContext) ?? FALLBACK;
}
