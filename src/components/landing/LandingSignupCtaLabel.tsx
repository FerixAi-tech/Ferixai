export const landingSignupButtonClassName =
  "lf-btn-primary relative inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-bold tracking-wide text-white sm:w-auto sm:px-7";

export default function LandingSignupCtaLabel({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`relative z-10 inline-flex items-center gap-2.5 sm:gap-3 ${className}`}
    >
      <span
        aria-hidden
        className="text-xl font-extrabold leading-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] sm:text-2xl"
      >
        →
      </span>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className="text-[1.05em] leading-none">
          🚀
        </span>
        <span>Signup For Free</span>
      </span>
      <span
        aria-hidden
        className="text-xl font-extrabold leading-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] sm:text-2xl"
      >
        ←
      </span>
    </span>
  );
}
