import { Shield, Database, Users, Lock, Mail, Eye, Hand } from "lucide-react";

export default async function PrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 pt-8 space-y-4 pb-8">
      <header className="text-center space-y-2 mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Politica de Privacidad
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
          Como protegemos y gestionamos tu informacion personal y la de tu perro.
        </p>
      </header>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Responsable del tratamiento</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          El responsable del tratamiento de datos es BLIS CORP S.A.C., con domicilio en Arequipa, Peru. El delegado de privacidad puede contactarse en privacidad@blis-corp.com.
        </p>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Datos que recolectamos</h2>
        </div>
        <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-1">
          <li>Perfil del tutor: nombre, correo electronico y datos de contacto.</li>
          <li>Datos del perro: raza, edad, peso, condiciones de salud y historial de paseos.</li>
          <li>Ubicacion: solo cuando el usuario reporta a su perro como perdido.</li>
          <li>Datos de pago: procesados directamente por terceros, no almacenados por nosotros.</li>
        </ul>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Bases legales</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Tratamos tus datos con base en la ejecucion del contrato de suscripcion, tu consentimiento explicito y nuestro interes legitimo para mejorar el servicio y garantizar la seguridad.
        </p>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4. Terceros y procesadores</h2>
        </div>
        <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-1">
          <li>Procesadores de pago: IziPay.</li>
          <li>Infraestructura cloud: Supabase.</li>
          <li>Herramientas de analisis para mejorar la experiencia.</li>
        </ul>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Hand className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">5. Derechos ARCO</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Tienes derecho al acceso, rectificacion, cancelacion, oposicion y portabilidad de tus datos personales. Para ejercer estos derechos, contactanos en privacidad@blis-corp.com.
        </p>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">6. Seguridad de la informacion</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Aplicamos medidas tecnicas y organizativas como conexion SSL, encriptacion de datos en reposo y en transito, y control de accesos para proteger tu informacion.
        </p>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-5 space-y-3 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">7. Contacto</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Si tienes preguntas sobre esta politica, escribenos a privacidad@blis-corp.com.
        </p>
      </section>
    </main>
  );
}
