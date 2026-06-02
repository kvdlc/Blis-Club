import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBillingProfile } from "@/lib/billing";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("billing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data || null });
  } catch (e) {
    console.error("[BillingProfile GET] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();

    const validation = validateBillingProfile(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("billing_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes un perfil de facturación. Usa PUT para actualizar." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("billing_profiles")
      .insert({
        user_id: user.id,
        full_name: body.full_name.trim(),
        document_type: body.document_type,
        document_number: body.document_number.trim(),
        country_code: body.country_code,
        city: body.city?.trim() || null,
        address_line: body.address_line?.trim() || null,
        postal_code: body.postal_code?.trim() || null,
        binance_pay_id: body.binance_pay_id?.trim() || null,
        binance_email: body.binance_email?.trim() || null,
        paypal_email: body.paypal_email?.trim() || null,
        withdrawal_method: body.withdrawal_method || "binance_pay",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (e) {
    console.error("[BillingProfile POST] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();

    const validation = validateBillingProfile(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("billing_profiles")
      .update({
        full_name: body.full_name.trim(),
        document_type: body.document_type,
        document_number: body.document_number.trim(),
        country_code: body.country_code,
        city: body.city?.trim() || null,
        address_line: body.address_line?.trim() || null,
        postal_code: body.postal_code?.trim() || null,
        binance_pay_id: body.binance_pay_id?.trim() || null,
        binance_email: body.binance_email?.trim() || null,
        paypal_email: body.paypal_email?.trim() || null,
        withdrawal_method: body.withdrawal_method || "binance_pay",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (e) {
    console.error("[BillingProfile PUT] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
