"use client";

import { useEffect, useState, type CSSProperties } from "react";

type RoleTypewriterProps = {
  text: string;
  /** Type, hold, erase and repeat indefinitely; otherwise type once and stay. */
  loop?: boolean;
  className?: string;
  style?: CSSProperties;
};

const TYPE_MS = 105; // per character while typing
const ERASE_MS = 55; // per character while erasing
const HOLD_MS = 2400; // full phrase stays up
const START_MS = 700; // empty line before typing (first time and between loops)

function Caret({ blink }: { blink: boolean }) {
  return (
    <span
      className={`${blink ? "caret" : ""} ml-1 inline-block h-[1.05em] w-px translate-y-[0.15em] bg-current`}
    />
  );
}

/**
 * Types the phrase with a softly blinking caret — once, or on a loop. Renders the
 * full phrase first (no-JS and reduced motion keep it), and an invisible copy
 * reserves the final size so nothing around it shifts while it types.
 */
export default function RoleTypewriter({
  text,
  loop = false,
  className = "",
  style,
}: RoleTypewriterProps) {
  const [count, setCount] = useState(text.length);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let n = 0;
    let erasing = false;

    const tick = () => {
      if (!erasing) {
        n += 1;
        setCount(n);
        if (n < text.length) {
          timer = setTimeout(tick, TYPE_MS);
        } else if (loop) {
          erasing = true;
          timer = setTimeout(tick, HOLD_MS);
        }
      } else {
        n -= 1;
        setCount(n);
        if (n === 0) erasing = false;
        timer = setTimeout(tick, erasing ? ERASE_MS : START_MS);
      }
    };

    const start = () => {
      clearTimeout(timer);
      n = 0;
      erasing = false;
      setAnimating(true);
      setCount(0);
      timer = setTimeout(tick, START_MS);
    };

    const stop = () => {
      clearTimeout(timer);
      setAnimating(false);
      setCount(text.length);
    };

    // Reduced motion switched on mid-way completes the line; a loop resumes when it is switched off.
    const onChange = () => (reduceMotion.matches ? stop() : loop && start());
    if (!reduceMotion.matches) timer = setTimeout(start, 0);
    reduceMotion.addEventListener("change", onChange);

    return () => {
      clearTimeout(timer);
      reduceMotion.removeEventListener("change", onChange);
    };
  }, [text, loop]);

  // Hold the caret steady while it moves; blink while the line rests (full or empty).
  const idle = count === 0 || count === text.length;

  return (
    <p className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-grid">
        <span className="invisible col-start-1 row-start-1">
          {text}
          <Caret blink={false} />
        </span>
        <span className="col-start-1 row-start-1">
          {text.slice(0, count)}
          {animating && <Caret blink={idle} />}
        </span>
      </span>
    </p>
  );
}
