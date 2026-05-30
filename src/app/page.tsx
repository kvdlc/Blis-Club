import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            Blis Club
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Tu ecosistema de apps para mascotas
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-zinc-400">
          Al ingresar aceptas nuestros términos y política de privacidad
        </p>
      </div>
    </main>
  );
}
