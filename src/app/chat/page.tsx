import ChatBox from "../components/ChatBox";

export default function ChatPage() {
  return (
    <main className="min-h-screen">
      <div className="app-container">
        <section className="glass-card p-6">
          <h2 className="text-2xl font-semibold">Chat with AI Mufti</h2>
          <p className="text-sm text-muted-foreground mt-1">Ask clearly — AI Mufti responds with reasoning and references when applicable.</p>

          <div className="mt-6">
            <ChatBox />
          </div>
        </section>
      </div>
    </main>
  );
}
