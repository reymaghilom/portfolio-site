"use client";

import { useCallback, useRef, useState } from "react";
import { navItems } from "@/data/portfolio";
import { useActiveSection } from "@/hooks/useActiveSection";
import { MenuIcon } from "./icons";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";

const observedIds = navItems.map((item) => item.id);

/** Lowercase mono wordmark, shared by the sidebar and the mobile bar. */
function Wordmark() {
  return (
    <a
      href="#top"
      className="rounded-sm font-mono text-[12px] font-semibold lowercase tracking-tight text-ink"
    >
      rey c. maghilom
    </a>
  );
}

export default function Navbar() {
  const active = useActiveSection(observedIds);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* Desktop: fixed left rail — wordmark, centred section links, theme + contact at the foot. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-44 flex-col border-r border-gray-200 bg-background px-5 py-7 lg:flex">
        <Wordmark />

        <nav aria-label="Primary" className="flex flex-1 items-center">
          <ul className="space-y-1">
            {navItems.map((item, i) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={`micro-label flex items-center gap-2 rounded-sm py-1.5 transition-colors duration-200 ${
                      isActive ? "font-semibold text-ink" : "text-gray-500 hover:text-ink"
                    }`}
                  >
                    {/* Fixed-width slot: the arrow fades and slides in on the active item only,
                        so the labels never shift. Set in the sans face: Geist Mono draws "→"
                        as a long, full-cell arrow (⟶); Geist gives the plain compact one. */}
                    <span
                      aria-hidden="true"
                      className={`w-3 shrink-0 font-sans font-normal transition-[opacity,translate] duration-[250ms] ease-soft ${
                        isActive ? "translate-x-0 opacity-100" : "-translate-x-1.5 opacity-0"
                      }`}
                    >
                      →
                    </span>
                    <span className="font-normal text-gray-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-3">
          <ThemeToggle />
          <a
            href="#contact"
            className="micro-label block rounded-md bg-ink py-2.5 text-center font-semibold text-background transition-opacity duration-200 hover:opacity-85"
          >
            Let’s talk
          </a>
        </div>
      </aside>

      {/* Mobile: sticky, blurred top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-gray-200 bg-background/90 px-4 backdrop-blur-md lg:hidden">
        <Wordmark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-md border border-gray-200 text-ink transition-colors duration-200 hover:bg-gray-100"
          >
            <MenuIcon width={16} height={16} />
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        active={active}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}
