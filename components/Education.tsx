import { education } from "@/data/portfolio";
import { GraduationCapIcon } from "./icons";
import Section from "./Section";

export default function Education() {
  return (
    <Section id="education" index={5} label="education" title="Academic Background">
      {/* Hover (Journey's language, a shade quieter: it's information, not a link): lift 2px,
          grow 0.5%, firmer border and a soft shadow. Movement is skipped under reduced motion. */}
      <article className="flex gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5 transition-[translate,scale,border-color,box-shadow] duration-300 ease-soft hover:border-gray-400 hover:shadow-card sm:gap-5 motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.005]">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-md border border-gray-200 bg-background text-gray-600"
        >
          <GraduationCapIcon width={18} height={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <h3 className="text-[15px] font-semibold tracking-tight">{education.school}</h3>
            <span className="micro-label pt-1 text-[9px] text-gray-500">{education.period}</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-gray-500">{education.location}</p>

          <p className="mt-3 text-[13px] font-medium text-gray-800">{education.degree}</p>
          <ul className="mt-1 space-y-0.5 text-[13px] text-gray-600">
            {education.majors.map((major) => (
              <li key={major}>{major}</li>
            ))}
          </ul>
        </div>
      </article>
    </Section>
  );
}
