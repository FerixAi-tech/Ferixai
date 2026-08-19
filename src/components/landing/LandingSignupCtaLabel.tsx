export default function LandingSignupCtaLabel({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`relative z-10 inline-flex items-center gap-2 sm:gap-2.5 ${className}`}
    >
      <span
        aria-hidden
        className="text-base leading-none tracking-normal text-white/85"
      >
        →
      </span>
      <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-3.5">
        <span aria-hidden className="text-[1.05em] leading-none">
          🚀
        </span>
        <span>Signup For Free</span>
      </span>
      <span
        aria-hidden
        className="text-base leading-none tracking-normal text-white/85"
      >
        ←
      </span>
    </span>
  );
}
