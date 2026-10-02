import type { ContactFields } from "./contact";

/**
 * The notification Rey receives for each contact-form message (server-side only).
 *
 * Subject "New Portfolio Message — [name]"; a plain-text version and a table-based HTML
 * version (inline styles, system fonts, a 600px column that narrows on phones). Every
 * visitor value is escaped before it goes into the HTML, and nothing that ends up in a
 * header keeps a line break.
 */

/** Header values (and one-line fields) can't carry line breaks. */
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escaped, with the visitor's line breaks kept as <br> (CSS white-space isn't reliable in mail). */
const escapeMultiline = (value: string) => escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />");

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

export function composeContactEmail(fields: ContactFields, sentAt: Date) {
  const name = oneLine(fields.name);
  const email = oneLine(fields.email);
  const subject = oneLine(fields.subject);
  const submitted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(sentAt);
  const submittedLabel = `${submitted} (Philippine time)`;

  const text = [
    "REY C. MAGHILOM",
    "PORTFOLIO CONTACT",
    "",
    "You have received a new message from your portfolio contact form.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    `Submitted: ${submittedLabel}`,
    "",
    "Message:",
    fields.message,
    "",
    "Reply directly to this email to respond to the visitor.",
    "",
    "—",
    "Rey C. Maghilom — Portfolio",
    "Web & Mobile Developer",
  ].join("\n");

  const label = (value: string) =>
    `<p style="margin:0 0 4px;font-family:${MONO};font-size:10px;line-height:14px;letter-spacing:0.12em;text-transform:uppercase;color:#8a8a8a">${value}</p>`;

  const detail = (title: string, value: string, last = false) => `
          <tr>
            <td style="padding:0 0 ${last ? "0" : "16px"}">
              ${label(title)}
              <p style="margin:0;font-family:${FONT};font-size:15px;line-height:22px;color:#0a0a0a;word-break:break-word">${value}</p>
            </td>
          </tr>`;

  // Shown as the inbox preview line in most clients; hidden in the email itself.
  const preheader = escapeHtml(`${name}: ${oneLine(fields.message)}`.slice(0, 140));

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light only" />
<title>New Portfolio Message — ${escapeHtml(name)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5">
    <tr>
      <td align="center" style="padding:32px 12px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:12px">
          <tr>
            <td style="padding:32px 32px 0">
              <h1 style="margin:0;font-family:${FONT};font-size:20px;line-height:26px;font-weight:700;letter-spacing:0.08em;color:#0a0a0a">REY C. MAGHILOM</h1>
              <p style="margin:6px 0 0;font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a">Portfolio Contact</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0"><div style="height:1px;line-height:1px;font-size:0;background-color:#e5e5e5">&nbsp;</div></td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0">
              <p style="margin:0;font-family:${FONT};font-size:15px;line-height:24px;color:#404040">You have received a new message from your portfolio contact form.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafafa;border:1px solid #ededed;border-radius:8px">
                <tr>
                  <td style="padding:20px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${detail("Name", escapeHtml(name))}${detail(
                      "Email",
                      `<a href="mailto:${escapeHtml(email)}" style="color:#0a0a0a;text-decoration:underline">${escapeHtml(email)}</a>`,
                    )}${detail("Subject", escapeHtml(subject), true)}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 0">
              <h2 style="margin:0 0 10px;font-family:${MONO};font-size:10px;line-height:14px;font-weight:400;letter-spacing:0.12em;text-transform:uppercase;color:#8a8a8a">Message</h2>
              <div style="font-family:${FONT};font-size:15px;line-height:24px;color:#171717;word-break:break-word;border-left:2px solid #0a0a0a;padding:2px 0 2px 14px">${escapeMultiline(fields.message)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0">
              ${label("Submitted")}
              <p style="margin:0;font-family:${FONT};font-size:13px;line-height:20px;color:#525252">${escapeHtml(submittedLabel)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e5e5e5">
                <tr>
                  <td style="padding:18px 0 0">
                    <p style="margin:0;font-family:${FONT};font-size:13px;line-height:20px;color:#525252"><strong style="color:#0a0a0a;font-weight:600">Reply directly to this email</strong> to respond to the visitor.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
          <tr>
            <td align="center" style="padding:20px 12px 0">
              <p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:#8a8a8a">Rey C. Maghilom — Portfolio</p>
              <p style="margin:2px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#a3a3a3">Web &amp; Mobile Developer</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: `New Portfolio Message — ${name}`, text, html };
}
