import type { ReactNode } from "react";
import SectionHeading from "./SectionHeading";

type SectionProps = {
  id: string;
  index: number;
  /** Short category in the eyebrow ("skills"). */
  label: string;
  /** Section heading ("Skills & Tools"). Omit when the content brings its own. */
  title?: string;
  /** A control at the right of the heading's row (e.g. Projects' "Show All"). */
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Page section: a full-width hairline above, then one centred column with a numbered
 * eyebrow and heading. Anchor offset clears the sticky mobile bar.
 */
export default function Section({ id, index, label, title, action, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-14 border-t border-gray-200 lg:scroll-mt-0"
    >
      {/* The entrance animates the column, not the section, so anchor targets never shift. */}
      <div className="reveal-scroll mx-auto max-w-2xl py-20 lg:py-24">
        <SectionHeading id={headingId} index={index} label={label} title={title} action={action} />
        {children}
      </div>
    </section>
  );
}
