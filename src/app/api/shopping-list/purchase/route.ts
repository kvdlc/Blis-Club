import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const supabase = createServiceClient();
  try {
    const body = await request.json();
    const { user_id, ingredient_name, store_id, quantity, quantity_unit, currency, price_total, purchase_date, notes } = body;

    if (!user_id || !ingredient_name || !price_total || !quantity) {
      return NextResponse.json({ error: "user_id, ingredient_name, quantity, price_total required" }, { status: 400 });
    }

    // Convert quantity to kg for price_per_kg calculation
    let qtyKg = Number(quantity);
    const unit = quantity_unit || 'kg';
    if (unit === 'g') qtyKg = qtyKg / 1000;
    else if (unit === 'unidad' || unit === 'pieza') qtyKg = qtyKg; // assume quantity already in kg-ish? no, need unit_weight
    
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
