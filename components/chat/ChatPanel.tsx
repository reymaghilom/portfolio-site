"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  CHAT_BUSY,
  CHAT_ERROR,
  CHAT_QUOTA,
  CHAT_QUICK_QUESTIONS,
  CHAT_RATE_LIMITED,
  CHAT_WELCOME,
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  type ChatTurn,
} from "@/lib/chat-config";
import { profile } from "@/data/portfolio";
import { ChatSparkIcon, CloseIcon, ResetIcon, SendIcon } from "../icons";

/** Matches the .chat-panel-out animation in globals.css. */
const CLOSE_MS = 180;

type Message = ChatTurn & { id: number; failed?: boolean };

type ChatPanelProps = {
  id: string;
  open: boolean;
  onClose: () => void;
};

/**
 * Renders a reply as paragraphs and simple "- " lists. Text only (React escapes it), so
 * nothing from the model can become markup; stray Markdown emphasis is dropped.
 */
function Reply({ text }: { text: string }) {
  const bullet = /^\s*[-•*]\s+/;
  // Paragraph and list runs, in order: blank lines end a paragraph, and consecutive "- "
  // lines form a list (so "He has built:" followed by items reads as text, then a list).
  const runs: { list: boolean; lines: string[] }[] = [];
  let previousBlank = true;
  for (const line of text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#{1,6}\s+/gm, "").split("\n")) {
    if (!line.trim()) {
      previousBlank = true;
      continue;
    }
    const list = bullet.test(line);
    const last = runs[runs.length - 1];
    if (last && last.list === list && (list || !previousBlank)) last.lines.push(list ? line.replace(bullet, "") : line);
    else runs.push({ list, lines: [list ? line.replace(bullet, "") : line] });
    previousBlank = false;
  }

  return (
    <div className="space-y-2.5">
      {runs.map((run, i) =>
        run.list ? (
          <ul key={i} className="space-y-1">
            {run.lines.map((line, j) => (
              <li key={j} className="flex gap-2">
                <span aria-hidden="true" className="text-gray-400">
                  –
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {run.lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        ),
      )}
    </div>
  );
}

function AssistantRow({ children, failed }: { children: ReactNode; failed?: boolean }) {
  return (
    <div className={`chat-msg max-w-[92%] text-sm leading-relaxed ${failed ? "field-error" : "text-gray-800"}`}>
      {children}
    </div>
  );
}

/**
 * The AI portfolio assistant's panel: a compact card floating bottom-right at every size
 * (the page stays visible and scrollable around it; only the message log scrolls inside).
 * Escape or the close button hide it; the conversation lasts for the visit only.
 * Replies come from /api/chat; the model key never reaches the browser.
 */
export default function ChatPanel({ id, open, onClose }: ChatPanelProps) {
  const titleId = useId();
  const roleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  // Bumped by "New chat": a reply still arriving for an earlier conversation is dropped.
  const conversationRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);
  const [conversation, setConversation] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  // Closing = still playing the exit after `open` turned false (noticed during render).
  const [wasOpen, setWasOpen] = useState(open);
  const [closing, setClosing] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    setClosing(!open);
  }
  const visible = open || closing;

  // Open: focus the input (without scrolling the page).
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Closing: hide once the exit has played (at once under reduced motion).
  useEffect(() => {
    if (!closing) return;
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setClosing(false), instant ? 0 : CLOSE_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!text || pending) return;

      // Earlier, successful turns only; the welcome text is UI, not conversation.
      const history: ChatTurn[] = messages
        .filter((m) => !m.failed)
        .slice(-MAX_HISTORY_MESSAGES)
        .map(({ role, text: t }) => ({ role, text: t }));

      setMessages((list) => [...list, { id: nextId.current++, role: "user", text }]);
      setDraft("");
      setPending(true);

      const startedIn = conversationRef.current;
      const controller = new AbortController();
      requestRef.current = controller;
      let reply: string | null = null;
      let failure = CHAT_ERROR;
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history }),
          signal: controller.signal,
        });
        if (response.ok) {
          const data: unknown = await response.json().catch(() => null);
          if (data && typeof data === "object" && "reply" in data && typeof data.reply === "string") {
            reply = data.reply;
          }
        } else if (response.status === 429) {
          failure = CHAT_RATE_LIMITED;
        } else if (response.status === 503) {
          const data: unknown = await response.json().catch(() => null);
          const kind = data && typeof data === "object" && "error" in data ? data.error : null;
          if (kind === "busy") failure = CHAT_BUSY;
          if (kind === "quota") failure = CHAT_QUOTA;
        }
      } catch {
        // Network failure (or the request was cancelled by "New chat").
      }
      if (requestRef.current === controller) requestRef.current = null;
      // The visitor started a new chat meanwhile: this reply belongs to the old one.
      if (conversationRef.current !== startedIn) return;

      setMessages((list) => [
        ...list,
        reply
          ? { id: nextId.current++, role: "assistant", text: reply }
          : { id: nextId.current++, role: "assistant", text: failure, failed: true },
      ]);
      setPending(false);
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    },
    [messages, pending],
  );

  // "New chat": back to the welcome state (history, input and any pending reply cleared),
  // panel left open, focus on the input. Nothing is stored, so there's nothing else to wipe.
  const reset = () => {
    if (messages.length === 0 && !pending) return;
    requestRef.current?.abort();
    requestRef.current = null;
    conversationRef.current += 1;
    setConversation((n) => n + 1);
    setMessages([]);
    setDraft("");
    setPending(false);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(draft);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
  };

  if (!visible) return null;

  const started = messages.length > 0;
  const canReset = started || pending;

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-labelledby={`${titleId} ${roleId}`}
      aria-describedby={descriptionId}
      onKeyDown={onKeyDown}
      // Phones: a floating card inset 12px from the corner (over the hidden launcher), never
      // wider than 390px or taller than the viewport less 32px. Wider: above the launcher.
      className={`${closing ? "chat-panel-out" : "chat-panel-in"} fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[45] flex h-[min(560px,calc(100dvh-2rem))] w-[min(390px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-surface text-ink shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)] sm:right-6 sm:bottom-24 sm:h-[min(560px,calc(100dvh-8rem))] sm:w-[380px]`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
        {/* Identity: Rey's name first, the assistant's role beneath (it represents him; it
            isn't him). The purpose line is kept for screen readers. */}
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full border border-gray-200 text-gray-500"
          >
            <ChatSparkIcon width={15} height={15} />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-sm font-semibold leading-tight tracking-tight">
              {profile.name}
            </h2>
            <p id={roleId} className="mt-0.5 truncate text-xs leading-tight text-gray-500">
              Portfolio Assistant
            </p>
            <p id={descriptionId} className="sr-only">
              Ask about Rey, his projects, skills, or experience.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Quieter than Close; icon-only on the narrowest screens. Disabled until there's a
              conversation to clear (which also rules out a double reset). */}
          <button
            type="button"
            onClick={reset}
            disabled={!canReset}
            aria-label="Start a new chat"
            title="Start a new chat"
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-2.5 text-xs text-gray-600 transition-[color,border-color,opacity] duration-200 hover:border-gray-400 hover:text-ink disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
          >
            <ResetIcon width={13} height={13} />
            <span className="hidden min-[400px]:inline">New chat</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Chat with Rey — Portfolio Assistant"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-gray-200 text-gray-600 transition-colors duration-200 hover:border-gray-400 hover:text-ink"
          >
            <CloseIcon width={13} height={13} />
          </button>
        </div>
      </div>

      {/* Keyed by conversation: "New chat" swaps in a fresh log, which fades in. */}
      <div
        key={conversation}
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className={`flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 ${conversation > 0 ? "chat-reset" : ""}`}
      >
        <AssistantRow>
          <p>{CHAT_WELCOME}</p>
        </AssistantRow>

        {!started && (
          <ul aria-label="Suggested questions" className="chat-msg flex flex-wrap gap-1.5">
            {CHAT_QUICK_QUESTIONS.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => void send(question)}
                  disabled={pending}
                  className="cursor-pointer rounded-full border border-gray-200 bg-background px-3 py-1.5 text-left text-xs text-gray-700 transition-colors duration-200 hover:border-gray-400 hover:text-ink disabled:cursor-default disabled:opacity-60"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        )}

        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="chat-msg flex justify-end">
              <p className="max-w-[85%] rounded-lg border border-gray-200 bg-surface-muted px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-ink [overflow-wrap:anywhere]">
                <span className="sr-only">You: </span>
                {message.text}
              </p>
            </div>
          ) : (
            <AssistantRow key={message.id} failed={message.failed}>
              <span className="sr-only">Assistant: </span>
              {message.failed ? <p>{message.text}</p> : <Reply text={message.text} />}
            </AssistantRow>
          ),
        )}

        {pending && (
          <div className="chat-msg flex items-center gap-1 py-1" role="status" aria-label="Assistant is typing">
            <span className="chat-dot size-1.5 rounded-full bg-gray-400" />
            <span className="chat-dot size-1.5 rounded-full bg-gray-400 [animation-delay:150ms]" />
            <span className="chat-dot size-1.5 rounded-full bg-gray-400 [animation-delay:300ms]" />
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-gray-200 p-3">
        <label htmlFor={`${id}-input`} className="sr-only">
          Ask Rey’s portfolio assistant
        </label>
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_MESSAGE_CHARS}
          autoComplete="off"
          placeholder="Ask about Rey…"
          className="field min-w-0 flex-1 px-3 py-2 text-base sm:text-sm"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          aria-label="Send message"
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-ink text-background transition-opacity duration-200 hover:opacity-85 disabled:cursor-default disabled:opacity-40"
        >
          <SendIcon width={15} height={15} />
        </button>
      </form>
    </div>
  );
}
