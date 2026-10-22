# Rey C. Maghilom — Developer Portfolio

A single-page portfolio website with an AI assistant that answers visitor questions and a contact form that delivers messages by email.

## Overview

This is the personal portfolio of Rey C. Maghilom, an entry-level web and mobile developer. It presents his skills, development journey, projects, and education in one place, for recruiters, hiring managers, and potential clients.

Beyond static content, the site has two server-side features. Visitors can ask an AI assistant about Rey's background, or send him a message directly through a validated contact form. All portfolio content (profile, skills, journey, projects, and contact details) lives in one typed data file, [`data/portfolio.ts`](data/portfolio.ts), which both the page and the AI assistant draw from.

## Key Features

- **AI portfolio assistant:** a chat panel powered by Google Gemini that answers questions about Rey's projects, skills, and experience. Its responses are grounded in the portfolio's structured data, which is supplied to the model as its system instruction.
- **Contact form with email delivery:** messages are validated on both client and server and sent through Resend as branded HTML and plain-text emails. The form includes a honeypot field to filter spam bots.
- **Defensive API routes:** both endpoints check content type and body size, strip control characters, return specific HTTP status codes, and do not log visitor messages. The chat route adds basic per-IP rate limiting and retries once when Gemini is temporarily overloaded.
- **Project showcase:** project cards with technology icons, plus an accessible screenshot viewer that supports keyboard navigation, swipe gestures, and phone-style frames for mobile app screenshots.
- **Light, dark, and system themes:** a theme script runs before the first paint to prevent a flash of the wrong theme, and the user's choice is saved between visits.
- **Accessible, responsive layout:** a skip link, a navigation bar that highlights the current section, a mobile menu, scroll-reveal animations that respect reduced-motion settings, and a downloadable resume.

## Technology Stack

| Category | Technologies |
|---|---|
| Framework | Next.js 16.3 (App Router, Route Handlers) |
| Frontend | React 19.2, TypeScript 5 |
| Styling | Tailwind CSS v4, Geist font family (`next/font`) |
| AI Integration | Google Gemini via `@google/genai` |
| Email | Resend |
| Tooling | ESLint 9 (`eslint-config-next`), PostCSS |

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini key for the AI assistant (server-side only) |
| `RESEND_API_KEY` | Resend key for the contact form (server-side only) |
| `CONTACT_FROM_EMAIL` | Sender address on a domain verified in Resend |

The site runs without these keys. The assistant and the contact form then return an error message, and the rest of the page works normally. Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Project Structure

```text
app/
  api/chat/         Gemini-backed assistant endpoint
  api/contact/      Resend-backed contact form endpoint
  layout.tsx        fonts, metadata, pre-paint theme script
  page.tsx          page composition
components/         page sections, project cards, screenshot viewer, contact modal, chat
hooks/              theme preference, active-section tracking
lib/                chat and contact settings, validation, email template, AI context
data/portfolio.ts   all portfolio content
```

## Developer

- **Developer:** Rey C. Maghilom
- **Project Type:** Software Development Portfolio Project
- **Role:** Design implementation, front-end development, server API routes (AI assistant and contact form), and content

## Project Status

Version 0.1.0. All features listed above are implemented in the codebase.

## Credits

The design language is inspired by [bryl-minimal-design](https://github.com/bryllim/bryl-minimal-design) (MIT). The fonts are Geist, Geist Mono, and Geist Pixel by Vercel. The brand icons come from [Simple Icons](https://simpleicons.org) (CC0-1.0).
