"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { stagger } from "@/lib/stagger";

type RevealOnViewProps = {
  /** Position in its group: sets the entrance delay through the existing stagger. */
  index: number;
  className?: string;
  children: ReactNode;
};

/**
 * Plays the site's `.reveal` entrance (fade up 12px, staggered) when the element first
 * scrolls into view. Server-rendered visible: it is only hidden after mount, and only
 * while still off-screen, so no-JS and reduced motion always see the content.
 */
export default function RevealOnView({ index, className = "", children }: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "waiting" | "revealed">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen (e.g. a deep link to #projects): leave it as it is.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("revealed");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${state === "waiting" ? "opacity-0" : state === "revealed" ? "reveal" : ""} ${className}`}
      style={state === "revealed" ? stagger(index) : undefined}
    >
      {children}
    </div>
  );
}
