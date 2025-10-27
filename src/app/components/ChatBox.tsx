"use client";

import { useState } from "react";

export default function ChatBox() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "sabter_user_001",
          content: input,
        }),
      });

      if (!res.ok) {
        throw new Error("Backend error: " + res.statusText);
      }

      const data = await res.json();

      // Typing animation
      const reply = data.reply || "⚠️ No reply received.";
      let displayed = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      for (const char of reply) {
        displayed += char;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = displayed;
          return updated;
        });
        await new Promise((r) => setTimeout(r, 20));
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Backend not reachable." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col max-w-xl mx-auto h-[90vh] border rounded-2xl shadow-md bg-white p-4">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[80%] ${
              msg.role === "user"
                ? "bg-green-100 self-end ml-auto"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-500 animate-pulse">
            Mufti sahab soch rahe hain...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Apna sawal likhiye..."
          className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
