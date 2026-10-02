"use client";

import { useEffect, useRef, type RefObject } from "react";
import { contactLinks, navItems, profile } from "@/data/portfolio";
import { CloseIcon } from "./icons";
import ThemeToggle from "./ThemeToggle";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  active: string | null;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

export default function MobileMenu({ open, onClose, active, returnFocusRef }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Focus management, Escape to close, focus trap and scroll lock while open.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) returnFocusRef.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Close if the viewport grows into the desktop sidebar layout.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => desktop.matches && onClose();

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!open}
      className={`fixed inset-0 z-50 flex flex-col bg-background/95 px-4 backdrop-blur-lg duration-300 ease-soft lg:hidden ${
        // Visibility flips instantly on open (so focus can land) and waits for the fade on close.
        open
          ? "visible opacity-100 transition-opacity"
          : "invisible opacity-0 transition-[opacity,visibility]"
      }`}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200">
        <span className="micro-label text-gray-500">Menu</span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-11 place-items-center rounded-md border border-gray-200 transition-colors duration-200 hover:bg-gray-100"
        >
          <CloseIcon width={16} height={16} />
        </button>
      </div>

      {/* The list sits centred between header and footer when there's room (on short screens
          it starts at the top and scrolls, so nothing is clipped). */}
      <nav aria-label="Mobile" className="flex flex-1 flex-col overflow-y-auto py-8">
        {/* Rows are 44px+ tap targets; the gap between them grows a little with the screen. */}
        <ul className="my-auto flex flex-col gap-[clamp(2px,1vw,8px)]">
          {navItems.map((item, i) => {
            const isActive = active === item.id;
            return (
              <li
                key={item.id}
                style={{ transitionDelay: open ? `${60 + i * 50}ms` : "0ms" }}
                className={`transition-[opacity,transform] duration-500 ease-soft ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                {/* Active, hovered and focused rows nudge 4px right (transform only, so nothing
                    shifts) and come up to full contrast; the rest sit back in grey. */}
                <a
                  href={`#${item.id}`}
                  onClick={onClose}
                  aria-current={isActive ? "location" : undefined}
                  className={`group flex min-h-11 items-baseline gap-[clamp(12px,3vw,20px)] rounded-md py-2 transition-colors duration-[220ms] ease-soft ${
                    isActive ? "text-ink" : "text-gray-500 hover:text-ink focus-visible:text-ink active:text-ink"
                  }`}
                >
                  <span
                    className={`micro-label w-5 shrink-0 tabular-nums transition-colors duration-[220ms] ease-soft ${
                      isActive ? "text-ink" : "text-gray-400 group-hover:text-gray-600 group-focus-visible:text-gray-600"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* 28px on phones up to 36px on small tablets. */}
                  <span
                    className={`text-[clamp(1.75rem,7vw,2.25rem)] font-medium leading-[1.1] tracking-[-0.025em] transition-[translate] duration-[220ms] ease-soft ${
                      isActive ? "translate-x-1" : "group-hover:translate-x-1 group-focus-visible:translate-x-1"
                    }`}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 space-y-4 border-t border-gray-200 py-5">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {contactLinks
            .filter((link) => link.href)
            .map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="micro-label rounded-sm text-gray-500 transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                  {link.external && <span aria-hidden="true"> ↗</span>}
                </a>
              </li>
            ))}
        </ul>
        <div className="flex items-center justify-between">
          <span className="micro-label text-gray-500">{profile.name}</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
