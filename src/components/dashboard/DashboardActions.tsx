"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { clearWizardSessionState } from "@/lib/campaign/draft";

export default function DashboardActions() {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    clearWizardSessionState();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-xl border border-white/10 px-3 py-2 text-sm text-[#94a3b8] transition hover:border-fuchsia-500/40 hover:text-white"
    >
      Sign out
    </button>
  );
}
