import { contactLinks } from "@/data/portfolio";
import { ContactModalProvider, ContactModalTrigger } from "./ContactModal";
import Section from "./Section";

export default function Contact() {
  const email = contactLinks.find((link) => link.href?.startsWith("mailto:"));
  // Details are listed with labels; profile links sit together as a row of mono links.
  const details = contactLinks.filter((link) => !link.external);
  const profiles = contactLinks.filter((link) => link.external);

  return (
    <Section id="contact" index={6} label="contact">
      {/* One message form, opened by "Message Me →" or by the email address. */}
      <ContactModalProvider>
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-14">
          <div>
            <p className="max-w-[16ch] text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              Let’s build something useful.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
              Have a question, an idea or an opportunity to learn together? My inbox is open.
            </p>

            {/* "Message Me →" opens the message form (sent to the email below). */}
            {email && (
              <ContactModalTrigger className="group mt-7 inline-flex cursor-pointer items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-widest text-background transition-opacity duration-200 hover:opacity-85">
                Message Me
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </ContactModalTrigger>
            )}
          </div>

          <div className="md:pt-2">
            <dl className="space-y-5">
              {details.map((link) => (
                <div key={link.label}>
                  <dt className="micro-label text-[9px] text-gray-400">{link.label}</dt>
                  <dd className="mt-1 text-sm [overflow-wrap:anywhere]">
                    {link === email ? (
                      // The address opens the same message form (no mail app, no mailto:).
                      <ContactModalTrigger
                        aria-label={`Open message form to contact Rey at ${link.value}`}
                        className="cursor-pointer text-left transition-colors duration-200 hover:text-gray-600"
                      >
                        {link.value}
                      </ContactModalTrigger>
                    ) : (
                      // Phone and location are plain text here.
                      link.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <ul aria-label="Profiles" className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {profiles.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group micro-label inline-flex items-center gap-1 rounded-sm text-gray-500 transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ContactModalProvider>
    </Section>
  );
}
