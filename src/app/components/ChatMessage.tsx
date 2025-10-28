"use client";
import { motion } from "framer-motion";

interface ChatMessageProps {
  sender: "user" | "ai";
  message: string;
}

export default function ChatMessage({ sender, message }: ChatMessageProps) {
  const isUser = sender === "user";
  return (
    <motion.div
      className={`flex w-full mb-3 ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
  role="article"
  aria-label={isUser ? "Your message" : "AI Mufti response"}
        className={`max-w-[80%] p-3 rounded-2xl text-sm md:text-base shadow ${
          isUser
            ? "bg-linear-to-br from-green-600 to-green-500 text-white rounded-br-none"
            : "bg-white/95 text-gray-900 rounded-bl-none border border-green-50"
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
}
