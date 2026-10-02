"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";

/** Match the duration-500 class below. */
const OPEN_MS = 500;

type ShowMore = {
  open: boolean;
  /** Fully open: stop clipping, so the cards' hover lift and scale aren't cut off. */
  settled: boolean;
  toggle: () => void;
  regionId: string;
  /** How many projects are folded away (for the control's accessible name). */
  count: number;
};

const ShowMoreContext = createContext<ShowMore | null>(null);

function useShowMore() {
  const context = useContext(ShowMoreContext);
  if (!context) throw new Error("ShowMore parts must sit inside <ShowMoreProvider>");
  return context;
}

/**
 * Shares the open/closed state between the "Show All" control (in the section's heading
 * row) and the folded-away projects further down.
 */
export function ShowMoreProvider({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const regionId = useId();

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setSettled(true), OPEN_MS + 80);
    return () => clearTimeout(timer);
  }, [open]);

  const toggle = () => {
    setSettled(false);
    setOpen((value) => !value);
  };

  return (
    <ShowMoreContext.Provider value={{ open, settled, toggle, regionId, count }}>
      {children}
    </ShowMoreContext.Provider>
  );
}

/**
 * "Show All →" / "Show Less ↑": a quiet text control. Its hit area reaches past the text
 * (44px tall), while the text itself lines up with the column's right edge.
 */
export function ShowMoreToggle() {
  const { open, toggle, regionId, count } = useShowMore();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls={regionId}
      className="group/more micro-label -mr-2 inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 px-2 text-[10px] font-semibold text-gray-600 transition-colors duration-200 hover:text-ink"
    >
      {open ? "Show Less" : "Show All"}
      <span className="sr-only">{open ? " projects" : ` projects (${count} more)`}</span>
      <span
        aria-hidden="true"
        className={`font-sans transition-transform duration-200 ${
          open ? "group-hover/more:-translate-y-0.5" : "group-hover/more:translate-x-0.5"
        }`}
      >
        {open ? "↑" : "→"}
      </span>
    </button>
  );
}

/**
 * The folded-away projects. Opening grows the row from zero height while the cards fade up
 * 12px; closing folds them away. Folded cards are inert (not focusable, hidden from
 * assistive tech). Under reduced motion the change is instant.
 */
export function ShowMoreRegion({ children }: { children: ReactNode }) {
  const { open, settled, regionId } = useShowMore();

  return (
    <div
      id={regionId}
      inert={!open}
      className={`grid ease-soft transition-[grid-template-rows] ${open ? "duration-500" : "duration-[400ms]"}`}
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className={`min-h-0 ${settled ? "" : "overflow-hidden"}`}>
        <div
          className={`transition-[opacity,translate] ease-soft ${
            open ? "translate-y-0 opacity-100 duration-500" : "translate-y-3 opacity-0 duration-300"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
