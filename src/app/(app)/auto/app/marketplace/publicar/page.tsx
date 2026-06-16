import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PublishClient from "./PublishClient";

export default async function PublishPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return <PublishClient userId={user.id} />;
}
