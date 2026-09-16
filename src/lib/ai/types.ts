// Public types for the Murshidi AI layer. Kept in their own module so the
// rule-based fallback can import them without creating a cycle through index.ts.

import type { StudyPath } from '../tawjihi';

/**
 * What the advisor is told about the student.
 *
 * There is deliberately no `name` field. Round one interpolated the student's
 * free-text display name into a system-role message, which made a 60-character
 * text input an instruction channel into the only prompt enforcing the app's
 * honesty rules. The name contributed nothing to an answer, so the field is gone
 * rather than escaped — see ./student.ts for the reasoning and the validators.
 *
 * Every remaining field is machine-checkable: a number in range, a governorate
 * from the app's own list, and a `StudyPath` whose identifiers are validated
 * against src/lib/tawjihi.ts.
 */
export interface AiProfileContext {
  /** Tawjihi average out of 100. */
  grade?: number | null;
  /** Governorate label; dropped unless it matches the app's published list. */
  city?: string | null;
  /** Track + field/programme/branch. `null` until the student chooses one. */
  path?: StudyPath | null;
  lang: 'ar' | 'en';
}

export interface AskOptions {
  history?: { role: 'user' | 'assistant'; content: string }[];
  profile?: AiProfileContext;
  signal?: AbortSignal;
  /**
   * Fires for every streamed delta.
   *
   * Treat what arrives here as a live preview, not the final answer: if a model
   * dies mid-stream the chain restarts on the next model and tokens begin again
   * from the top. When the promise resolves, replace whatever you accumulated
   * with `AiResult.text`, which is always the authoritative full answer.
   */
  onToken?: (chunk: string) => void;
  /** Overrides the default advisor prompt (which already carries the grounding block). */
  system?: string;
  json?: boolean;
  maxTokens?: number;
}

export interface AiResult {
  text: string;
  /** The model id that actually answered, or 'local-rules' for the offline layer. */
  model: string;
  /** 'local' = every remote attempt failed and this is the rule-based answer. */
  source: 'ai' | 'local';
}
