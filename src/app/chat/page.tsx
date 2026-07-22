import type { Metadata } from "next";
import ChatApp from "../components/ChatApp";

export const metadata: Metadata = {
  title: "Ask a Question",
  description:
    "Ask any Islamic question and get an answer sourced from Bahar-e-Shariat, Fatawa Razawiyya, Miraat-ul-Manajeeh and 23 other authentic Hanafi works. Ask in any language — Urdu, Roman Urdu, English, Arabic and more. No account required.",
  alternates: { canonical: "/chat" },
};

export default function ChatPage() {
  return <ChatApp />;
}
