import type { CSSProperties } from "react";
import { techIcons, type TechIcon as TechIconData, type TechIconSlug } from "@/lib/tech-icons";

// Names used in project stacks that share another technology's mark.
const aliases: Record<string, TechIconSlug> = {
  "React Native": "react",
  "Vanilla JavaScript": "javascript",
  HTML: "html5",
};

/** The mark for a technology name as written in the portfolio data, if there is one. */
export function iconForTech(name: string): TechIconSlug | undefined {
  if (name in aliases) return aliases[name];
  return (Object.keys(techIcons) as TechIconSlug[]).find((slug) => techIcons[slug].title === name);
}

type TechIconProps = {
  slug: TechIconSlug;
  name: string;
  /** "brand" (default) draws the brand color; "inherit" takes the surrounding text color. */
  tone?: "brand" | "inherit";
  className?: string;
};

/**
 * A technology's mark in its brand color, with a per-theme variant where the official color
 * would be too faint (see lib/tech-icons.ts). Decorative: the name is always shown beside it.
 * Brands without an official mark get a small typographic monogram instead of a stand-in logo.
 */
export default function TechIcon({ slug, name, tone = "brand", className = "" }: TechIconProps) {
  const icon: TechIconData = techIcons[slug];
  const brand = tone === "brand";
  const colors = brand
    ? ({ "--icon-light": icon.color.light, "--icon-dark": icon.color.dark } as CSSProperties)
    : undefined;
  const tint = brand ? "text-(--icon-light) dark:text-(--icon-dark)" : "";

  if (icon.path) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        style={colors}
        className={`shrink-0 ${tint} ${className}`}
      >
        {/* Square marks with cut-out lettering: fill the letters as the official logo does. */}
        {brand && icon.letters && <rect x="2" y="2" width="20" height="20" fill={icon.letters} />}
        <path d={icon.path} fill="currentColor" />
      </svg>
    );
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <span
      aria-hidden="true"
      style={colors}
      className={`grid shrink-0 place-items-center rounded-[3px] border border-current font-mono text-[7px] font-semibold leading-none tracking-tight ${tint} ${className}`}
    >
      {initials}
    </span>
  );
}
