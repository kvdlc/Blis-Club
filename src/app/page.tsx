import { LoginForm } from "@/components/LoginForm";
import { AppSwitcherWrapper } from "@/components/AppSwitcherWrapper";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-zinc-50/60 dark:bg-zinc-950">
      {/* Decorative background blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200/40 rounded-full blur-3xl" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h1 className="text-4xl font-extrabold text-primary-700 dark:text-primary-300 tracking-tight">
            Blis Club
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Tu ecosistema de apps para mascotas
          </p>
        </div>
        <AppSwitcherWrapper />
        <LoginForm />
        <p className="text-center text-xs text-zinc-400">
          Al ingresar aceptas nuestros términos y política de privacidad
        </p>
      </div>
    </main>
  );
}
