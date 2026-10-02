import { Resend } from "resend";
import { contactEmail } from "@/data/portfolio";
import { cleanContact, validateContact } from "@/lib/contact";
import { composeContactEmail } from "@/lib/contact-email";

/** Far more than a valid submission needs (the message alone is capped at 100 characters). */
const MAX_BODY_BYTES = 10_000;

/**
 * Receives the contact form and emails it to the portfolio's address through Resend.
 * Everything sensitive stays here: the API key and sender come from the environment, and
 * visitors only ever see a generic success or failure. Success is reported only once Resend
 * has accepted the message (it returns the new email's id).
 *
 * Responses: 200 { ok: true } · 400 { errors } (invalid fields) · 400/413/415 (malformed
 * request) · 500 (not configured, or the provider refused the message).
 */
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Unsupported request." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return Response.json({ error: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json({ error: "Request too large." }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  // Honeypot: people never see this field, bots tend to fill it. Pretend it worked.
  if (typeof input.company === "string" && input.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const fields = cleanContact(input);
  const errors = validateContact(fields);
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Contact form: RESEND_API_KEY and CONTACT_FROM_EMAIL must be set.");
    return Response.json({ error: "Not available." }, { status: 500 });
  }

  const email = composeContactEmail(fields, new Date());

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to: contactEmail,
      replyTo: fields.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    if (error || !data?.id) {
      // The provider's reason only; never the visitor's message.
      console.error("Contact form: Resend did not accept the message.", error?.name, error?.message);
      return Response.json({ error: "Not sent." }, { status: 500 });
    }
  } catch (cause) {
    console.error("Contact form: could not reach Resend.", cause instanceof Error ? cause.message : "");
    return Response.json({ error: "Not sent." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
