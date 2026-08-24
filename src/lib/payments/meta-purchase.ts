import { createAdminClient } from "@/lib/supabase/admin";
import { sendMetaCAPIEvent } from "@/lib/meta/capi";

export async function trackPaidPurchaseWithMetaCapi(
  baseUrl: string,
  order: {
    id: string;
    user_id: string;
    amount_gbp: number | string;
    currency?: string | null;
    client_ip?: string | null;
    client_user_agent?: string | null;
    meta_fbp?: string | null;
    meta_fbc?: string | null;
  },
): Promise<void> {
  try {
    const admin = createAdminClient();
    const [{ data: profile }, authUserResult] = await Promise.all([
      admin
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .maybeSingle(),
      admin.auth.admin.getUserById(order.user_id),
    ]);

    const authUser = authUserResult.data.user;
    const email = profile?.email || authUser?.email || null;
    const phone = authUser?.phone || null;
    const amount = Number(order.amount_gbp);

    if (!(amount > 0)) return;

    const result = await sendMetaCAPIEvent({
      eventName: "Purchase",
      eventId: order.id,
      value: amount,
      currency: order.currency || "GBP",
      contentName: "FerixAI Subscription",
      eventSourceUrl: `${baseUrl}/dashboard`,
      email,
      phone,
      ip: order.client_ip,
      userAgent: order.client_user_agent,
      fbp: order.meta_fbp,
      fbc: order.meta_fbc,
    });

    if (!result.ok && !result.skipped) {
      console.error("Meta CAPI Purchase failed:", result.error);
    }
  } catch (err) {
    console.error("Meta CAPI Purchase error:", err);
  }
}
