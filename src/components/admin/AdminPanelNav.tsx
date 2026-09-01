import Link from "next/link";

const LINKS = [
  { href: "/om-admin-panel", label: "Published campaigns" },
  { href: "/om-admin-panel/audit-simulations", label: "AI audit searches" },
] as const;

export default function AdminPanelNav({
  active,
}: {
  active: (typeof LINKS)[number]["href"];
}) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const isActive = link.href === active;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-teal-400/50 bg-teal-500/15 text-teal-100"
                : "border-white/10 bg-white/[0.03] text-[#94a3b8] hover:border-teal-500/30 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
