import About from "@/components/About";
import ChatLauncher from "@/components/chat/ChatLauncher";
import Contact from "@/components/Contact";
import Education from "@/components/Education";
import Footer from "@/components/Footer";
import Journey from "@/components/Journey";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-60 rounded-md bg-ink px-3 py-2 text-xs text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <Navbar />

      {/* Content area: sections run edge to edge so their hairlines span it,
          while each section's content keeps to one centred column. */}
      <div id="top" className="min-h-dvh overflow-x-clip lg:pl-44">
        <div className="px-4 sm:px-8 lg:px-10">
          <main id="main" tabIndex={-1} className="outline-none">
            <About />
            <Skills />
            <Journey />
            <Projects />
            <Education />
            <Contact />
          </main>
          <Footer />
          {/* Room under the footer for the fixed "Chat with Rey" launcher on narrower screens,
              so at the very bottom of the page it never sits over the footer's links. */}
          <div aria-hidden="true" className="h-20 xl:hidden" />
        </div>
      </div>

      {/* AI portfolio assistant: a small launcher; the panel loads on demand. */}
      <ChatLauncher />
    </>
  );
}
