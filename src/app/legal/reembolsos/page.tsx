import { Wallet, RotateCcw, XCircle, Mail, Clock, ShieldCheck } from "lucide-react";

export default async function ReembolsosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pt-8 space-y-4 pb-8">
      <header className="text-center space-y-2 mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Politica de Reembolsos
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
          Condiciones y proceso para solicitar la devolucion de tu pago.
        </p>
      </header>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Garantia de 14 dias</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Ofrecemos una garantia de devolucion de 14 dias que aplica SOLO al primer pago de usuarios que no tuvieron periodo de prueba (por ejemplo, usuarios provenientes de campanas pagadas).
        </p>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Casos que no aplican</h2>
        </div>
        <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-1">
          <li>No aplica a usuarios que ya utilizaron la prueba gratis de 30 dias.</li>
          <li>No aplica a renovaciones automaticas de suscripcion.</li>
          <li>No aplica a pagos posteriores al primer cobro.</li>
        </ul>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Como solicitar un reembolso</h2>
        </div>
        <ol className="list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-1">
          <li>Escribenos a legal@blis-corp.com dentro de los 14 dias calendario siguientes al pago.</li>
          <li>Incluye el comprobante de pago y el correo asociado a tu cuenta.</li>
          <li>Procesaremos tu solicitud y te notificaremos por email.</li>
        </ol>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4. Metodo y plazo de reembolso</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          El reembolso se realizara al mismo metodo de pago utilizado en la compra original. El plazo estimado es de 5 a 10 dias habiles, dependiendo del procesador de pagos.
        </p>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">5. Cancelacion de suscripcion</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Puedes cancelar tu suscripcion en cualquier momento desde la aplicacion. El acceso a Blis Club continuara activo hasta el final del periodo pagado. No se generan reembolsos parciales por cancelacion anticipada.
        </p>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">6. Excepciones</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Nos reservamos el derecho de rechazar solicitudes que no cumplan con las condiciones descritas, que presenten documentacion incompleta o que detecten uso fraudulento del servicio.
        </p>
      </section>
    </main>
  );
}
