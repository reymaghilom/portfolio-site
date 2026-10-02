"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { ChatSparkIcon } from "../icons";

// The panel (and everything chat) loads only when the assistant is first wanted.
const loadPanel = () => import("./ChatPanel");
const ChatPanel = dynamic(loadPanel, { ssr: false });

const PANEL_ID = "portfolio-assistant";

/**
 * "Chat with Rey": the portfolio assistant's floating launcher, fixed to the viewport's
 * bottom-right corner (nothing moves it while the page scrolls), icon + label.
 * It's the only chat code in the initial page; the panel is fetched on first hover/focus
 * and mounted on first open, then kept mounted so the conversation lasts for the visit.
 */
export default function ChatLauncher() {
  const launcherRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggle = () => {
    setMounted(true);
    setOpen((value) => !value);
  };

  // Back to the launcher, without scrolling the page to it. On phones the launcher is hidden
  // while the panel (which sits over it) is open, so focus waits a frame for it to be shown again.
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={toggle}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        aria-expanded={open}
        aria-controls={mounted ? PANEL_ID : undefined}
        aria-label={open ? "Close Chat with Rey — Portfolio Assistant" : "Open Chat with Rey — Portfolio Assistant"}
        className={`fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-surface px-3.5 text-ink shadow-card transition-colors duration-200 ease-soft hover:border-gray-400 sm:right-6 sm:bottom-6 ${
          open ? "max-sm:hidden" : ""
        }`}
      >
        <ChatSparkIcon width={18} height={18} />
        {/* Icon-only on the narrowest screens; the accessible label stays the same. */}
        <span className="hidden text-[13px] font-medium tracking-tight whitespace-nowrap min-[360px]:inline">
          Chat with Rey
        </span>
      </button>

      {mounted && <ChatPanel id={PANEL_ID} open={open} onClose={close} />}
    </>
  );
}
