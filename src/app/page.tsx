import { LoginForm } from "@/components/LoginForm";
import { AppSwitcherWrapper } from "@/components/AppSwitcherWrapper";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-zinc-50">
      {/* Decorative background blobs - neutral gray */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-zinc-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-zinc-300/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-200/20 rounded-full blur-3xl" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-900/20">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
            Blis Club
          </h1>
          <p className="text-zinc-500">
            Tu ecosistema de apps inteligentes
          </p>
          <p className="text-xs text-zinc-400">
            Mascotas, autos, eventos y más. Todo en un solo lugar.
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
