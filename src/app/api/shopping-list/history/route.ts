import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const ingredient = searchParams.get("ingredient");
    const storeId = searchParams.get("store_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    let query = supabase.from("shopping_purchases").select("*, store:purchase_stores(*)").eq("user_id", userId).order("purchase_date", { ascending: false });

    if (ingredient) query = query.ilike("ingredient_name", `%${ingredient}%`);
    if (storeId) query = query.eq("store_id", storeId);
    if (startDate) query = query.gte("purchase_date", startDate);
    if (endDate) query = query.lte("purchase_date", endDate);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[Shopping History] Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
