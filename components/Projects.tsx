import type { ReactNode } from "react";
import { projects } from "@/data/portfolio";
import ProjectCard from "./ProjectCard";
import RevealOnView from "./RevealOnView";
import Section from "./Section";
import { ShowMoreProvider, ShowMoreRegion, ShowMoreToggle } from "./ShowMoreProjects";

/** Projects shown before "Show All" (the featured one included). */
const INITIAL = 3;

/** 2-up from tablets; a card left alone on its row takes the full row. */
const grid = "grid gap-3 sm:grid-cols-2";
const cell = "sm:last:odd:col-span-2";

export default function Projects() {
  const [lead, ...rest] = projects;
  const shown = rest.slice(0, INITIAL - 1);
  const more = rest.slice(INITIAL - 1);

  const section = (action?: ReactNode) => (
    <Section id="projects" index={4} label="projects" title="Selected Projects" action={action}>
      {/* The lead project spans the column; the next ones follow in the grid, each fading up
          as it scrolls into view, staggered in reading order. Any further projects wait
          behind "Show All" in the heading row. */}
      <RevealOnView index={0}>
        <ProjectCard project={lead} featured />
      </RevealOnView>
      <div className={`mt-3 ${grid}`}>
        {shown.map((project, i) => (
          <RevealOnView key={project.title} index={i + 1} className={cell}>
            <ProjectCard project={project} />
          </RevealOnView>
        ))}
      </div>
      {more.length > 0 && (
        <ShowMoreRegion>
          <div className={`pt-3 ${grid}`}>
            {more.map((project) => (
              <div key={project.title} className={cell}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </ShowMoreRegion>
      )}
    </Section>
  );

  return more.length > 0 ? (
    <ShowMoreProvider count={more.length}>{section(<ShowMoreToggle />)}</ShowMoreProvider>
  ) : (
    section()
  );
}
