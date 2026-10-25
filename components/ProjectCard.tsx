import Image from "next/image";
import type { Project } from "@/data/portfolio";
import ScreenshotGallery from "./ScreenshotGallery";
import TechIcon, { iconForTech } from "./TechIcon";

type ProjectCardProps = {
  project: Project;
  /** Lead card: content beside a large media panel instead of media on top. */
  featured?: boolean;
};

const zoom = "transition-[scale] duration-[350ms] ease-soft motion-safe:group-hover:scale-[1.03]";

/**
 * The card's media area, fronted by the project's main screenshot when it has one:
 * - featured: framed in its own window (nothing cropped);
 * - a tall phone shot: upright in a phone-style frame rising from the panel's foot (the
 *   screen's upper part shows; only empty space and the system bar fall below it);
 * - otherwise: filling the panel.
 * Without screenshots, a neutral halftone panel carries the project's stack marks (small)
 * and its title as a quiet mark (no stand-in screenshot). The media zooms slightly while the card is hovered.
 */
function Media({ project, featured }: { project: Project; featured: boolean }) {
  const main = project.images?.[0];

  if (main && featured) {
    return (
      <div className="flex h-full items-center bg-surface-muted p-4 sm:p-5">
        <div
          className="relative w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-card"
          style={{ aspectRatio: `${main.width} / ${main.height}` }}
        >
          <Image
            src={main.src}
            alt={main.alt}
            fill
            quality={90}
            sizes="(min-width: 768px) 360px, calc(100vw - 4rem)"
            className={`object-cover ${zoom}`}
          />
        </div>
      </div>
    );
  }

  if (main && main.height > main.width) {
    return (
      <div className="flex h-full items-end justify-center overflow-hidden bg-surface-muted px-4 pt-5">
        <div className="h-full w-[150px] overflow-hidden rounded-t-xl border border-b-0 border-gray-300 bg-white shadow-card">
          <Image
            src={main.src}
            alt={main.alt}
            width={main.width}
            height={main.height}
            quality={90}
            sizes="150px"
            className={`h-auto w-full origin-top ${zoom}`}
          />
        </div>
      </div>
    );
  }

  if (main) {
    return (
      <div className="relative h-full overflow-hidden bg-surface-muted">
        <Image
          src={main.src}
          alt={main.alt}
          fill
          quality={90}
          sizes="(min-width: 1024px) 224px, (min-width: 640px) 50vw, 100vw"
          className={`object-cover object-top ${zoom}`}
        />
      </div>
    );
  }

  const marks = [
    ...new Set(project.technologies.map(iconForTech).filter((slug) => slug !== undefined)),
  ].slice(0, featured ? 4 : 3);

  // A quiet stand-in: halftone field, the stack's marks small at the centre, and the
  // title as a small mark in the corner. No invented screens.
  return (
    <div aria-hidden="true" className="relative h-full overflow-hidden bg-surface-muted">
      <div className={`media-dots absolute inset-0 ${zoom}`} />
      <div className="relative flex h-full items-center justify-center gap-4 text-gray-400 opacity-80">
        {marks.map((slug) => (
          <TechIcon
            key={slug}
            slug={slug}
            name={slug}
            tone="inherit"
            className={featured ? "size-5" : "size-4"}
          />
        ))}
      </div>
      <span className="micro-label absolute right-4 bottom-3.5 left-4 line-clamp-2 text-[9px] text-gray-400">
        {project.title}
      </span>
    </div>
  );
}

function TechList({ items }: { items: string[] }) {
  return (
    <ul aria-label="Technologies" className="flex flex-wrap gap-1.5">
      {items.map((tech) => (
        <li
          key={tech}
          className="micro-label rounded-sm border border-gray-200 bg-surface px-1.5 py-0.5 text-[9px] text-gray-600"
        >
          {tech}
        </li>
      ))}
    </ul>
  );
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const { title, description, technologies, year, context, github, live, images, screenshotNote } =
    project;
  const links = [
    live && { label: "Launch site", href: live },
    github && { label: "Source", href: github },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    // Hover (pointer devices only): lift 3px, grow 1%, firmer border and a soft shadow;
    // the media zooms slightly. Movement is skipped under reduced motion.
    <article
      className={`group flex h-full overflow-hidden rounded-lg border border-gray-200 bg-surface transition-[translate,scale,border-color,box-shadow] duration-[350ms] ease-soft hover:border-edge-strong hover:shadow-card motion-safe:hover:-translate-y-[3px] motion-safe:hover:scale-[1.01] ${
        featured ? "flex-col md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]" : "flex-col"
      }`}
    >
      {/* Featured: media sits on the right from md up, on top below that. */}
      <div
        className={
          featured
            ? `border-b border-gray-200 md:order-last md:border-b-0 md:border-l ${
                images?.length ? "" : "aspect-[16/7] md:aspect-auto md:min-h-64"
              }`
            : // One height for every grid card, so titles line up across a row.
              "h-60 w-full border-b border-gray-200"
        }
      >
        {images?.length ? (
          <ScreenshotGallery title={title} images={images} note={screenshotNote}>
            <Media project={project} featured={featured} />
          </ScreenshotGallery>
        ) : (
          <Media project={project} featured={featured} />
        )}
      </div>

      <div className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-8" : "p-5"}`}>
        <div className="flex flex-wrap items-center gap-2">
          {featured && (
            <span className="micro-label rounded-sm bg-ink px-1.5 py-px text-[9px] text-background">
              Featured
            </span>
          )}
          <span className="micro-label text-[9px] text-gray-500">{context}</span>
          {year && <span className="micro-label ml-auto text-[9px] text-gray-400">{year}</span>}
        </div>

        <h3
          className={`mt-3 font-semibold tracking-tight ${featured ? "text-xl sm:text-2xl" : "text-[15px]"}`}
        >
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-600">{description}</p>
        {screenshotNote && (
          <p className="micro-label mt-3 text-[9px] leading-relaxed text-gray-500">
            {screenshotNote}
          </p>
        )}

        <div className={featured ? "mt-5" : "mt-auto pt-4"}>
          <TechList items={technologies} />
        </div>

        {links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${title} — ${link.label.toLowerCase()} (opens in a new tab)`}
                className="group/link micro-label inline-flex items-center gap-1.5 rounded-sm border border-gray-300 px-3 py-2 text-[10px] font-semibold text-ink transition-colors duration-200 hover:border-ink"
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="font-sans transition-transform duration-200 group-hover/link:translate-x-0.5"
                >
                  →
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
