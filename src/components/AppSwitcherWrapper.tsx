import { createClient } from "@/lib/supabase/server";
import { getUserAppsServer } from "@/lib/trial";
import AppSwitcher from "@/components/AppSwitcher";

export async function AppSwitcherWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const apps = await getUserAppsServer(supabase, user.id);

  if (apps.length <= 1) return null;

  return (
    <div className="fixed inset-0 z-50">
      <AppSwitcher />
    </div>
  );
}
