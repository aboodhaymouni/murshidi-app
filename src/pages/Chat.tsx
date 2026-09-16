import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  FileText,
  MessageSquare,
  RotateCcw,
  Send,
  Square,
  Trash2,
  WifiOff,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useKeyboardOpen } from '../hooks/useKeyboardOpen';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import { aiStatus, askAi } from '../lib/ai';
import type { AiProfileContext } from '../lib/ai';
import { DEFAULT_MODEL, modelOption, preferredModel } from '../lib/ai/config';
import { readStudyPath, safeCity, safeGrade } from '../lib/ai/student';
import { isPathComplete, pathLabel } from '../lib/tawjihi';
import { recordActivity } from '../lib/activity';

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: number;
  /** Model id that produced this turn — undefined for user turns. */
  model?: string;
  source?: 'ai' | 'local';
  stopped?: boolean;
}

const STORAGE_PREFIX = 'murshidi.chat.';
const MAX_STORED_TURNS = 40;

const SUGGESTION_KEYS = [
  'ai.suggest.1',
  'ai.suggest.2',
  'ai.suggest.3',
  'ai.suggest.4',
  'ai.suggest.5',
  'ai.suggest.6',
] as const;

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(at: number): string {
  const d = new Date(at);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function loadThread(key: string): ChatTurn[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): ChatTurn[] => {
      if (!entry || typeof entry !== 'object') return [];
      const turn = entry as Partial<ChatTurn>;
      if (typeof turn.text !== 'string' || !turn.text) return [];
      if (turn.role !== 'user' && turn.role !== 'assistant') return [];
      return [
        {
          id: typeof turn.id === 'string' ? turn.id : newId(),
          role: turn.role,
          text: turn.text,
          at: typeof turn.at === 'number' ? turn.at : Date.now(),
          model: typeof turn.model === 'string' ? turn.model : undefined,
          source: turn.source === 'ai' || turn.source === 'local' ? turn.source : undefined,
          stopped: turn.stopped === true,
        },
      ];
    });
  } catch {
    return [];
  }
}

function saveThread(key: string, turns: ChatTurn[]): void {
  try {
    if (turns.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(turns.slice(-MAX_STORED_TURNS)));
  } catch {
    /* storage is optional — the conversation simply will not survive a reload */
  }
}

/**
 * Signed-in students each get their own thread; guests share one. The thread
 * component is keyed on that storage slot so switching account remounts it with
 * the right conversation instead of mutating state inside an effect.
 */
export default function Chat() {
  const { lang } = useLang();
  const { user } = useAuth();

  const storageKey = STORAGE_PREFIX + (user?.id ?? 'guest');

  /**
   * Only machine-checkable facts reach the advisor. The student's display name
   * used to be concatenated into the system prompt, which made a 60-character
   * text field an instruction channel into the one prompt enforcing the app's
   * honesty rules; it is gone, and every remaining value is validated in
   * src/lib/ai/student.ts before it travels.
   */
  const profile = useMemo<AiProfileContext>(
    () => ({
      grade: safeGrade(user?.grade),
      city: safeCity(user?.city),
      path: readStudyPath(user),
      lang,
    }),
    [user, lang],
  );

  return <ChatThread key={storageKey} storageKey={storageKey} profile={profile} />;
}

function ChatThread({ storageKey, profile }: { storageKey: string; profile: AiProfileContext }) {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const keyboardOpen = useKeyboardOpen();

  const [messages, setMessages] = useState<ChatTurn[]>(() => loadThread(storageKey));
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [notice, setNotice] = useState<'local' | 'stopped' | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  // The model and the key are settings the app decides, not the reader: the
  // chain tries the free Gemma first and falls back on its own.
  const model = preferredModel();
  const configured = aiStatus().configured;

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Persist once a turn has settled; writing on every streamed token would
  // hammer localStorage for no benefit.
  useEffect(() => {
    if (streaming) return;
    saveThread(storageKey, messages);
  }, [messages, streaming, storageKey]);

  // Follow the conversation down, but leave the opening screen at the top so the
  // welcome and the engine status are the first things a visitor sees.
  useEffect(() => {
    if (messages.length === 0) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming]);

  // "Clear" asks for a second tap; the ask expires so it cannot sit there armed.
  useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  // Leaving the page must not leave a request running.
  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(
    async (question: string, history: ChatTurn[]) => {
      const controller = new AbortController();
      abortRef.current = controller;
      const answerId = newId();

      setNotice(null);
      setStreaming(true);
      setMessages((prev) => [...prev, { id: answerId, role: 'assistant', text: '', at: Date.now() }]);

      try {
        const result = await askAi(question, {
          history: history
            .filter((turn) => turn.text.trim())
            .map((turn) => ({ role: turn.role, content: turn.text })),
          profile,
          signal: controller.signal,
          onToken: (chunk) => {
            setMessages((prev) =>
              prev.map((turn) => (turn.id === answerId ? { ...turn, text: turn.text + chunk } : turn)),
            );
          },
        });
        // The streamed tokens are a preview; the resolved text is authoritative.
        setMessages((prev) =>
          prev.map((turn) =>
            turn.id === answerId
              ? { ...turn, text: result.text, model: result.model, source: result.source }
              : turn,
          ),
        );
        if (result.source === 'local') setNotice('local');
      } catch (error) {
        if (isAbortError(error)) {
          setMessages((prev) =>
            prev
              .map((turn) => (turn.id === answerId ? { ...turn, stopped: true } : turn))
              .filter((turn) => turn.id !== answerId || turn.text.trim().length > 0),
          );
          setNotice('stopped');
        } else {
          // askAi absorbs model failures itself, so anything else is unexpected.
          setMessages((prev) => prev.filter((turn) => turn.id !== answerId));
          setNotice('local');
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStreaming(false);
      }
    },
    [profile],
  );

  const send = useCallback(
    (text: string) => {
      const question = text.trim();
      if (!question || streaming) return;
      recordActivity('aiQuestion');
      const history = messages;
      setMessages((prev) => [...prev, { id: newId(), role: 'user', text: question, at: Date.now() }]);
      setInput('');
      void run(question, history);
    },
    [messages, run, streaming],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const lastQuestion = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user') return messages[i].text;
    }
    return null;
  }, [messages]);

  const retry = useCallback(() => {
    if (streaming || !lastQuestion) return;
    let cut = messages.length;
    while (cut > 0 && messages[cut - 1].role === 'assistant') cut -= 1;
    const trimmed = messages.slice(0, cut);
    const history = trimmed.slice(0, -1);
    setMessages(trimmed);
    void run(lastQuestion, history);
  }, [lastQuestion, messages, run, streaming]);

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setNotice(null);
    setConfirmClear(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* storage is optional */
    }
  }, [storageKey]);



  const modelLabel = (id: string): string => {
    const option = modelOption(id);
    const base = option ? option.shortLabel : id;
    const tier = option?.free === false ? t('ai.model.paid') : t('ai.model.free');
    const isDefault = id === DEFAULT_MODEL ? ` · ${t('ai.model.default')}` : '';
    return `${base} · ${tier}${isDefault}`;
  };

  const empty = messages.length === 0;

  // The advisor answers eligibility questions from the student's own row of the
  // Ministry's table, so the page says plainly which row it is using — and says
  // nothing about eligibility at all when no path has been set.
  const pathKnown = isPathComplete(profile.path);

  return (
    <div className="h-screen bg-gov-bg flex flex-col overflow-hidden">
      <PageHeader
        title={t('ai.title')}
        subtitle={t('ai.subtitle')}
        right={
          <span className={`gov-badge ${configured ? 'gov-badge-success' : 'gov-badge-neutral'}`}>
            {configured ? (
              <span className="w-1.5 h-1.5 rounded-full bg-gov-ok" />
            ) : (
              <WifiOff size={11} aria-hidden="true" />
            )}
            {configured ? t('ai.status.online') : t('ai.status.offline')}
          </span>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-40 space-y-3">

        {/* Which row of the Ministry's table this conversation is grounded in */}
        <div className="gov-card p-3">
          <div className="flex items-start gap-2">
            <span
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                pathKnown ? 'bg-gov-navy/10 text-gov-navy' : 'bg-gov-bg text-gov-muted'
              }`}
            >
              <Compass size={16} aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0 text-start">
              <p className="text-xs font-bold text-gov-ink">
                {t('ai.path.title')}:{' '}
                <span className={pathKnown ? 'text-gov-navy' : 'text-gov-muted'}>
                  {pathKnown ? pathLabel(profile.path ?? null, lang) : t('ai.path.unset')}
                </span>
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-gov-muted">
                {pathKnown ? t('ai.path.grounded') : t('ai.path.unsetNote')}
              </p>
              {!pathKnown && (
                <button type="button" onClick={() => navigate('/profile/edit')} className="btn-ghost mt-2">
                  {t('ai.path.cta')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Opening message — not part of the stored thread */}
        <div className="flex justify-start">
          <div className="max-w-[88%]">
            <div className="p-3 bg-white border border-gov-line text-gov-ink rounded-lg rounded-ss-none">
              <p className="text-sm leading-relaxed whitespace-pre-line break-words">{t('ai.intro')}</p>
            </div>
          </div>
        </div>

        {notice && (
          <p
            role="status"
            className={`text-[11px] leading-relaxed rounded-gov p-2.5 border ${
              notice === 'local'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-gov-bg-soft border-gov-line text-gov-body'
            }`}
          >
            {notice === 'local' ? t('ai.notice.local') : t('ai.notice.stopped')}
          </p>
        )}

        {messages.map((turn) => {
          const mine = turn.role === 'user';
          return (
            <div key={turn.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[88%] min-w-0">
                <div
                  className={`p-3 rounded-lg ${
                    mine
                      ? 'bg-gov-navy text-white rounded-se-none'
                      : 'bg-white border border-gov-line text-gov-ink rounded-ss-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                    {turn.text}
                    {streaming && !mine && !turn.text && (
                      <span className="text-gov-muted">{t('ai.thinking')}</span>
                    )}
                  </p>
                </div>
                <div
                  className={`flex flex-wrap items-center gap-1.5 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <span className="text-[10px] text-gov-muted">
                    {mine ? t('ai.role.you') : t('ai.role.advisor')} · {formatTime(turn.at)}
                  </span>
                  {!mine && turn.source === 'local' && (
                    <span className="gov-badge gov-badge-warn" title={t('ai.source.localHint')}>
                      {t('ai.source.local')}
                    </span>
                  )}
                  {!mine && turn.source === 'ai' && (
                    <span className="gov-badge gov-badge-neutral" title={turn.model}>
                      {modelLabel(turn.model ?? model)}
                    </span>
                  )}
                  {!mine && turn.stopped && (
                    <span className="gov-badge gov-badge-neutral">{t('ai.stopped')}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!empty && !streaming && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={retry}
              disabled={!lastQuestion}
              className="btn-secondary px-3 min-h-[44px] flex items-center gap-1.5"
            >
              <RotateCcw size={14} aria-hidden="true" />
              {t('ai.retry')}
            </button>
            <button
              type="button"
              onClick={() => (confirmClear ? clearConversation() : setConfirmClear(true))}
              className={`text-xs px-3 min-h-[44px] flex items-center gap-1.5 rounded-gov border ${
                confirmClear
                  ? 'border-gov-danger text-gov-danger bg-white font-bold'
                  : 'border-gov-line text-gov-muted bg-white'
              }`}
            >
              <Trash2 size={14} aria-hidden="true" />
              {confirmClear ? t('ai.clear.confirm') : t('ai.clear')}
            </button>
            <span className="text-[10px] text-gov-muted">{t('ai.notice.saved')}</span>
          </div>
        )}

        {empty && (
          <div className="mt-4">
            <p className="text-[11px] text-gov-muted mb-2 font-semibold">{t('ai.suggestions.title')}</p>
            <div className="space-y-2">
              {SUGGESTION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => send(t(key))}
                  className="w-full text-start p-3 bg-white border border-gov-line rounded-gov text-xs text-gov-body hover:bg-gov-bg-soft hover:border-gov-navy transition-colors flex items-start gap-2 min-h-[44px]"
                >
                  <MessageSquare size={13} aria-hidden="true" className="text-gov-navy shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t(key)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 bg-gov-bg-soft border border-gov-line rounded-gov p-3">
          <div className="flex items-start gap-2">
            <FileText size={14} aria-hidden="true" className="text-gov-muted shrink-0 mt-0.5" />
            <p className="text-[11px] text-gov-muted leading-relaxed">{t('ai.disclaimer')}</p>
          </div>
        </div>
      </div>

      {/* Composer — sits above the bottom nav, drops to the edge when the keyboard opens */}
      <div
        className="fixed inset-x-0 bg-white border-t border-gov-line p-3 z-30 transition-all"
        style={{ bottom: keyboardOpen ? 0 : 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}
      >
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send(input);
            }}
            placeholder={t('ai.input.placeholder')}
            aria-label={t('ai.input.placeholder')}
            className="gov-input flex-1 min-h-[44px]"
          />
          {streaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label={t('ai.stop')}
              className="w-11 min-h-[44px] shrink-0 flex items-center justify-center rounded-gov border border-gov-navy text-gov-navy bg-white"
            >
              <Square size={14} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim()}
              aria-label={t('ai.send')}
              // Not .btn-primary: its disabled state is white-on-light-grey, which
              // leaves the icon unreadable at rest.
              className="w-11 min-h-[44px] shrink-0 flex items-center justify-center rounded-gov bg-gov-navy text-white disabled:bg-gov-line disabled:text-gov-muted"
            >
              <Send size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
