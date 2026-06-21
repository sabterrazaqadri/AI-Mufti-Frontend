"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import Header from "./components/Header";

export default function HomePage() {
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
