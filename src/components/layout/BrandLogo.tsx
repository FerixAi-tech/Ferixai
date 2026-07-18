import Link from "next/link";

export default function BrandLogo({
  href = "/",
  size = "md",
  priority = false,
  centered = false,
}: {
  href?: string;
  size?: "sm" | "md" | "lg" | "2xl";
  priority?: boolean;
  centered?: boolean;
}) {
  const sizeClass =
    size === "2xl"
      ? "text-3xl sm:text-4xl"
      : size === "lg"
        ? "text-2xl"
        : size === "sm"
          ? "text-lg"
          : "text-xl";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-bold tracking-tight text-white ${sizeClass} ${
        centered ? "justify-center" : ""
      }`}
      aria-label="FerixAI home"
      data-priority={priority ? "true" : undefined}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-500 text-sm font-black text-white shadow-[0_0_20px_rgba(14,165,164,0.35)]">
        F
      </span>
      <span className="lf-orbitron">
        Ferix<span className="text-fuchsia-300">AI</span>
      </span>
    </Link>
  );
}
