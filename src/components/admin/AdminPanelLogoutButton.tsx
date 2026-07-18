"use client";

import { useRouter } from "next/navigation";

export default function AdminPanelLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin-panel/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-xl border border-white/10 px-3 py-2 text-sm text-[#94a3b8] hover:text-white"
    >
      Sign out
    </button>
  );
}
