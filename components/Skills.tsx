import { skillGroups } from "@/data/portfolio";
import Section from "./Section";
import TechIcon from "./TechIcon";

export default function Skills() {
  return (
    <Section id="skills" index={2} label="skills" title="Skills & Tools">
      <div className="space-y-10">
        {skillGroups.map((group) => {
          const headingId = `skills-${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
          return (
            <div key={group.title}>
              <h3 id={headingId} className="micro-label font-semibold text-ink">
                {group.title}
              </h3>
              {group.description && (
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-gray-500">
                  {group.description}
                </p>
              )}

              {/* Logo + name tiles: a hairline frame, lifting slightly on hover. */}
              <ul
                aria-labelledby={headingId}
                className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {group.items.map((skill) => (
                  <li
                    key={skill.name}
                    className="flex min-w-0 items-center gap-2.5 rounded-md border border-gray-200 bg-background px-3 py-2.5 text-[13px] leading-tight text-gray-800 transition-[translate,border-color] duration-200 ease-soft hover:border-gray-400 motion-safe:hover:-translate-y-0.5"
                  >
                    <TechIcon slug={skill.icon} name={skill.name} className="size-4" />
                    <span className="min-w-0">{skill.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
