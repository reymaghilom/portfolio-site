# Rey C. Maghilom — Portfolio

Personal portfolio for Rey C. Maghilom, entry-level web developer. It's a single-page site with a monochrome, typography-first design: light, dark and system themes and restrained motion.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4. It has no extra runtime dependencies.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Editing content

All personal content lives in [`data/portfolio.ts`](data/portfolio.ts):

- `profile`: name, role, intro, status line, location and resume path
- `about`, `education`: the about paragraphs and the education block beneath them
- `skillGroups`: grouped skills (frontend, backend & database, tools, AI-assisted engineering, other)
- `projects`: the project cards. Each entry has a title, description, technologies, an optional `year`, and optional `github`, `live` and `image` (only add these when a real URL or screenshot exists)
- `journey`: the timeline steps
- `contactLinks`: email, phone, LinkedIn, GitHub and location

The hero's "Download Resume" button downloads `public/rey.docx`. To update the resume, replace that file.

Project images go in `public/`, for example `public/projects/app.png`, referenced as `{ src: "/projects/app.png", alt: "…" }`.

## Structure

```
app/
  layout.tsx        fonts, metadata, pre-paint theme script
  page.tsx          page composition
  globals.css       color tokens (light/dark), fonts, motion
components/         Navbar, MobileMenu, ThemeToggle, Hero, About, Skills,
                    Projects, ProjectCard, Journey, Contact, Footer, Section…
hooks/              useThemePreference, useActiveSection
lib/                theme constants, stagger helper
data/portfolio.ts   all content
```

## Credits

The design language is inspired by [bryl-minimal-design](https://github.com/bryllim/bryl-minimal-design) (MIT). The fonts are Geist, Geist Mono and Geist Pixel by Vercel.
