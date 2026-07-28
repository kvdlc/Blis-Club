import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GymController from "./GymController";

export const dynamic = "force-dynamic";

export default async function GimnasioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  return <GymController userId={user.id} />;
}
