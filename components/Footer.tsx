import { profile } from "@/data/portfolio";

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-2xl flex-col gap-3 border-t border-gray-200 py-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="micro-label text-[9px] text-gray-400">
        © {new Date().getFullYear()} {profile.name}
      </p>
      <div className="flex items-center gap-5">
        <a
          href="#top"
          className="group micro-label inline-flex items-center gap-1 rounded-sm text-[9px] text-gray-400 transition-colors duration-200 hover:text-ink"
        >
          Top
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
          >
            ↑
          </span>
        </a>
      </div>
    </footer>
  );
}
