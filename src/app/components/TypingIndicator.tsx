"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 mt-2 ml-2">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-green-300 rounded-full animate-bounce delay-300"></span>
      <p className="text-gray-500 text-sm italic ml-2">Mufti sahab soch rahe hain...</p>
    </div>
  );
}
