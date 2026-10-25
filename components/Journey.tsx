import type { ReactNode } from "react";
import { developmentWork, employment, type DevelopmentEntry } from "@/data/portfolio";
import Section from "./Section";

const isCurrent = (period: string) => period.endsWith("Present");

/** Numbered sub-heading inside the section; whitespace, not a rule, sets it apart. */
function GroupLabel({ index, children }: { index: number; children: ReactNode }) {
  return (
    <h3 className="micro-label mb-6 text-gray-500">
      <span className="text-gray-400">{String(index).padStart(2, "0")} — </span>
      {children}
    </h3>
  );
}

function Chip({ children, inverted = false }: { children: ReactNode; inverted?: boolean }) {
  return (
    <span
      className={`micro-label rounded-sm px-1.5 py-px text-[9px] ${
        inverted ? "bg-ink text-background" : "border border-gray-300 text-gray-500"
      }`}
    >
      {children}
    </span>
  );
}

/** A labelled detail block inside a development entry ("Purpose", "Tech stack"). */
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="micro-label text-[9px] text-gray-400">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function DevelopmentCard({ entry }: { entry: DevelopmentEntry }) {
  return (
    // Hover (via the timeline item's group, pointer devices only): lift 2px, grow 1%, firmer
    // border and a soft shadow. Movement is skipped under reduced motion.
    <article className="rounded-lg border border-gray-200 bg-gray-50 p-5 transition-[translate,scale,border-color,box-shadow] duration-300 ease-soft group-hover:border-gray-400 group-hover:shadow-card sm:p-6 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-[1.01]">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-base font-semibold tracking-tight">{entry.title}</h4>
          {entry.kind && <Chip inverted>{entry.kind}</Chip>}
        </div>
        <span className="micro-label pt-1 text-[9px] text-gray-500">{entry.period}</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-gray-500">{entry.context}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-gray-600">{entry.summary}</p>

      {(entry.purpose || entry.technologies) && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-6">
          {entry.purpose && (
            <Detail label="Purpose">
              <ul className="space-y-0.5 text-[13px] text-gray-700">
                {entry.purpose.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-2 before:size-[3px] before:shrink-0 before:-translate-y-[0.2em] before:rounded-full before:bg-gray-400 before:content-['']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Detail>
          )}
          {entry.technologies && (
            <Detail label="Tech stack">
              <ul aria-label="Tech stack" className="flex flex-wrap gap-1.5">
                {entry.technologies.map((tech) => (
                  <li key={tech}>
                    <Chip>{tech}</Chip>
                  </li>
                ))}
              </ul>
            </Detail>
          )}
        </div>
      )}
    </article>
  );
}

export default function Journey() {
  return (
    <Section id="journey" index={3} label="journey" title="Professional Journey">
      {/* 01 — Development work leads: full cards along a timeline rail. */}
      <GroupLabel index={1}>Development &amp; internal projects</GroupLabel>
      <ol className="space-y-5">
        {developmentWork.map((entry, i) => (
          <li key={entry.title} className="group relative pl-7">
            {/* Rail from this node down to the next one (space-y-5 gap + node offset). */}
            {i < developmentWork.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-6 -bottom-11 left-[4px] w-px bg-gray-200"
              />
            )}
            {/* Node: outlined, filling while its card is hovered; ongoing work stays filled. */}
            <span
              aria-hidden="true"
              className={`absolute top-6 left-0 size-[9px] rounded-full border transition-colors duration-200 ${
                isCurrent(entry.period)
                  ? "border-ink bg-ink"
                  : "border-gray-400 bg-background group-hover:border-ink group-hover:bg-ink"
              }`}
            />
            <DevelopmentCard entry={entry} />
          </li>
        ))}
      </ol>

      {/* 02 — Banking employment as supporting context: no cards, smaller type, a light rail. */}
      <div className="mt-16">
        <GroupLabel index={2}>Banking experience</GroupLabel>
        <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {employment.map((org) => (
            <li key={org.organization} className="border-l border-gray-200 pl-4">
              <p className="text-[13px] font-medium text-gray-700">{org.organization}</p>
              <ul className="mt-2 space-y-1.5">
                {org.roles.map((role) => (
                  <li
                    key={`${role.title}-${role.period}`}
                    className="flex items-baseline justify-between gap-4 text-[13px] text-gray-500"
                  >
                    <span>{role.title}</span>
                    <span className="micro-label shrink-0 text-[9px] text-gray-400">
                      {role.period}
                    </span>
                  </li>
                ))}
              </ul>
              {org.summary && (
                <p className="mt-3 text-[13px] leading-relaxed text-gray-500">{org.summary}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
