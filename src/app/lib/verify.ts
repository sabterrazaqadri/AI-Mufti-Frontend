import type { Source } from "./api";

/**
 * Human verification: hand the whole exchange — question, answer and the exact
 * references it rests on — to a real mufti over WhatsApp.
 *
 * The number is configuration, never hardcoded: set NEXT_PUBLIC_MUFTI_WHATSAPP to
 * the Dar al-Ifta's number in international format, digits only (e.g. 923001234567).
 * When it is unset the button does not render at all, so the app never points a
 * user at a number that does not exist.
 */
export const MUFTI_WHATSAPP = (process.env.NEXT_PUBLIC_MUFTI_WHATSAPP || "").replace(/\D/g, "");

export function verifyEnabled() {
  return MUFTI_WHATSAPP.length >= 8;
}

/** WhatsApp truncates very long prefilled text, so the answer is capped. */
const MAX_ANSWER = 1200;

export function buildVerifyUrl(question: string, answer: string, sources?: Source[]): string {
  const trimmed =
    answer.length > MAX_ANSWER ? `${answer.slice(0, MAX_ANSWER).trimEnd()}…` : answer;

  const refs = (sources ?? [])
    .map((s) => `• ${s.reference || s.title}`)
    .filter(Boolean)
    .join("\n");

  const body = [
    "السلام علیکم! AI Mufti سے یہ جواب ملا ہے، براہِ کرم اس کی تصدیق فرما دیں۔",
    "",
    `سوال: ${question}`,
    "",
    "جواب:",
    trimmed,
    ...(refs ? ["", "حوالہ جات:", refs] : []),
    "",
    "— AI Mufti",
  ].join("\n");

  return `https://wa.me/${MUFTI_WHATSAPP}?text=${encodeURIComponent(body)}`;
}
