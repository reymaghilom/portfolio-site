"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { ProjectImage } from "@/data/portfolio";
import { CloseIcon } from "./icons";

type ScreenshotGalleryProps = {
  title: string;
  images: ProjectImage[];
  /** Optional disclosure about the contents shown in the screenshots. */
  note?: string;
  className?: string;
  /** The card's media, rendered as the button that opens the viewer. */
  children: ReactNode;
};

/** Horizontal travel (px) that counts as a swipe rather than a tap. */
const SWIPE_PX = 40;
/** Matches the .shot-slide-* animations in globals.css. */
const SLIDE_MS = 420;
/** Matches the .viewer.closing animation in globals.css. */
const CLOSE_MS = 220;

type Direction = "next" | "prev";

/**
 * Where a dot per screen fits beside both arrows (20px dots below sm, 24px + 4px gaps from
 * sm; viewport less the dialog's padding). Elsewhere a thin progress bar stands in, so a
 * longer gallery never overflows; the counter above always gives the exact position.
 */
function dotLayout(count: number) {
  if (count <= 12) return { dots: "flex", bar: "hidden" };
  if (count <= 16) return { dots: "hidden sm:flex", bar: "sm:hidden" };
  if (count <= 21) return { dots: "hidden md:flex", bar: "md:hidden" };
  if (count <= 30) return { dots: "hidden lg:flex", bar: "lg:hidden" };
  return { dots: "hidden", bar: "" };
}

/**
 * Wraps a project card's media in a button that opens a full-screen showcase of the
 * project's screenshots. Tall (phone) shots sit in an iPhone-style shell (titanium band,
 * thin bezel, side keys; no notch or island, as the screenshots carry their own Android
 * status and navigation bars, shown unchanged); wide (desktop) shots on a slim laptop,
 * graphite or silver with the theme and reduced to display + chin on phones (no browser or
 * OS chrome added). Nothing is cropped or stretched.
 *
 * Built on the native modal <dialog>: the page behind is inert and scroll-locked, Tab
 * cycles through the viewer's controls, and focus returns to the opening button. The page
 * never moves: the lock keeps the scrollbar's space, and the scroll position and focus come
 * back without scrolling. It closes
 * only via the close button or Escape (the backdrop does nothing), easing out first. With several shots:
 * ←/→ buttons, arrow keys, swipe, and dots (or a progress bar where they don't fit); screens
 * slide horizontally between each other.
 */
export default function ScreenshotGallery({
  title,
  images,
  note,
  className = "",
  children,
}: ScreenshotGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Where the page was when the viewer opened, so closing returns to exactly that.
  const scrollRef = useRef({ x: 0, y: 0 });
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  // Playing the exit animation; the dialog closes once it ends.
  const [closing, setClosing] = useState(false);
  const [index, setIndex] = useState(0);
  // The screen sliding out, kept on screen until its slide ends.
  const [leaving, setLeaving] = useState<{ index: number; direction: Direction } | null>(null);
  const statusId = useId();
  const count = images.length;
  const many = count > 1;
  const image = images[index];
  // The frame keeps the first shot's proportions, so it doesn't jump between screens.
  const first = images[0];
  const ratio = first ? first.width / first.height : 1;
  const phone = ratio < 1;
  // Laptop galleries put ←/→ beside the device on wide screens (below it elsewhere).
  const flank = many && !phone;
  const layout = dotLayout(count);

  const show = () => {
    scrollRef.current = { x: window.scrollX, y: window.scrollY };
    setIndex(0);
    setLeaving(null);
    setOpen(true);
    dialogRef.current?.showModal();
  };

  // Right after the dialog closes (same task, before paint): undo any scroll the browser made
  // while handing focus back, and focus the project image without scrolling to it.
  const settleAfterClose = () => {
    const { x, y } = scrollRef.current;
    if (window.scrollX !== x || window.scrollY !== y) {
      window.scrollTo({ left: x, top: y, behavior: "instant" });
    }
    triggerRef.current?.focus({ preventScroll: true });
  };

  // Fades and settles out, then closes; the page stays exactly where it was.
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

  const go = useCallback(
    (target: number, direction: Direction) => {
      const next = (target + count) % count;
      if (next === index) return;
      setLeaving({ index, direction });
      setIndex(next);
    },
    [count, index],
  );
  const step = (by: 1 | -1) => go(index + by, by === 1 ? "next" : "prev");

  // Drop the outgoing screen once its slide is over (a fallback for animationend).
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setLeaving(null), SLIDE_MS + 80);
    return () => clearTimeout(timer);
  }, [leaving]);

  // While open: the page behind stays put, and a sideways swipe can't trigger the browser's
  // back/forward gesture (it would navigate away instead of changing the screen). The lock
  // sits on the root scroller and keeps the scrollbar's gutter, so hiding the scrollbar
  // doesn't widen (and shift) the page.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = {
      overflow: root.style.overflow,
      gutter: root.style.scrollbarGutter,
      overscroll: root.style.overscrollBehaviorX,
    };
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    root.style.overscrollBehaviorX = "none";
    return () => {
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
      root.style.overscrollBehaviorX = previous.overscroll;
    };
  }, [open]);

  const label = many ? `View ${title} screenshots (${count})` : `View ${title} screenshot`;
  const control =
    "grid size-11 shrink-0 place-items-center rounded-full border border-white/20 font-sans text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/10 sm:size-10";

  // One screen layer; keyed by role + image so the incoming one isn't remounted when its
  // slide class is dropped.
  const shot = (i: number, role: "in" | "out", slideClass: string, onEnd?: () => void) => {
    const s = images[i];
    return (
      <div
        key={`${role}-${s.src}`}
        className={`absolute inset-0 ${slideClass}`}
        onAnimationEnd={onEnd}
      >
        <Image
          src={s.src}
          alt={s.alt}
          fill
          quality={90}
          sizes={phone ? "(min-width: 640px) 420px, 100vw" : "(min-width: 768px) 1200px, 100vw"}
          className="object-contain"
        />
      </div>
    );
  };

  // The screens in play (outgoing + incoming), set into either device.
  const slides = (
    <>
      {leaving &&
        shot(leaving.index, "out", `shot-slide-out-${leaving.direction}`, () => setLeaving(null))}
      {shot(index, "in", leaving ? `shot-slide-in-${leaving.direction}` : "")}
    </>
  );
  const screenStyle = { aspectRatio: `${first.width} / ${first.height}`, width: "var(--screen-w)" };
  // Height kept clear for the top bar and (with several shots) the controls.
  const reserve = many ? "12rem" : "8rem";

  return (
    <>
      {/* Only the image is the control: a pointer cursor and a faint shade on hover mark it as
          clickable. The focus ring is drawn inside, since the card clips its edges. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={show}
        aria-label={label}
        aria-haspopup="dialog"
        className={`group/shot relative block h-full w-full cursor-pointer text-left focus-visible:outline-offset-[-3px] ${className}`}
      >
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-[350ms] ease-soft group-hover/shot:bg-black/[0.04]"
        />
        {many && (
          <span className="micro-label absolute right-3 bottom-3 rounded-sm bg-ink/80 px-1.5 py-0.5 text-[9px] text-background">
            {count} screens
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        // Focusable itself, so a click on the backdrop keeps focus (and keys) in the viewer.
        tabIndex={-1}
        aria-label={`${title} screenshots`}
        aria-describedby={statusId}
        onClose={() => {
          setOpen(false);
          setClosing(false);
          // Also covers a close the browser forces itself (e.g. a repeated Escape).
          settleAfterClose();
        }}
        // Escape: play the same exit as the close button.
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onKeyDown={(event) => {
          // Keep Tab cycling through the viewer's own controls (the browser would otherwise
          // let focus leave for its toolbar after the last one).
          if (event.key === "Tab") {
            // Only controls on screen: each breakpoint hides one pair of ←/→.
            const focusable = [
              ...event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled])"),
            ].filter((el) => el.getClientRects().length > 0);
            const at = focusable.indexOf(document.activeElement as HTMLElement);
            const firstControl = focusable[0];
            const lastControl = focusable[focusable.length - 1];
            // Wrap at either end; and if focus sits on no control (e.g. after a click on the
            // backdrop), bring it back to the first or last one.
            if (
              at === -1 ||
              (event.shiftKey && at === 0) ||
              (!event.shiftKey && at === focusable.length - 1)
            ) {
              event.preventDefault();
              (event.shiftKey ? lastControl : firstControl)?.focus();
            }
            return;
          }
          if (!many) return;
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
        className={`viewer ${closing ? "closing" : ""} m-0 h-dvh max-h-none outline-none w-screen max-w-none overscroll-contain bg-transparent px-4 py-4 text-white backdrop:bg-neutral-950/85 backdrop:backdrop-blur-sm open:flex open:flex-col open:items-center sm:px-8 sm:py-6`}
      >
        {open && image && (
          <>
            {/* Top: project and screen, centred; close at the top-right. */}
            <div className="relative flex w-full items-start justify-center">
              <p
                id={statusId}
                aria-live="polite"
                className="micro-label px-14 text-center text-[10px] leading-relaxed"
              >
                <span className="block text-white/60">{title}</span>
                {note && <span className="mt-1 block text-[9px] text-white/50">{note}</span>}
                {many && (
                  <span className="mt-0.5 block text-white">
                    {index + 1} / {count}
                    {image.label && <span className="text-white/50"> — {image.label}</span>}
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={close}
                autoFocus
                aria-label="Close image viewer"
                className={`${control} absolute top-0 right-0`}
              >
                <CloseIcon width={16} height={16} />
              </button>
            </div>

            {/* Stage: the device, as large as the screen allows.
                Swipe left/right on touch screens to change screen. */}
            <div
              className="flex min-h-0 w-full flex-1 touch-pan-y items-center justify-center gap-6 py-4 sm:py-5"
              onTouchStart={(event) => {
                const t = event.touches[0];
                touchStart.current = { x: t.clientX, y: t.clientY };
              }}
              onTouchEnd={(event) => {
                const start = touchStart.current;
                touchStart.current = null;
                if (!start || !many) return;
                const t = event.changedTouches[0];
                const dx = t.clientX - start.x;
                if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(t.clientY - start.y)) {
                  if (event.cancelable) event.preventDefault();
                  step(dx < 0 ? 1 : -1);
                }
              }}
            >
              {phone ? (
                <div
                  className="device-frame"
                  style={
                    {
                      // Screen width: fits between the top bar and the controls (less the
                      // frame and its side keys), never upscaled. The corners follow it.
                      "--screen-w": `min(calc(100vw - 3.75rem), calc((100dvh - ${reserve}) * ${ratio}), 380px)`,
                    } as CSSProperties
                  }
                >
                  {/* Side keys: action and volume on the left, power on the right. */}
                  <span aria-hidden="true" className="device-key device-key-left top-[17%] h-[4.5%]" />
                  <span aria-hidden="true" className="device-key device-key-left top-[25%] h-[8.5%]" />
                  <span aria-hidden="true" className="device-key device-key-left top-[35.5%] h-[8.5%]" />
                  <span aria-hidden="true" className="device-key device-key-right top-[28%] h-[13%]" />
                  <div className="device-bezel">
                    <div className="device-screen relative overflow-hidden bg-black" style={screenStyle}>
                      {slides}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {flank && (
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous screenshot"
                      className={`${control} hidden lg:grid`}
                    >
                      ←
                    </button>
                  )}
                  <div
                    className={`laptop ${flank ? "laptop-flanked" : ""}`}
                    style={
                      {
                        // Screen width: the base (--overhang × the screen) fits beside the
                        // side arrows, lid + base fit between the top bar and the controls.
                        "--screen-w": `min(calc((100vw - 1rem - var(--flank)) / var(--overhang)), calc((100dvh - ${reserve}) / ${(1 / ratio + 0.075).toFixed(4)}), 1200px)`,
                      } as CSSProperties
                    }
                  >
                    {/* Only the screens slide; the laptop itself stays put. */}
                    <div className="laptop-lid">
                      <div className="laptop-bezel">
                        <div className="laptop-screen relative overflow-hidden bg-white" style={screenStyle}>
                          {slides}
                        </div>
                      </div>
                    </div>
                    <div aria-hidden="true" className="laptop-base">
                      <div className="laptop-hinge" />
                      <div className="laptop-deck" />
                      <div className="laptop-front" />
                    </div>
                  </div>
                  {flank && (
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next screenshot"
                      className={`${control} hidden lg:grid`}
                    >
                      →
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Controls, below the device: previous, a dot per screen (or the progress bar),
                next. (A flanked laptop keeps only the dots here on wide screens.) */}
            {many && (
              <div className="flex items-center gap-2 pb-1 sm:gap-4">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous screenshot"
                  className={`${control} ${flank ? "lg:hidden" : ""}`}
                >
                  ←
                </button>
                <div
                  aria-hidden="true"
                  className={`${layout.bar} mx-2 h-0.5 w-32 overflow-hidden rounded-full bg-white/20 sm:w-44`}
                >
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-300 ease-soft"
                    style={{ width: `${((index + 1) / count) * 100}%` }}
                  />
                </div>
                <ol className={`${layout.dots} items-center sm:gap-1`} aria-label="Screens">
                  {images.map((s, i) => (
                    <li key={s.src}>
                      <button
                        type="button"
                        onClick={() => go(i, i > index ? "next" : "prev")}
                        aria-label={`Screen ${i + 1}${s.label ? `: ${s.label}` : ""}`}
                        aria-current={i === index ? "true" : undefined}
                        className="group/dot grid h-6 w-5 place-items-center rounded-full sm:w-6"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-300 ease-soft ${
                            i === index
                              ? "w-4 bg-white"
                              : "w-1.5 bg-white/35 group-hover/dot:bg-white/70"
                          }`}
                        />
                      </button>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next screenshot"
                  className={`${control} ${flank ? "lg:hidden" : ""}`}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
