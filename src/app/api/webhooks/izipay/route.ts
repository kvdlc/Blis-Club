import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-izipay-signature");

    // TODO: Verify Izipay webhook signature
    // const isValid = verifyIzipaySignature(JSON.stringify(body), signature, process.env.IZIPAY_WEBHOOK_SECRET!);
    // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const event = body;

    if (event.type === "subscription.created" || event.type === "subscription.updated") {
      const supabase = await createClient();
      const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .eq("izipay_price_id", event.data.plan_id)
        .single();

      if (plan) {
        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", event.data.customer_email)
          .single();

        if (user) {
          await supabase.from("subscriptions").upsert({
            user_id: user.id,
            plan_id: plan.id,
            status: event.data.status ?? "active",
            current_period_start: event.data.current_period_start,
            current_period_end: event.data.current_period_end,
            izipay_subscription_id: event.data.subscription_id,
          }, { onConflict: "user_id" });
        }
      }
    }

    if (event.type === "subscription.canceled") {
      const supabase = await createClient();
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("izipay_subscription_id", event.data.subscription_id);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
