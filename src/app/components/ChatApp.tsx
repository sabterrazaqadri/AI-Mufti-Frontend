"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatBox from "./ChatBox";
import Header from "./Header";

export default function ChatApp() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  return (
    <div className="app-layout">
      <Sidebar currentChatId={currentChatId} onSelectChat={setCurrentChatId} />
      <main className="main-content">
        <Header />
        <ChatBox currentChatId={currentChatId} onChatIdChange={setCurrentChatId} />
      </main>
    </div>
  );
}
