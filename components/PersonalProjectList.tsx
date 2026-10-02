"use client";

import { useId, useState } from "react";
import { stagger } from "@/lib/stagger";

/** How many projects show before the rest are tucked behind "Show More". */
const PREVIEW_COUNT = 3;

/**
 * Compact project-name tags. Past PREVIEW_COUNT, the rest wait behind a text toggle and
 * fade in with the site's entrance animation (off under reduced motion, via .reveal).
 */
export default function PersonalProjectList({ projects }: { projects: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const hasMore = projects.length > PREVIEW_COUNT;
  const visible = expanded ? projects : projects.slice(0, PREVIEW_COUNT);

  return (
    <div>
      <ul id={listId} aria-label="Personal projects" className="flex flex-wrap gap-1.5">
        {visible.map((project, i) => (
          <li
            key={project}
            className={`rounded-sm border border-gray-200 bg-background px-2 py-0.5 text-xs text-gray-600 ${
              i >= PREVIEW_COUNT ? "reveal" : ""
            }`}
            style={i >= PREVIEW_COUNT ? stagger(i - PREVIEW_COUNT) : undefined}
          >
            {project}
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((open) => !open)}
          className="group micro-label mt-3 inline-flex items-center gap-1.5 rounded-sm text-gray-500 transition-colors duration-200 hover:text-ink"
        >
          {expanded ? "Show Less" : "Show More"}
          {/* Sans face: Geist Mono draws arrows as long full-cell glyphs. */}
          <span
            aria-hidden="true"
            className={`font-sans transition-transform duration-200 ${
              expanded ? "group-hover:-translate-y-0.5" : "group-hover:translate-x-0.5"
            }`}
          >
            {expanded ? "↑" : "→"}
          </span>
        </button>
      )}
    </div>
  );
}
