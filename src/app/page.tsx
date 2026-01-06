"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";

export default function HomePage() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const handleSelectChat = (chatId: string | null) => {
    setCurrentChatId(chatId);
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />
      <main className="main-content">
        <ChatBox
          currentChatId={currentChatId}
          onChatIdChange={setCurrentChatId}
        />
      </main>
    </div>
  );
}
