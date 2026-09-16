// Which models the advisor tries, and in what order.
//
// Verified live against OpenRouter on 16 Sep 2026:
//  - google/gemma-4-31b-it:free      exists, 262k context, $0 in / $0 out.
//                                    Returned HTTP 429 "temporarily rate-limited
//                                    upstream" from the shared Google AI Studio pool.
//  - google/gemma-4-31b-it           paid ($0.09/M in, $0.34/M out), answered normally.
//
// That is why the chain exists and why the offline layer at the end of it is not
// decoration: on the day this was written, the free tier alone would have shown a
// dead chat.

import { getEnvModel, getModelPreference, setModelPreference } from '../openrouter';

export interface ModelOption {
  id: string;
  /** True for the `:free` variants, which cost nothing but share an upstream quota. */
  free: boolean;
  /** Human-readable size/behaviour hint; the UI adds the free/paid wording itself. */
  shortLabel: string;
}

/** The model Zaid asked for, and the app default. */
export const DEFAULT_MODEL = 'google/gemma-4-31b-it:free';

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'google/gemma-4-31b-it:free', free: true, shortLabel: 'Gemma 4 · 31B' },
  { id: 'google/gemma-4-31b-it', free: false, shortLabel: 'Gemma 4 · 31B' },
];

const MODEL_IDS = MODEL_OPTIONS.map((m) => m.id);

export function isKnownModel(id: string): boolean {
  return MODEL_IDS.includes(id);
}

export function modelOption(id: string): ModelOption | undefined {
  return MODEL_OPTIONS.find((m) => m.id === id);
}

/**
 * The model tried first: the user's saved choice, else VITE_OPENROUTER_MODEL,
 * else the documented default.
 */
export function preferredModel(): string {
  const stored = getModelPreference();
  if (stored && isKnownModel(stored)) return stored;
  const fromEnv = getEnvModel();
  if (fromEnv && isKnownModel(fromEnv)) return fromEnv;
  return DEFAULT_MODEL;
}

export function selectModel(id: string): void {
  setModelPreference(isKnownModel(id) ? id : '');
}

/** Preferred model first, then every remaining model in documented order. */
export function modelChain(): string[] {
  const first = preferredModel();
  return [first, ...MODEL_IDS.filter((id) => id !== first)];
}
