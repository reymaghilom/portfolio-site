/**
 * The contact form's fields and rules, shared by the form (instant feedback) and the
 * /api/contact route (the check that counts: client validation is never trusted).
 */

export type ContactFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

/** Message length: at least MESSAGE_MIN, at most the message limit below (100). */
export const MESSAGE_MIN = 5;

const LIMITS: Record<keyof ContactFields, number> = {
  name: 100,
  email: 254,
  subject: 150,
  message: 100,
};

// Deliberately plain: something@something.tld, no spaces.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Trimmed copies of the fields, with control characters removed (line breaks and tabs in
 * the message are kept); anything that isn't a string becomes "".
 */
export function cleanContact(input: Partial<Record<keyof ContactFields, unknown>>): ContactFields {
  const text = (value: unknown) =>
    typeof value === "string"
      ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
      : "";
  return {
    name: text(input.name),
    email: text(input.email),
    subject: text(input.subject),
    message: text(input.message),
  };
}

/** One message per invalid field; an empty object means the form can be sent. */
export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};

  if (!fields.name) errors.name = "Please enter your name.";
  else if (fields.name.length > LIMITS.name) errors.name = `Please keep it under ${LIMITS.name} characters.`;

  if (!fields.email) errors.email = "Please enter your email address.";
  else if (fields.email.length > LIMITS.email || !EMAIL.test(fields.email))
    errors.email = "Please enter a valid email address.";

  if (!fields.subject) errors.subject = "Please add a subject.";
  else if (fields.subject.length > LIMITS.subject)
    errors.subject = `Please keep it under ${LIMITS.subject} characters.`;

  // Trimmed already, so whitespace alone counts as empty.
  if (!fields.message) errors.message = "Message is required.";
  else if (fields.message.length < MESSAGE_MIN)
    errors.message = `Message must be at least ${MESSAGE_MIN} characters.`;
  else if (fields.message.length > LIMITS.message)
    errors.message = `Message must not exceed ${LIMITS.message} characters.`;

  return errors;
}

export const contactLimits = LIMITS;
