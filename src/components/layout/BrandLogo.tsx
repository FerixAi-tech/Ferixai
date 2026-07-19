import Image from "next/image";
import Link from "next/link";

const SIZE_PX = {
  sm: 56,
  md: 80,
  lg: 120,
  "2xl": 240,
} as const;

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
  const px = SIZE_PX[size];

  return (
    <Link
      href={href}
      className={`inline-flex items-center ${centered ? "justify-center" : ""}`}
      aria-label="FerixAI home"
    >
      <Image
        src="/logo.jpeg"
        alt="FerixAI"
        width={px}
        height={px}
        priority={priority}
        className="h-auto w-auto object-contain"
        style={{ width: px, height: px }}
      />
    </Link>
  );
}
