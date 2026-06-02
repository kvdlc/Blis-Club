import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();

  const [
    { count: totalUsers },
    { count: totalDogs },
    { count: totalRecipes },
    { count: totalWalks },
    { count: totalSubscriptions },
    { data: apps },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("dogs").select("*", { count: "exact", head: true }),
    supabase.from("nutrition_recipes").select("*", { count: "exact", head: true }),
    supabase.from("walks").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("applications").select("id, name, slug, is_active"),
  ]);

  return NextResponse.json({
    data: {
      totalUsers: totalUsers || 0,
      totalDogs: totalDogs || 0,
      totalRecipes: totalRecipes || 0,
      totalWalks: totalWalks || 0,
      totalActiveSubscriptions: totalSubscriptions || 0,
      applications: apps || [],
    },
  });
}
