import type { CSSProperties } from "react";

/** Inline style for `.reveal` elements: sets their position in the entrance stagger. */
export function stagger(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}
