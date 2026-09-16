import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * 'session' — the visitor must have made a choice at /auth: signed in OR guest.
 * 'account' — a real account is required, because the screen writes data that
 *             has to survive the visit. Guests are sent to /auth with a reason.
 */
export type AuthRequirement = 'session' | 'account';

/** Passed to /auth through router state so the visitor lands back where they aimed. */
export interface AuthRedirectState {
  from?: string;
  reason?: AuthRequirement;
}

interface Props {
  children: ReactNode;
  mode?: AuthRequirement;
}

export default function RequireAuth({ children, mode = 'session' }: Props) {
  const { user, isGuest, ready } = useAuth();
  const location = useLocation();

  // Until localStorage has been read once we cannot know who this is, so we
  // hold an empty field rather than redirecting a signed-in user to /auth.
  if (!ready) {
    return <div className="min-h-screen bg-gov-bg" aria-hidden="true" />;
  }

  const allowed = mode === 'account' ? user !== null : user !== null || isGuest;
  if (!allowed) {
    const state: AuthRedirectState = {
      from: `${location.pathname}${location.search}`,
      reason: mode,
    };
    return <Navigate to="/auth" replace state={state} />;
  }

  return <>{children}</>;
}
