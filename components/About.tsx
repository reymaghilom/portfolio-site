import Image from "next/image";
import { about, profile } from "@/data/portfolio";
import { stagger } from "@/lib/stagger";
import photo from "@/public/images/profile-cutout.png";
import { DownloadIcon } from "./icons";
import RoleTypewriter from "./RoleTypewriter";

/**
 * Opening section: an identity card (photo, name, role, location, availability) beside
 * the introduction. Sits at the top of the page, so it has no hairline above it.
 */
export default function About() {
  const [intro, ...supporting] = about;

  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-14 lg:scroll-mt-0">
      <div className="mx-auto grid max-w-2xl gap-10 pt-12 pb-20 sm:pt-16 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12 lg:pt-24 lg:pb-24">
        {/* Identity card. Phones: photo beside the details; md+: photo above them. */}
        <div className="reveal md:pt-9" style={stagger(0)}>
          <div className="flex items-center gap-4 md:block">
            <div className="profile-photo-frame relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-background sm:w-28 md:w-full">
              <Image
                src={photo}
                alt=""
                fill
                sizes="(min-width: 768px) 208px, 112px"
                loading="eager"
                fetchPriority="high"
                className="object-cover opacity-85 brightness-[.9] contrast-[.92] saturate-[.9] drop-shadow-sm"
              />
            </div>

            <div className="min-w-0 flex-1 md:mt-3">
              {/* Availability, typed on a loop above the name; the role below stays static. */}
              <div className="mb-2 flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="status-dot mt-[3px] size-1.5 shrink-0 rounded-full bg-ink"
                />
                <RoleTypewriter
                  loop
                  text={profile.status}
                  className="micro-label min-w-0 text-[9px] text-gray-500"
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-sm font-semibold tracking-tight">{profile.name}</h1>
                <span className="micro-label shrink-0 rounded-sm bg-ink px-1.5 py-0.5 text-[9px] text-background">
                  Available
                </span>
              </div>
              <p className="micro-label mt-1 text-[9px] text-gray-500">{profile.role}</p>
              <p className="micro-label mt-0.5 text-[9px] text-gray-400">{profile.location}</p>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="reveal" style={stagger(1)}>
            <span className="micro-label block text-gray-400">01 — about</span>
            <h2
              id="about-heading"
              className="mt-3 text-2xl font-semibold tracking-tight sm:text-[1.75rem]"
            >
              About Me
            </h2>
          </div>

          <div
            className="reveal mt-6 space-y-5 text-[16px] leading-[1.75] text-gray-600"
            style={stagger(2)}
          >
            <p className="text-gray-800">{intro}</p>
            {supporting.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          {/* Where a stats row would sit: the two calls to action. */}
          <div className="reveal mt-10 flex flex-wrap items-center gap-3" style={stagger(3)}>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-widest text-background transition-opacity duration-200 hover:opacity-85"
            >
              Contact Me
              {/* Sans face: Geist Mono draws "→" as a long full-cell arrow. */}
              <span
                aria-hidden="true"
                className="font-sans transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
            <a
              href={profile.resume}
              download="rey.docx"
              className="group inline-flex items-center gap-2 rounded-md border border-gray-300 bg-background px-4 py-[9px] font-mono text-[11px] font-medium uppercase tracking-widest text-gray-700 transition-colors duration-200 hover:border-gray-400 hover:text-ink"
            >
              Download Resume
              <span className="sr-only">{" (Word document)"}</span>
              <DownloadIcon
                width={13}
                height={13}
                className="transition-transform duration-200 group-hover:translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
