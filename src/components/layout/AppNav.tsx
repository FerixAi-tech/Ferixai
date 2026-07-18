import Link from "next/link";
import BrandLogo from "@/components/layout/BrandLogo";

export default function AppNav({
  logoHref = "/dashboard",
  userLabel,
  right,
  backLink,
}: {
  logoHref?: string;
  userLabel?: string;
  right?: React.ReactNode;
  backLink?: { href: string; label: string };
}) {
  return (
    <header className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <BrandLogo href={logoHref} size="md" />
          {backLink && (
            <Link
              href={backLink.href}
              className="text-sm text-[#94a3b8] transition hover:text-white"
            >
              ← {backLink.label}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {userLabel && (
            <span className="hidden text-sm text-[#94a3b8] sm:inline">
              {userLabel}
            </span>
          )}
          {right}
        </div>
      </div>
    </header>
  );
}
