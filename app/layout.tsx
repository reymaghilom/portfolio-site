import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Geist_Pixel, Source_Serif_4 } from "next/font/google";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistPixel = Geist_Pixel({
  variable: "--font-geist-pixel",
  subsets: ["latin"],
  // No metric overrides exist for this face; globals.css falls back to Geist Mono.
  adjustFontFallback: false,
});

// Editorial register (font-serif), kept for long-form writing. Body copy is Geist Sans, so
// nothing on the page uses it yet: not preloaded, and only fetched once something does.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Rey C. Maghilom — Entry-Level Full Stack Web Developer and AI Automation Specialist",
  description:
    "Portfolio of Rey C. Maghilom, an entry-level web developer and BS Information Technology graduate building responsive web and mobile applications.",
  authors: [{ name: "Rey C. Maghilom" }],
  openGraph: {
    title: "Rey C. Maghilom — Entry-Level Full Stack Web Developer and AI Automation Specialist",
    description:
      "Building modern, responsive digital experiences while continuously developing my skills in web and mobile technologies.",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${geistPixel.variable} ${sourceSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
