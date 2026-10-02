/**
 * Settings for the AI portfolio assistant, shared by the chat panel and /api/chat.
 * Nothing secret lives here: the Gemini API key is read only on the server
 * (process.env.GEMINI_API_KEY in app/api/chat/route.ts).
 */

/** The Gemini model behind the assistant. Change it here only. */
export const GEMINI_MODEL = "gemini-3.8-flash";

/** Longest single visitor message (characters). */
export const MAX_MESSAGE_CHARS = 500;
/** Earlier turns sent along for context (visitor + assistant messages, newest kept). */
export const MAX_HISTORY_MESSAGES = 12;
/** Longest earlier turn accepted from the client (assistant replies can run longer). */
export const MAX_HISTORY_ITEM_CHARS = 2000;

export type ChatRole = "user" | "assistant";
export type ChatTurn = { role: ChatRole; text: string };

export const CHAT_WELCOME =
  "Hi! I’m Rey’s portfolio assistant. Ask me about his projects, skills, experience, or how to get in touch.";

export const CHAT_QUICK_QUESTIONS = [
  "Who is Rey?",
  "What projects has he built?",
  "What technologies does he use?",
  "Tell me about his experience.",
  "How can I contact him?",
] as const;

export const CHAT_ERROR =
  "Sorry, I couldn't respond right now. Please try again or use the Contact section to reach Rey directly.";

export const CHAT_RATE_LIMITED =
  "You're sending messages a little quickly. Please wait a moment and try again.";

/** Gemini itself is momentarily overloaded (it passes). */
export const CHAT_BUSY =
  "The assistant is getting a lot of requests right now. Please try again in a minute, or use the Contact section to reach Rey directly.";

/** The Gemini project's quota is used up (on the free tier it's a daily limit). */
export const CHAT_QUOTA =
  "The assistant has reached its usage limit for now. Please try again later, or use the Contact section to reach Rey directly.";
