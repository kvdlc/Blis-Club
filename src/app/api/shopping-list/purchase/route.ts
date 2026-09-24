import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createServiceClient();
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { ingredient_name, store_id, quantity, quantity_unit, unit_weight_g, currency, price_total, purchase_date, notes } = body;
    const user_id = user.id;

    if (!ingredient_name || !price_total || !quantity) {
      return NextResponse.json({ error: "ingredient_name, quantity, price_total required" }, { status: 400 });
    }

    // Convert quantity to kg for price_per_kg calculation
    let qtyKg = Number(quantity);
    const unit = quantity_unit || 'kg';
    if (unit === 'g') {
      qtyKg = qtyKg / 1000;
    } else if (unit === 'unidad' || unit === 'pieza' || unit === 'docena') {
      const unitWeight = Number(unit_weight_g) || 0;
      const units = unit === 'docena' ? qtyKg * 12 : qtyKg;
      qtyKg = unitWeight > 0 ? (units * unitWeight) / 1000 : 0;
    }

    const pricePerKg = qtyKg > 0 ? Number(price_total) / qtyKg : null;

    const { data, error } = await supabase.from("shopping_purchases").insert({
      user_id,
      ingredient_name,
      store_id: store_id || null,
      quantity: Number(quantity),
      quantity_unit: unit,
      currency: currency || 'PEN',
      price_total: Number(price_total),
      price_per_kg: pricePerKg,
      purchase_date: purchase_date || new Date().toISOString().slice(0, 10),
      notes: notes || null,
    }).select("*, store:purchase_stores(*)").single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[Shopping Purchase] Error:", error);
    return NextResponse.json({ error: "Failed to register purchase" }, { status: 500 });
  }
}
