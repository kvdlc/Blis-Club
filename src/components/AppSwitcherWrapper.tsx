import { createClient } from "@/lib/supabase/server";
import { getUserAppsServer } from "@/lib/trial";
import AppSwitcher from "@/components/AppSwitcher";

export async function AppSwitcherWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const apps = await getUserAppsServer(supabase, user.id);

  // Si no tiene apps, crear trial y mostrar login (se maneja en LoginForm)
  if (apps.length === 0) return null;

  // Si tiene 1 sola app, la middleware ya redirigió. Si llega aquí con 1, no mostrar nada.
  if (apps.length <= 1) return null;

  // 2+ apps: mostrar el switcher
  return (
    <div className="w-full max-w-sm mx-auto">
      <AppSwitcher />
    </div>
  );
}
