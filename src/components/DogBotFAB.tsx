"use client";

import { MessageCircle } from "lucide-react";

export default function DogBotFAB() {
  return (
    <button
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 rounded-full bg-accent-600 hover:bg-accent-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-[0_8px_24px_-4px_rgba(139,92,246,0.5)] border-4 border-zinc-50"
      aria-label="Dog-Bot"
      onClick={() => {}}
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
