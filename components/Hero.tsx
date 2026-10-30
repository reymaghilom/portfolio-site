import { profile } from "@/data/portfolio";
import { stagger } from "@/lib/stagger";
import { DownloadIcon } from "./icons";
import ProfilePhoto from "./ProfilePhoto";
import RoleTypewriter from "./RoleTypewriter";

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate grid max-w-3xl scroll-mt-20 grid-cols-1 pt-16 pb-14 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-8 sm:pt-24 lg:scroll-mt-10 lg:gap-x-10 lg:pt-32"
    >
      {/* Halftone field behind the identity, dissolving outward from the portrait. */}
      <div
        aria-hidden="true"
        className="halftone absolute top-6 -left-12 -z-10 h-72 w-[30rem] opacity-30 [mask-image:radial-gradient(ellipse_at_25%_45%,#000_5%,transparent_68%)] sm:top-14 lg:top-20 dark:opacity-45"
      />

      {/* Mobile: stacked above the name. sm+: its own column, centred on the name + role. */}
      <div className="reveal sm:self-center" style={stagger(0)}>
        <ProfilePhoto size={112} className="size-20 sm:size-24 lg:size-28" />
      </div>

      <div className="mt-6 sm:mt-0 sm:self-center">
        <h1
          id="hero-heading"
          className="reveal font-pixel text-[2.5rem] lowercase leading-[0.95] tracking-tight text-balance sm:text-[3.25rem]"
          style={stagger(1)}
        >
          {profile.name}
        </h1>

        <RoleTypewriter
          text={profile.role}
          className="reveal mt-5 font-mono text-xs uppercase tracking-[0.2em] text-gray-500"
          style={stagger(2)}
        />
      </div>

      <p
        className="reveal mt-8 max-w-md sm:col-start-2 text-base leading-relaxed text-gray-600"
        style={stagger(3)}
      >
        {profile.intro}
      </p>

      <div
        className="reveal mt-10 flex flex-wrap items-center gap-3 sm:col-start-2"
        style={stagger(4)}
      >
        <a
          href="#projects"
          className="group inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-medium text-background transition-opacity duration-200 hover:opacity-85"
        >
          Explore Projects
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-y-0.5"
          >
            ↓
          </span>
        </a>
        <a
          href={profile.resume}
          download="resume.docx"
          className="group inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-[9px] font-mono text-xs uppercase tracking-widest text-gray-700 transition-colors duration-250 ease-soft hover:border-gray-400 hover:bg-gray-50 hover:text-ink"
        >
          Download Resume
          <span className="sr-only">{" (Word document)"}</span>
          <DownloadIcon
            width={13}
            height={13}
            className="transition-transform duration-250 ease-soft group-hover:translate-y-0.5"
          />
        </a>
      </div>
    </section>
  );
}
