// Low-level OpenRouter transport for Murshidi.
//
// This module knows how to talk to one model. It does NOT decide which model to
// use, does not retry, and does not fall back — that orchestration lives in
// src/lib/ai/index.ts. Keeping the layers apart is what lets the fallback chain
// stay readable.
//
// SECURITY: the API key is never written into a tracked file. It is read at
// runtime from a local override in localStorage, otherwise from the build-time
// env var VITE_OPENROUTER_KEY (supplied via .env.local, which is gitignored).

export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/** localStorage slot that lets a user paste their own key and override the build key. */
export const KEY_OVERRIDE_STORAGE = 'murshidi.or.key';

/** localStorage slot for the model the user picked in the chat settings. */
export const MODEL_PREFERENCE_STORAGE = 'murshidi.or.model';

/**
 * Free-model daily request allowance reported by OpenRouter itself for this key
 * (GET https://openrouter.ai/api/v1/key -> data.free_model_daily_requests.limit).
 * Checked against the live endpoint on 16 Sep 2026: limit 1000.
 */
export const FREE_MODEL_DAILY_REQUESTS = 1000;

function readEnv(name: string): string {
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  const value = env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function readStorage(key: string): string {
  try {
    return localStorage.getItem(key)?.trim() ?? '';
  } catch {
    return '';
  }
}

/** Key resolution order: local override -> build-time env var. */
export function getApiKey(): string {
  return readStorage(KEY_OVERRIDE_STORAGE) || readEnv('VITE_OPENROUTER_KEY');
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

export function hasKeyOverride(): boolean {
  return readStorage(KEY_OVERRIDE_STORAGE).length > 0;
}

export function setKeyOverride(value: string): void {
  try {
    const trimmed = value.trim();
    if (trimmed) localStorage.setItem(KEY_OVERRIDE_STORAGE, trimmed);
    else localStorage.removeItem(KEY_OVERRIDE_STORAGE);
  } catch {
    /* storage is optional */
  }
}

function referer(): string {
  return readEnv('VITE_OPENROUTER_REFERER') || 'https://murshidi.app';
}

/** Model id configured at build time via VITE_OPENROUTER_MODEL, if any. */
export function getEnvModel(): string {
  return readEnv('VITE_OPENROUTER_MODEL');
}

/** Model the user picked in the chat settings, '' when they never changed it. */
export function getModelPreference(): string {
  return readStorage(MODEL_PREFERENCE_STORAGE);
}

export function setModelPreference(value: string): void {
  try {
    const trimmed = value.trim();
    if (trimmed) localStorage.setItem(MODEL_PREFERENCE_STORAGE, trimmed);
    else localStorage.removeItem(MODEL_PREFERENCE_STORAGE);
  } catch {
    /* storage is optional */
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
  /** When supplied the call streams and this fires for every delta. */
  onToken?: (chunk: string) => void;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  /** Full answer text. */
  text: string;
  /** Model id the provider reports as having answered — may differ from the requested id. */
  model: string;
}

export class OpenRouterError extends Error {
  status: number;
  /** True for 429 / 5xx — worth one retry on the same model before moving on. */
  retryable: boolean;

  constructor(message: string, status: number, retryable: boolean) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
    this.retryable = retryable;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/** Default wall-clock ceiling for a single model attempt, so a hung provider still falls through. */
const REQUEST_TIMEOUT_MS = 45_000;

/**
 * Combines the caller's signal with an internal timeout. Written by hand rather
 * than with AbortSignal.any so the app keeps working on older WebViews.
 */
function withTimeout(external: AbortSignal | undefined, ms: number) {
  const controller = new AbortController();
  const abort = () => controller.abort(external?.reason);
  if (external) {
    if (external.aborted) controller.abort(external.reason);
    else external.addEventListener('abort', abort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'AbortError')), ms);
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
      external?.removeEventListener('abort', abort);
    },
  };
}

function errorMessageFrom(body: string, status: number): string {
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      const err = (parsed as { error?: { message?: unknown } }).error;
      if (err && typeof err.message === 'string') return err.message;
    }
  } catch {
    /* body was not JSON */
  }
  return `HTTP ${status}`;
}

function buildBody(req: CompletionRequest, stream: boolean): string {
  const payload: Record<string, unknown> = {
    model: req.model,
    messages: req.messages,
    temperature: req.temperature ?? 0.5,
    max_tokens: req.maxTokens ?? 900,
  };
  if (stream) payload.stream = true;
  if (req.json) payload.response_format = { type: 'json_object' };
  return JSON.stringify(payload);
}

/**
 * Calls one model once. Throws OpenRouterError on a non-2xx or empty answer, and
 * rethrows AbortError untouched so callers can tell "user stopped" from "failed".
 */
export async function requestCompletion(req: CompletionRequest): Promise<CompletionResponse> {
  const apiKey = getApiKey();
  if (!apiKey) throw new OpenRouterError('missing key', 0, false);

  const stream = typeof req.onToken === 'function';
  const { signal, cleanup } = withTimeout(req.signal, REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': referer(),
        'X-Title': 'Murshidi',
      },
      body: buildBody(req, stream),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const retryable = res.status === 429 || res.status >= 500;
      throw new OpenRouterError(errorMessageFrom(body, res.status), res.status, retryable);
    }

    return stream ? await readStream(res, req) : await readJson(res, req.model);
  } finally {
    cleanup();
  }
}

async function readJson(res: Response, requestedModel: string): Promise<CompletionResponse> {
  const data: unknown = await res.json();
  let text = '';
  let model = requestedModel;

  if (data && typeof data === 'object') {
    const shaped = data as { model?: unknown; choices?: Array<{ message?: { content?: unknown } }> };
    if (typeof shaped.model === 'string' && shaped.model) model = shaped.model;
    const content = Array.isArray(shaped.choices) ? shaped.choices[0]?.message?.content : undefined;
    if (typeof content === 'string') text = content;
  }

  text = text.trim();
  if (!text) throw new OpenRouterError('empty answer', 204, true);
  return { text, model };
}

interface StreamChunk {
  model?: unknown;
  choices?: Array<{ delta?: { content?: unknown }; message?: { content?: unknown } }>;
}

/**
 * Parses an SSE body. Verified against the live endpoint on 16 Sep 2026: deltas
 * arrive as `data: {...}` lines separated by blank lines, keep-alives arrive as
 * `: OPENROUTER PROCESSING` comment lines, and the stream ends with `data: [DONE]`.
 */
async function readStream(res: Response, req: CompletionRequest): Promise<CompletionResponse> {
  if (!res.body) throw new OpenRouterError('no stream body', 0, true);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let model = req.model;

  const consume = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':')) return;
    if (!trimmed.startsWith('data:')) return;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === '[DONE]') return;
    let chunk: StreamChunk;
    try {
      chunk = JSON.parse(payload) as StreamChunk;
    } catch {
      return; // a partial frame we will see again once the buffer fills
    }
    if (typeof chunk.model === 'string' && chunk.model) model = chunk.model;
    const choice = chunk.choices?.[0];
    const delta = choice?.delta?.content ?? choice?.message?.content;
    if (typeof delta === 'string' && delta) {
      text += delta;
      req.onToken?.(delta);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) consume(line);
    }
    if (buffer) consume(buffer);
  } finally {
    reader.cancel().catch(() => undefined);
  }

  text = text.trim();
  if (!text) throw new OpenRouterError('empty stream', 204, true);
  return { text, model };
}
