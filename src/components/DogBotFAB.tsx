"use client";

import { MessageCircle } from "lucide-react";

export default function DogBotFAB() {
  return (
    <button
      className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-600/30 flex items-center justify-center transition-transform active:scale-95"
      aria-label="Dog-Bot"
      onClick={() => {}}
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
