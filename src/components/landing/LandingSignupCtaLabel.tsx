import { ChevronLeft, ChevronRight } from "lucide-react";

export const landingSignupButtonClassName =
  "lf-btn-primary relative inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-bold tracking-wide text-white sm:w-auto sm:px-7";

const arrowClassName =
  "h-7 w-7 shrink-0 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.55)] sm:h-8 sm:w-8";

export default function LandingSignupCtaLabel({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`relative z-10 inline-flex items-center gap-2.5 sm:gap-3 ${className}`}
    >
      <ChevronRight
        aria-hidden
        className={arrowClassName}
        strokeWidth={3.5}
      />
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className="text-[1.05em] leading-none">
          🚀
        </span>
        <span>Signup For Free</span>
      </span>
      <ChevronLeft aria-hidden className={arrowClassName} strokeWidth={3.5} />
    </span>
  );
}
