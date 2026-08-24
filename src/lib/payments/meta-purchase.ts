import { createAdminClient } from "@/lib/supabase/admin";
import { sendMetaCAPIEvent } from "@/lib/meta/capi";

export async function trackPaidPurchaseWithMetaCapi(
  baseUrl: string,
  order: {
    id: string;
    user_id: string;
    amount_gbp?: number | string | null;
    currency?: string | null;
    client_ip?: string | null;
    client_user_agent?: string | null;
    meta_fbp?: string | null;
    meta_fbc?: string | null;
  },
): Promise<void> {
  try {
    const admin = createAdminClient();

    let amount = Number(order.amount_gbp);
    let currency = order.currency;
    let clientIp = order.client_ip;
    let clientUserAgent = order.client_user_agent;
    let metaFbp = order.meta_fbp;
    let metaFbc = order.meta_fbc;

    if (!(amount > 0) || metaFbp === undefined) {
      const { data: stored } = await admin
        .from("payment_orders")
        .select(
          "amount_gbp, currency, client_ip, client_user_agent, meta_fbp, meta_fbc",
        )
        .eq("id", order.id)
        .maybeSingle();

      if (stored) {
        if (!(amount > 0)) amount = Number(stored.amount_gbp);
        currency = currency ?? stored.currency;
        clientIp = clientIp ?? stored.client_ip;
        clientUserAgent = clientUserAgent ?? stored.client_user_agent;
        metaFbp = metaFbp ?? stored.meta_fbp;
        metaFbc = metaFbc ?? stored.meta_fbc;
      }
    }

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

    if (!(amount > 0)) return;

    const result = await sendMetaCAPIEvent({
      eventName: "Purchase",
      eventId: order.id,
      value: amount,
      currency: currency || "GBP",
      contentName: "FerixAI Subscription",
      eventSourceUrl: `${baseUrl}/dashboard`,
      email,
      phone,
      ip: clientIp,
      userAgent: clientUserAgent,
      fbp: metaFbp,
      fbc: metaFbc,
    });

    if (!result.ok) {
      if (result.skipped) {
        console.warn("Meta CAPI Purchase skipped:", result.error);
      } else {
        console.error("Meta CAPI Purchase failed:", result.error);
      }
    }
  } catch (err) {
    console.error("Meta CAPI Purchase error:", err);
  }
}
