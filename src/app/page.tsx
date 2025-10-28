"use client";

import ChatBox from "./components/ChatBox";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="glass-card p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold">Ask the AI Mufti — Clear. Concise. Sourced.</h2>
            <p className="mt-3 text-gray-600 max-w-xl">
              AI Mufti answers Islamic jurisprudence questions with respect to Sunni Hanafi sources. Use natural language — AI Mufti will respond conversationally and cite evidences where applicable.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Respectful, faith-aware assistant trained on trusted Hanafi references.</li>
              <li>• Clear rulings, explanations, and follow-up suggestions.</li>
              <li>• Designed for learners, students, and practitioners.</li>
            </ul>

            <div className="mt-6 flex gap-3">
              <a href="/chat" className="px-4 py-2 rounded-full bg-green-600 text-white shadow hover:bg-green-700">Start a chat</a>
              <a href="#learn" className="px-4 py-2 rounded-full border border-green-100">How it works</a>
            </div>
          </div>

          <div className="w-full md:w-96">
            <div className="p-1 rounded-2xl bg-linear-to-br from-green-400 to-green-200 shadow-lg">
              <div className="bg-white rounded-xl p-4">
                <small className="text-xs text-muted-foreground">Example question</small>
                <p className="mt-2 font-medium">Is it permissible to fast on the 13th, 14th, 15th of every Islamic month?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chat" className="glass-card p-6">
  <h3 className="text-lg font-semibold">Start your question with AI Mufti</h3>
        <div className="mt-4">
          <ChatBox />
        </div>
      </section>

      <footer className="text-xs text-muted-foreground text-center">
  © {new Date().getFullYear()} AI Mufti — Built with care.
      </footer>
    </div>
  );
}
