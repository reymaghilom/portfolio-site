"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  cleanContact,
  contactLimits,
  validateContact,
  type ContactErrors,
  type ContactFields,
} from "@/lib/contact";
import { CloseIcon } from "./icons";

/** Matches the .viewer.closing animation in globals.css. */
const CLOSE_MS = 220;

const EMPTY: ContactFields = { name: "", email: "", subject: "", message: "" };
const ORDER: (keyof ContactFields)[] = ["name", "email", "subject", "message"];

type Status = "idle" | "sending" | "success" | "error";

/** Opens the message form (given the trigger, to return focus to); from <ContactModalProvider>. */
const OpenContext = createContext<((trigger: HTMLElement) => void) | null>(null);

/**
 * A button that opens the message form (the Contact section's "Message Me →" and its email
 * address). Must sit inside <ContactModalProvider>.
 */
export function ContactModalTrigger({
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const open = useContext(OpenContext);
  if (!open) throw new Error("<ContactModalTrigger> must sit inside <ContactModalProvider>");
  return (
    <button
      type={type}
      aria-haspopup="dialog"
      onClick={(event) => open(event.currentTarget)}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * The one message form for the Contact section, opened by any <ContactModalTrigger> inside.
 *
 * A native modal <dialog> (the page behind is inert and scroll-locked). It closes only via
 * the X, Cancel or Escape, never the backdrop, easing out first; focus then returns to
 * whichever trigger opened it. The page never moves: the lock keeps the scrollbar's space,
 * and the scroll position and focus come back without scrolling. Fields are checked here
 * for instant feedback and again by /api/contact, which sends the email; a hidden honeypot
 * field catches simple bots.
 */
export function ContactModalProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  // Where the page was and what opened the form, so closing returns to exactly that.
  const openerRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [fields, setFields] = useState<ContactFields>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  // After the first send attempt, fields re-check as they change.
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  const show = (trigger: HTMLElement) => {
    openerRef.current = trigger;
    scrollRef.current = { x: window.scrollX, y: window.scrollY };
    if (status !== "sending") setStatus("idle");
    setOpen(true);
    dialogRef.current?.showModal();
    requestAnimationFrame(() => {
      const first = formRef.current?.elements.namedItem("name");
      if (first instanceof HTMLElement) first.focus({ preventScroll: true });
    });
  };

  // Run right after the dialog closes (same task, before paint): undo any scroll the browser
  // made while handing focus back, and focus the trigger without scrolling to it.
  const settleAfterClose = () => {
    const { x, y } = scrollRef.current;
    if (window.scrollX !== x || window.scrollY !== y) {
      window.scrollTo({ left: x, top: y, behavior: "instant" });
    }
    openerRef.current?.focus({ preventScroll: true });
  };

  const close = () => {
    const dialog = dialogRef.current;
    if (!dialog || closing) return;
    const finish = () => {
      dialog.close();
      settleAfterClose();
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    setClosing(true);
    window.setTimeout(finish, CLOSE_MS);
  };

  // The page behind stays put while the form is open. The lock sits on the root scroller and
  // keeps the scrollbar's gutter, so hiding the scrollbar doesn't widen (and shift) the page.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
    };
  }, [open]);

  // After sending, focus moves to the confirmation's Close button.
  useEffect(() => {
    if (status === "success") doneRef.current?.focus();
  }, [status]);

  const update = (field: keyof ContactFields, value: string) => {
    const next = { ...fields, [field]: value };
    setFields(next);
    if (attempted) setErrors(validateContact(cleanContact(next)));
    if (status === "error") setStatus("idle");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    setAttempted(true);
    const clean = cleanContact(fields);
    const found = validateContact(clean);
    setErrors(found);
    const firstInvalid = ORDER.find((field) => found[field]);
    if (firstInvalid) {
      const el = event.currentTarget.elements.namedItem(firstInvalid);
      if (el instanceof HTMLElement) el.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...clean, company: honeypotRef.current?.value ?? "" }),
      });
      if (response.ok) {
        setStatus("success");
        setFields(EMPTY);
        setErrors({});
        setAttempted(false);
        return;
      }
      // The server's own field check disagreed: show its messages.
      const data: unknown = await response.json().catch(() => null);
      if (response.status === 400 && data && typeof data === "object" && "errors" in data) {
        setErrors(data.errors as ContactErrors);
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  // Keep Tab cycling through the form's own controls.
  const trapTab = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const focusable = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]):not([tabindex='-1']), textarea:not([disabled])",
      ),
    ].filter((el) => el.getClientRects().length > 0);
    const at = focusable.indexOf(document.activeElement as HTMLElement);
    if (at === -1 || (event.shiftKey && at === 0) || (!event.shiftKey && at === focusable.length - 1)) {
      event.preventDefault();
      (event.shiftKey ? focusable[focusable.length - 1] : focusable[0])?.focus();
    }
  };

  const sending = status === "sending";
  // What the box holds, against its cap (maxLength stops typing there).
  const messageCount = fields.message.length;
  const messageFull = messageCount >= contactLimits.message;
  const input = "field mt-1.5 px-3.5 py-2.5 text-base sm:text-sm";
  const label = "micro-label text-[10px] text-gray-600";
  const error = (field: keyof ContactFields) =>
    errors[field] && (
      <p id={`${id}-${field}-error`} className="field-error mt-1.5 text-xs">
        {errors[field]}
      </p>
    );
  const described = (field: keyof ContactFields, extra?: string) =>
    [errors[field] ? `${id}-${field}-error` : null, extra].filter(Boolean).join(" ") || undefined;

  return (
    <OpenContext.Provider value={show}>
      {children}

      {/* .viewer supplies the shared open/close animation (fade, 8px, 0.98 → 1). */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-modal="true"
        onClose={() => {
          setOpen(false);
          setClosing(false);
          // Also covers a close the browser forces itself (e.g. a repeated Escape).
          settleAfterClose();
        }}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onKeyDown={trapTab}
        className={`viewer ${closing ? "closing" : ""} m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-surface p-0 text-ink shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)] backdrop:bg-neutral-950/60 backdrop:backdrop-blur-[2px]`}
      >
        <div className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                Message Me
              </h2>
              <p id={descriptionId} className="mt-1 text-sm text-gray-500">
                Let’s start a conversation.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close message form"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-gray-200 text-gray-600 transition-colors duration-200 hover:border-gray-400 hover:text-ink"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>

          {status === "success" ? (
            <div className="mt-8">
              <p role="status" className="rounded-md border border-gray-200 bg-background px-4 py-3 text-sm text-gray-800">
                Message sent successfully. Thank you for reaching out.
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  ref={doneRef}
                  type="button"
                  onClick={close}
                  className="inline-flex cursor-pointer items-center rounded-md bg-ink px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-widest text-background transition-opacity duration-200 hover:opacity-85"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form ref={formRef} onSubmit={submit} noValidate className="mt-6">
              <fieldset disabled={sending} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${id}-name`} className={label}>
                      Name
                    </label>
                    <input
                      id={`${id}-name`}
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      maxLength={contactLimits.name}
                      value={fields.name}
                      onChange={(e) => update("name", e.target.value)}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={described("name")}
                      className={input}
                    />
                    {error("name")}
                  </div>
                  <div>
                    <label htmlFor={`${id}-email`} className={label}>
                      Email
                    </label>
                    <input
                      id={`${id}-email`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      maxLength={contactLimits.email}
                      value={fields.email}
                      onChange={(e) => update("email", e.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={described("email")}
                      className={input}
                    />
                    {error("email")}
                  </div>
                </div>

                <div>
                  <label htmlFor={`${id}-subject`} className={label}>
                    Subject
                  </label>
                  <input
                    id={`${id}-subject`}
                    name="subject"
                    type="text"
                    placeholder="What would you like to discuss?"
                    maxLength={contactLimits.subject}
                    value={fields.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    aria-invalid={errors.subject ? true : undefined}
                    aria-describedby={described("subject")}
                    className={input}
                  />
                  {error("subject")}
                </div>

                <div>
                  <label htmlFor={`${id}-message`} className={label}>
                    Message
                  </label>
                  <textarea
                    id={`${id}-message`}
                    name="message"
                    rows={6}
                    placeholder="Tell me about your idea, project, or question..."
                    maxLength={contactLimits.message}
                    value={fields.message}
                    onChange={(e) => update("message", e.target.value)}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={described("message", `${id}-message-count`)}
                    className={`${input} min-h-40 resize-y`}
                  />
                  {/* The error (if any) on the left; the running count against the cap on the
                      right. */}
                  <div className="mt-1.5 flex items-baseline justify-between gap-4">
                    <div className="min-w-0 [&>p]:mt-0">{error("message")}</div>
                    <p
                      id={`${id}-message-count`}
                      className={`shrink-0 font-mono text-[11px] tabular-nums transition-colors duration-200 ${
                        messageFull ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {messageCount} / {contactLimits.message}
                    </p>
                  </div>
                  {/* Announced once, at the cap (not on every keystroke). */}
                  <p className="sr-only" aria-live="polite">
                    {messageFull ? "Maximum message length reached." : ""}
                  </p>
                </div>

                {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
                <div aria-hidden="true" className="sr-only">
                  <label htmlFor={`${id}-company`}>Company</label>
                  <input
                    ref={honeypotRef}
                    id={`${id}-company`}
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                  />
                </div>
              </fieldset>

              {status === "error" && (
                <p role="alert" className="field-error mt-5 text-sm">
                  Something went wrong while sending your message. Please try again.
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-widest text-gray-700 transition-colors duration-200 hover:border-gray-400 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  aria-disabled={sending}
                  className="inline-flex cursor-pointer items-center rounded-md bg-ink px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-widest text-background transition-opacity duration-200 hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </OpenContext.Provider>
  );
}
