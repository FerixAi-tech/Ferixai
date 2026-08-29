"use client";

export default function LandingPhoneMockup({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`lf-animate-in flex justify-center px-4 ${className}`}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/10 bg-[#0e0a18]/80 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <video
          className="h-auto w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label="FerixAI mobile demo showing an Amsterdam local AI search question"
        >
          <source src="/videos/telefon-video.mp4" type="video/mp4" />
        </video>

        <div
          className="pointer-events-none absolute inset-x-[10%] top-[14%] sm:top-[15%]"
          aria-hidden
        >
          <div className="rounded-2xl border border-emerald-400/25 bg-[#05070c]/88 px-3 py-2.5 shadow-[0_0_24px_rgba(16,185,129,0.18)] backdrop-blur-sm sm:px-3.5 sm:py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300/90 sm:text-[11px]">
              ChatGPT
            </p>
            <p className="mt-1 text-[11px] leading-snug text-white sm:text-xs">
              Which is the best dental clinic in Amsterdam?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
