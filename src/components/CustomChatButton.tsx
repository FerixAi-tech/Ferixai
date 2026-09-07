"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CrispCommand =
  | string
  | string[]
  | [string, string]
  | [string, string, () => void];

declare global {
  interface Window {
    $crisp?: CrispCommand[];
  }
}

function openCrispChat() {
  if (typeof window === "undefined") return;

  window.$crisp = window.$crisp || [];
  window.$crisp.push(["do", "chat:show"]);
  window.$crisp.push(["do", "chat:open"]);
}

export default function CustomChatButton() {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipSuppressed, setTooltipSuppressed] = useState(false);
  const suppressedRef = useRef(false);

  const suppressTooltip = useCallback(() => {
    suppressedRef.current = true;
    setTooltipSuppressed(true);
    setTooltipVisible(false);
  }, []);

  const handleOpenChat = useCallback(() => {
    suppressTooltip();
    openCrispChat();
  }, [suppressTooltip]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.$crisp = window.$crisp || [];
      window.$crisp.push(["do", "chat:hide"]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onChatOpened() {
      suppressTooltip();
    }

    window.$crisp = window.$crisp || [];
    window.$crisp.push(["on", "chat:opened", onChatOpened]);

    return () => {
      window.$crisp?.push(["off", "chat:opened"]);
    };
  }, [suppressTooltip]);

  useEffect(() => {
    if (tooltipSuppressed) return;

    let cancelled = false;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    const schedule = (callback: () => void, delayMs: number) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        if (!cancelled && !suppressedRef.current) {
          callback();
        }
      }, delayMs);
      timeouts.add(id);
    };

    const runCycle = (isFirstCycle: boolean) => {
      schedule(() => {
        setTooltipVisible(true);

        schedule(() => {
          setTooltipVisible(false);

          schedule(() => runCycle(false), 5000);
        }, 3000);
      }, isFirstCycle ? 2000 : 5000);
    };

    runCycle(true);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, [tooltipSuppressed]);

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {!tooltipSuppressed ? (
        <button
          type="button"
          onClick={handleOpenChat}
          aria-label="Have questions about AI indexing? Open live chat"
          className={`relative max-w-[240px] rounded-2xl border border-violet-500/35 bg-[linear-gradient(165deg,#1a1028_0%,#0e0a18_100%)] px-4 py-3 text-left text-sm leading-snug text-[#e2e8f0] shadow-[0_0_20px_rgba(139,92,246,0.22)] transition-all duration-300 hover:border-violet-400/50 hover:shadow-[0_0_28px_rgba(139,92,246,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:max-w-[260px] ${
            tooltipVisible
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          }`}
        >
          Have questions about AI indexing? Ask us! 👋
          <span
            className="absolute -bottom-2 right-8 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-violet-500/35"
            aria-hidden
          />
          <span
            className="absolute -bottom-[7px] right-8 h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-[#120c1e]"
            aria-hidden
          />
        </button>
      ) : null}

      <button
        type="button"
        onClick={handleOpenChat}
        aria-label="Talk to Founder — open live chat"
        className="inline-flex items-center gap-2.5 rounded-full border border-purple-400/40 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] transition hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_28px_rgba(168,85,247,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 animate-pulse"
          aria-hidden
        />
        <span>Talk to Founder</span>
      </button>
    </div>
  );
}
