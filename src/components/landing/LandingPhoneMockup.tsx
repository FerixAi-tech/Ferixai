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
          aria-label="FerixAI mobile demo"
        >
          <source src="/videos/telefon-video.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
