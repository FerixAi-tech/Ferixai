import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateInvoiceDetails } from "@/lib/campaign/validate-invoice";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await request.json();
    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId) {
      return NextResponse.json(
        { error: "Checkout session is required" },
        { status: 400 },
      );
    }

    const invoice = validateInvoiceDetails(body.invoice);
    const admin = createAdminClient();

    const { data: order, error: orderError } = await admin
      .from("payment_orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("stripe_session_id", sessionId)
      .eq("status", "pending")
      .maybeSingle();

    if (orderError || !order?.id) {
      return NextResponse.json(
        { error: "Could not find a pending payment for this checkout session." },
        { status: 404 },
      );
    }

    const { data: existing } = await admin
      .from("invoice_details")
      .select("id")
      .eq("payment_order_id", order.id)
      .maybeSingle();

    const row = {
      user_id: user.id,
      payment_order_id: order.id,
      business_name: invoice.businessName,
      email: invoice.email,
      emirate_city: invoice.emirateCity,
      street_area: invoice.streetArea,
      trn_number: invoice.trnNumber,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error: updateError } = await admin
        .from("invoice_details")
        .update(row)
        .eq("id", existing.id);
      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { error: insertError } = await admin
        .from("invoice_details")
        .insert(row);
      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Stripe invoice save error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not save invoice details",
      },
      { status: 500 },
    );
  }
}
