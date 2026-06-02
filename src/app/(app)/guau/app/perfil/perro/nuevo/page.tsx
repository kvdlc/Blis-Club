import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewDogClient } from "./NewDogClient";

export default async function NewDogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return <NewDogClient userId={user.id} />;
}
