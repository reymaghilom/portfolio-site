import { GoogleGenAI, type Content } from "@google/genai";
import {
  GEMINI_MODEL,
  MAX_HISTORY_ITEM_CHARS,
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  type ChatTurn,
} from "@/lib/chat-config";
import { buildSystemInstruction } from "@/lib/portfolio-context";

/**
 * The AI portfolio assistant's backend. The browser sends { message, history }; this route
 * checks it, asks Gemini (with the portfolio facts as an authoritative system instruction)
 * and returns { reply } only. The Gemini API key and SDK never reach the browser, and
 * visitor messages are never logged.
 *
 * Responses: 200 { reply } · 400 malformed · 413 too large · 415 not JSON · 429 too many
 * requests (this site's limit) · 502 Gemini failed · 503 { error: "busy" } Gemini overloaded
 * · 503 { error: "quota" } the Gemini project's quota is used up · 503 not configured.
 */

const MAX_BODY_BYTES = 40_000;
const MAX_OUTPUT_TOKENS = 800;

// A light per-visitor guard (by IP), kept in this server instance's memory. Hosts that run
// several instances each keep their own count, so it limits bursts rather than guaranteeing
// a global quota.
const LIMITS = [
  { windowMs: 60_000, max: 8 },
  { windowMs: 60 * 60_000, max: 60 },
];
const hits = new Map<string, number[]>();

function rateLimited(key: string, now = Date.now()): boolean {
  const longest = Math.max(...LIMITS.map((limit) => limit.windowMs));
  const recent = (hits.get(key) ?? []).filter((t) => now - t < longest);
  const blocked = LIMITS.some((limit) => recent.filter((t) => now - t < limit.windowMs).length >= limit.max);
  if (!blocked) recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (!times.some((t) => now - t < longest)) hits.delete(k);
  }
  return blocked;
}

/** Trimmed text without control characters (line breaks and tabs kept). */
const clean = (value: unknown) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    : "";

const SYSTEM_INSTRUCTION = buildSystemInstruction();

/**
 * A one-line, safe summary of a Gemini failure for the server log: HTTP status, Google's
 * error status (e.g. RESOURCE_EXHAUSTED) and its message. Never the key (masked if it ever
 * appears) or anything the visitor wrote.
 */
function describeGeminiError(cause: unknown): string {
  const status = (cause as { status?: number }).status ?? "?";
  const raw = cause instanceof Error ? cause.message : String(cause);
  let type = cause instanceof Error ? cause.name : "unknown";
  let message = raw;
  const start = raw.indexOf("{");
  if (start >= 0) {
    try {
      const parsed = JSON.parse(raw.slice(start)) as { error?: { status?: string; message?: string } };
      type = parsed.error?.status ?? type;
      message = parsed.error?.message ?? message;
    } catch {
      // Not JSON: keep the plain message.
    }
  }
  const safe = message.replace(/AIza[\w-]+|AQ\.[\w.-]+/g, "[key]").replace(/\s+/g, " ").slice(0, 600);
  return `status=${status} type=${type} message="${safe}"`;
}

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

  const input = body as { message?: unknown; history?: unknown };
  const message = clean(input.message);
  if (!message || message.length > MAX_MESSAGE_CHARS) {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }
  if (input.history !== undefined && !Array.isArray(input.history)) {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  // Only plain user/assistant text turns, newest kept, each capped.
  const history: ChatTurn[] = [];
  for (const item of (input.history as unknown[] | undefined) ?? []) {
    if (!item || typeof item !== "object") continue;
    const { role, text } = item as { role?: unknown; text?: unknown };
    const value = clean(text).slice(0, MAX_HISTORY_ITEM_CHARS);
    if ((role === "user" || role === "assistant") && value) history.push({ role, text: value });
  }
  const recent = history.slice(-MAX_HISTORY_MESSAGES);

  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (rateLimited(visitor)) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Chat: GEMINI_API_KEY is not set.");
    return Response.json({ error: "Not available." }, { status: 503 });
  }

  const contents: Content[] = [
    ...recent.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const ai = new GoogleGenAI({ apiKey });
  const generate = () =>
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.4,
        httpOptions: { timeout: 30_000 },
      },
    });

  try {
    let response;
    try {
      response = await generate();
    } catch (first) {
      // Momentary overload on Google's side (503/500): one retry after a short pause.
      // Quota errors (429) are never retried; that would only use up more quota.
      const status = (first as { status?: number }).status;
      if (status !== 503 && status !== 500) throw first;
      console.error(`Chat: Gemini busy, retrying once — ${describeGeminiError(first)}`);
      await new Promise((resolve) => setTimeout(resolve, 900));
      response = await generate();
    }
    const reply = response.text?.trim();
    if (!reply) {
      const usage = response.usageMetadata;
      console.error(
        `Chat: Gemini returned no text — finishReason=${response.candidates?.[0]?.finishReason ?? "?"} thoughtsTokens=${usage?.thoughtsTokenCount ?? 0} outputTokens=${usage?.candidatesTokenCount ?? 0}`,
      );
      return Response.json({ error: "No reply." }, { status: 502 });
    }
    return Response.json({ reply });
  } catch (cause) {
    console.error(`Chat: Gemini request failed — ${describeGeminiError(cause)}`);
    // Say what's going on instead of a generic failure: the project's quota is used up
    // (Gemini 429; a daily cap on the free tier), or Gemini is momentarily overloaded.
    const status = (cause as { status?: number }).status;
    if (status === 429) return Response.json({ error: "quota" }, { status: 503 });
    if (status === 503 || status === 500) return Response.json({ error: "busy" }, { status: 503 });
    return Response.json({ error: "Not available." }, { status: 502 });
  }
}
