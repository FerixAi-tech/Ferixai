"use client";

import { MessageCircle } from "lucide-react";

declare global {
  interface Window {
    $crisp?: Array<string | string[]>;
  }
}

function openCrispChat() {
  if (typeof window === "undefined" || !window.$crisp) return;

  window.$crisp.push(["do", "chat:show"]);
  window.$crisp.push(["do", "chat:open"]);
}

export default function CustomChatButton() {
  return (
    <button
      type="button"
      onClick={openCrispChat}
      aria-label="Talk to Founder — open live chat"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full border border-violet-500/40 bg-[linear-gradient(135deg,rgba(88,28,135,0.92),rgba(30,20,50,0.96))] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] transition hover:border-violet-400/60 hover:shadow-[0_0_32px_rgba(139,92,246,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </span>
      <MessageCircle className="h-4 w-4 shrink-0 text-violet-200" aria-hidden />
      <span>Talk to Founder</span>
    </button>
  );
}
