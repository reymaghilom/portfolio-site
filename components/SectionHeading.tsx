import type { ReactNode } from "react";

type SectionHeadingProps = {
  id: string;
  index: number;
  label: string;
  title?: string;
  /** A control set at the right of the title's row (it wraps below on narrow screens). */
  action?: ReactNode;
};

/** Numbered eyebrow ("02 — skills") over a bold heading. */
export default function SectionHeading({ id, index, label, title, action }: SectionHeadingProps) {
  const eyebrow = (
    <span className="micro-label block text-gray-400">
      {String(index).padStart(2, "0")} — {label}
    </span>
  );

  // Without a visible title the eyebrow itself names the section.
  if (!title) {
    return (
      <h2 id={id} className="mb-6">
        {eyebrow}
      </h2>
    );
  }

  const heading = (
    <h2 id={id} className="mt-3 text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
      {title}
    </h2>
  );

  return (
    <div className="mb-10">
      {eyebrow}
      {action ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-6">
          {heading}
          {action}
        </div>
      ) : (
        heading
      )}
    </div>
  );
}
