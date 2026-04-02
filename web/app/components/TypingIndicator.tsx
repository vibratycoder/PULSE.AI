"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
      <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
      <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
    </div>
  );
}
