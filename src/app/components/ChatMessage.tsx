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
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className={`max-w-[75%] p-3 rounded-2xl shadow-md text-sm md:text-base ${
          isUser
            ? "bg-green-600 text-white rounded-br-none"
            : "bg-white/90 text-gray-800 rounded-bl-none border border-green-100"
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
}
