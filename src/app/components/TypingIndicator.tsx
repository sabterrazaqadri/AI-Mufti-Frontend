"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-3 mt-2">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150"></span>
        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse delay-300"></span>
      </div>
  <p className="text-sm text-muted-foreground">AI Mufti is preparing a thoughtful response…</p>
    </div>
  );
}
