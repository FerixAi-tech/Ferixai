import { SUPPORT_EMAIL } from "@/lib/constants/urls";

export default function SupportContact({
  variant = "default",
  belowNav = false,
  className = "",
}: {
  variant?: "default" | "topRight";
  belowNav?: boolean;
  className?: string;
}) {
  const position =
    variant === "topRight"
      ? `absolute right-4 ${belowNav ? "top-20" : "top-4"} z-20 hidden md:block`
      : "";

  return (
    <div className={`${position} ${className}`.trim()}>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#94a3b8] transition hover:border-teal-500/40 hover:text-teal-200"
      >
        Help with your campaign · {SUPPORT_EMAIL}
      </a>
    </div>
  );
}
