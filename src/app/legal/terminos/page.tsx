import { Scale, CreditCard, RotateCcw, MapPin, Mail, FileText } from "lucide-react";

export default async function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pt-8 space-y-4 pb-8">
      <header className="text-center space-y-2 mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          Terminos y Condiciones
        </h1>
        <p className="text-zinc-500 text-base sm:text-lg max-w-xl mx-auto">
          Reglas de uso de Blis Club para tutores y sus perros.
        </p>
      </header>

      <section className="bg-white rounded-[1.25rem] p-5 space-y-3 border border-zinc-100">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900">1. Descripcion del servicio</h2>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Blis Club es una aplicacion de salud, nutricion y entrenamiento para perros, accesible via suscripcion mensual o anual. El contenido incluye planes de alimentacion, recetas, guias de entrenamiento y herramientas de seguimiento.
        </p>
      </section>

      <section className="bg-white rounded-[1.25rem] p-5 space-y-3 border border-zinc-100">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900">2. Precios y pagos</h2>
        </div>
        <ul className="list-disc list-inside text-sm text-zinc-600 leading-relaxed space-y-1">
          <li>Suscripcion mensual: $9.99 USD/mes.</li>
          <li>Suscripcion anual: $99 USD/ano.</li>
          <li>Prueba gratis de 30 dias para registro directo.</li>
          <li>Usuarios de campanas pagadas: pago inmediato con acceso inmediato.</li>
          <li>La facturacion es recurrente hasta que se cancele.</li>
        </ul>
      </section>

      <section className="bg-white rounded-[1.25rem] p-5 space-y-3 border border-zinc-100">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900">3. Garantia de devolucion</h2>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Ofrecemos 14 dias de garantia de devolucion SOLO para el primer pago de usuarios que no tuvieron periodo de prueba. No aplica a renovaciones automaticas ni a usuarios que ya utilizaron la prueba gratis de 30 dias.
        </p>
      </section>

      <section className="bg-white rounded-[1.25rem] p-5 space-y-3 border border-zinc-100">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900">4. Cancelacion y acceso</h2>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Puedes cancelar tu suscripcion desde la aplicacion en cualquier momento. El acceso continua activo hasta el final del periodo pagado. No se realizan reembolsos parciales por cancelacion anticipada.
        </p>
      </section>

      <section className="bg-white rounded-[1.25rem] p-5 space-y-3 border border-zinc-100">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900">5. Contenido digital</h2>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Todo el contenido de Blis Club se proporciona bajo una licencia personal e intransferible. No esta permitido compartir, revender o distribuir el material fuera de la plataforma.
        </p>
      </section>

      <section className="bg-white rounded-[1.25rem] p-5 space-y-3 border border-zinc-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900">6. Jurisdiccion</h2>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Estos terminos se rigen por las leyes de la Republica del Peru. Cualquier disputa sera resuelta en la ciudad de Arequipa, Peru.
        </p>
      </section>

      <section className="bg-white rounded-[1.25rem] p-5 space-y-3 border border-zinc-100">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900">7. Contacto legal</h2>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Para consultas legales, escribenos a legal@blis-corp.com.
        </p>
      </section>
    </main>
  );
}
