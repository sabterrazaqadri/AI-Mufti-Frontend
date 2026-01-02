"use client";

import ChatBox from "./components/ChatBox";

export default function HomePage() {
  return (<div>

    <header className="flex flex-col ml-3 mt-3 mb-3 md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-br from-green-600 to-green-400 flex items-center justify-center text-white font-bold shadow-lg">AI</div>
              <div>
                <h1 className="text-xl font-semibold">AI Mufti</h1>
                <p className="text-xs text-muted-foreground">AI Islamic QA — Sunni Hanafi</p>
              </div>
            </div>

          </header>

    <ChatBox/>
  </div>);
}
