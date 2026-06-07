import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dogId: string }> }
) {
  const { dogId } = await params;

  if (!dogId) {
    return NextResponse.json({ error: "Missing dogId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("id, nombre, raza, edad_meses, peso_kg, foto_url, breed_image_url, is_lost, lost_since, lost_location, lost_notes, poster_title, poster_photo_url, poster_contact, poster_reward_amount, owner_id, tamano, objetivo_principal")
    .eq("id", dogId)
    .single();

  if (error || !dog) {
    return NextResponse.json({ error: "Dog not found" }, { status: 404 });
  }

  const { data: breedImg } = await supabase
    .from("breed_images")
    .select("image_url")
    .eq("breed_name", (dog as { raza: string }).raza)
    .limit(1)
    .single();

  const breed_image_url = (breedImg as { image_url: string } | null)?.image_url ?? null;

  const { data: publicProfile } = await supabase
    .from("dog_public_profiles")
    .select("*")
    .eq("dog_id", dogId)
    .single();

  const { data: metabolicProfile } = await supabase
    .from("dog_metabolic_profiles")
    .select("activity_level, allergies, medical_conditions, feeding_pct, diet_type")
    .eq("dog_id", dogId)
    .single();

  return NextResponse.json({
    ...dog,
    breed_image_url,
    public_profile: publicProfile ?? null,
    metabolic_profile: metabolicProfile ?? null,
  });
}
