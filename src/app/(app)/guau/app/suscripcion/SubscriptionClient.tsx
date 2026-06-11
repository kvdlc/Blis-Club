"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Zap, ShieldCheck, Star, ArrowRight, Sparkles, Heart, Clock, CreditCard } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  billing_interval: string;
  features: string[];
}

interface Props {
  plans: Plan[];
}

const ALL_FEATURES = [
  { icon: "🐕", label: "Perros ilimitados", desc: "Registra todos tus perros sin restricciones" },
  { icon: "🍖", label: "150+ recetas", desc: "Recetario completo con menus personalizados" },
  { icon: "⚡", label: "Reto Detox 14 dias", desc: "Transicion de croquetas a BARF guiada" },
  { icon: "🎓", label: "Academia completa", desc: "Todas las etapas de entrenamiento" },
  { icon: "📊", label: "Graficos avanzados", desc: "Analisis de salud, peso y paseos" },
  { icon: "🩺", label: "Soporte prioritario", desc: "Respuesta en menos de 24 horas" },
  { icon: "🔍", label: "Escaner de alimentos", desc: "Verifica si un alimento es seguro" },
  { icon: "🏥", label: "Tracker de salud", desc: "Vacunas, peso, visitas y medicamentos" },
];

const TESTIMONIALS = [
  { name: "Maria G.", text: "Mi perro bajo 3kg en 2 meses con las recetas. Increible app.", stars: 5 },
  { name: "Carlos R.", text: "La academia me ayudo a entrenar a mi pitbull. 100% recomendada.", stars: 5 },
  { name: "Lucia M.", text: "El escaner de alimentos me salvo de darle uvas a mi perrita.", stars: 5 },
];

const FAQS = [
  { q: "¿Puedo cancelar cuando quiera?", a: "Si. Cancelas desde tu perfil y sigues usando Blis hasta el final del periodo pagado. Sin preguntas, sin letra chica." },
  { q: "¿Que pasa si tengo mas de un perro?", a: "Con Blis Pro puedes registrar perros ilimitados. Cada uno con su propio perfil de salud, nutricion y entrenamiento." },
  { q: "¿Las recetas son dificiles de preparar?", a: "No. Te damos ingredientes exactos en gramos, paso a paso, y tiempo de preparacion. Desde principiantes hasta expertos en BARF." },
  { q: "¿Es seguro pagar con tarjeta?", a: "Si. Usamos IziPay, la pasarela mas segura de Peru. Tus datos nunca tocan nuestros servidores." },
];

export function SubscriptionClient({ plans }: Props) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = 2847;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const monthly = plans.find((p) => p.billing_interval === "month");
  const quarterly = plans.find((p) => p.billing_interval === "quarter");
  const annual = plans.find((p) => p.billing_interval === "year");

  const monthlyPrice = monthly ? (monthly.price_cents / 100).toFixed(2) : "9.99";
  const quarterlyPrice = quarterly ? (quarterly.price_cents / 100).toFixed(2) : "1.00";
  const annualPrice = annual ? (annual.price_cents / 100).toFixed(2) : "99.00";
  const savings = quarterly && annual ? ((quarterly.price_cents * 4 - annual.price_cents) / 100).toFixed(0) : "20";

  const activePlanId = quarterly?.id ?? monthly?.id ?? "quarterly";

  return (
    <div className="relative overflow-hidden -mx-4 -mt-3 bg-primary-50" style={{ minHeight: "100dvh" }}>

      {/* Background texture: huesitos, huellitas y perritos con pulso */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { type: "bone", top: "3%", left: "5%", delay: "0s", size: 44, rotate: 15 },
          { type: "paw", top: "8%", left: "28%", delay: "0.4s", size: 40, rotate: -10 },
          { type: "dog-head", top: "5%", left: "55%", delay: "0.8s", size: 52, rotate: 5 },
          { type: "dog-body", top: "12%", left: "82%", delay: "1.2s", size: 42, rotate: -5 },
          { type: "bone", top: "18%", left: "15%", delay: "1.6s", size: 36, rotate: 25 },
          { type: "paw", top: "22%", left: "42%", delay: "2s", size: 48, rotate: 12 },
          { type: "dog-head", top: "16%", left: "72%", delay: "2.4s", size: 38, rotate: -8 },
          { type: "dog-body", top: "28%", left: "8%", delay: "2.8s", size: 46, rotate: 18 },
          { type: "bone", top: "32%", left: "35%", delay: "3.2s", size: 40, rotate: -15 },
          { type: "paw", top: "26%", left: "62%", delay: "0.2s", size: 36, rotate: 8 },
          { type: "dog-head", top: "38%", left: "88%", delay: "0.6s", size: 44, rotate: -12 },
          { type: "dog-body", top: "42%", left: "18%", delay: "1s", size: 50, rotate: 6 },
          { type: "bone", top: "48%", left: "48%", delay: "1.4s", size: 42, rotate: -20 },
          { type: "paw", top: "52%", left: "75%", delay: "1.8s", size: 38, rotate: 15 },
          { type: "dog-head", top: "58%", left: "5%", delay: "2.2s", size: 46, rotate: -6 },
          { type: "dog-body", top: "62%", left: "32%", delay: "2.6s", size: 40, rotate: 10 },
          { type: "bone", top: "68%", left: "58%", delay: "3s", size: 48, rotate: -18 },
          { type: "paw", top: "72%", left: "85%", delay: "0.1s", size: 44, rotate: 22 },
          { type: "dog-head", top: "78%", left: "22%", delay: "0.5s", size: 36, rotate: -15 },
          { type: "dog-body", top: "82%", left: "50%", delay: "0.9s", size: 42, rotate: 8 },
          { type: "bone", top: "88%", left: "70%", delay: "1.3s", size: 40, rotate: -12 },
          { type: "paw", top: "92%", left: "12%", delay: "1.7s", size: 46, rotate: 18 },
          { type: "dog-head", top: "95%", left: "38%", delay: "2.1s", size: 38, rotate: -8 },
          { type: "dog-body", top: "35%", left: "92%", delay: "2.5s", size: 44, rotate: 5 },
          { type: "bone", top: "45%", left: "2%", delay: "2.9s", size: 36, rotate: 25 },
          { type: "paw", top: "15%", left: "95%", delay: "3.3s", size: 40, rotate: -5 },
          { type: "dog-head", top: "65%", left: "45%", delay: "0.3s", size: 50, rotate: 12 },
          { type: "dog-body", top: "85%", left: "78%", delay: "0.7s", size: 36, rotate: -10 },
          { type: "bone", top: "55%", left: "25%", delay: "1.1s", size: 42, rotate: 8 },
          { type: "paw", top: "75%", left: "60%", delay: "1.5s", size: 38, rotate: -18 },
        ].map((item, i) => {
          const icon =
            item.type === "bone" ? (
              <svg viewBox="0 0 64 64" fill="currentColor" className="w-full h-full">
                <path d="m59.68062 19.54655c-2.55522-6.55865-9.77192-6.23484-13.60662-4.75463a.888.888 0 0 1 -.64867-1.65317 17.55409 17.55409 0 0 1 5.3768-.96869c-.70208-2.16851-2.70173-6.89659-7.07435-7.94529-4.17906-1.1676-9.60714 2.604-8.85174 7.14551.62211 4.2125-.02671 7.58968-1.93745 10.0337-2.15074 2.75511-9.73159 10.32709-11.5891 11.58024a13.94224 13.94224 0 0 1 -9.98937 1.9019c-4.54112-.74606-8.31419 4.66788-7.14528 8.85178 1.05747 4.38144 5.79444 6.38109 7.95406 7.08323a17.8057 17.8057 0 0 1 .9598-5.38573.888.888 0 0 1 1.65307.6488 14.97573 14.97573 0 0 0 -.84434 6.02571 8.614 8.614 0 0 0 5.64349 7.59856 7.23224 7.23224 0 0 0 5.80346-.79988 8.11376 8.11376 0 0 0 3.66162-6.96765v-3.17279a10.14762 10.14762 0 0 1 2.995-7.24321l9.47388-9.47388a10.14772 10.14772 0 0 1 7.24321-2.995h3.17279c6.05349.01531 9.10939-5.50306 7.74974-9.50951z" />
              </svg>
            ) : item.type === "paw" ? (
              <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full">
                <path d="m272.142 239.877c25.95 25.945 39.652 62.674 38.573 103.424-.985 39.23-15.626 80.567-41.154 116.39-15.392 21.539-38.62 33.819-63.913 33.819-.422 0-.845 0-1.267-.009-26.513-.422-48.099-14.04-59.173-37.353-9.15-19.356-21.633-36.977-37.024-52.36-15.345-15.368-32.989-27.827-52.322-37.02-23.322-11.061-36.931-32.628-37.353-59.169-.422-25.781 11.919-49.521 33.787-65.142 35.852-25.546 77.146-40.178 116.423-41.187 40.73-1.04 77.473 12.662 103.423 38.607zm-192.161-75.738c7.039 3.942 14.876 5.903 22.994 5.903 7.931 0 16.143-1.854 24.354-5.579 15.298-6.964 28.719-19.822 37.822-36.222 9.15-16.391 12.998-34.603 10.84-51.271-2.346-18.081-11.309-32.299-25.246-40.061-13.937-7.761-30.783-7.869-47.348-.319-15.298 6.96-28.765 19.831-37.869 36.222-9.104 16.386-12.952 34.598-10.793 51.266 2.3 18.081 11.262 32.304 25.246 40.061zm187.703 12.342c4.599-.01 9.432-.46 14.359-1.38 19.897-3.731 39.887-14.819 56.311-31.243 16.377-16.41 27.499-36.41 31.206-56.306 4.083-21.633-.892-40.722-13.937-53.753-12.999-13.031-32.098-17.987-53.73-13.927-19.896 3.721-39.887 14.819-56.311 31.229s-27.499 36.409-31.253 56.311c-4.035 21.628.892 40.718 13.938 53.758 10.089 10.06 23.744 15.311 39.417 15.311zm207.412 184.779c-7.743-13.937-22.008-22.909-40.075-25.241-16.659-2.149-34.866 1.689-51.243 10.802-16.424 9.118-29.282 22.572-36.227 37.869-7.555 16.579-7.461 33.402.329 47.348 7.743 13.942 21.961 22.909 40.027 25.241 3.051.389 6.101.582 9.245.582 13.983 0 28.625-3.923 42.045-11.38 16.377-9.122 29.235-22.571 36.227-37.874 7.555-16.579 7.415-33.397-.328-47.339 0 .002 0 .002 0-.008zm3.097-204.901c-12.999-13.031-32.098-17.977-53.73-13.928-19.896 3.731-39.887 14.819-56.311 31.229-16.424 16.419-27.499 36.419-31.252 56.321-4.036 21.628.892 40.717 13.937 53.749 10.089 10.07 23.744 15.312 39.417 15.312 4.599 0 9.432-.46 14.312-1.38 19.896-3.73 39.934-14.819 56.357-31.229 16.377-16.424 27.499-36.424 31.206-56.32 4.036-21.633-.891-40.713-13.936-53.754z" />
              </svg>
            ) : item.type === "dog-head" ? (
              <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full">
                <path d="m341.6 224.8c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.7-1.4-1.4-1.4z" />
                <path d="m291.7 296.9v-15.4c0-2.5-2.1-4.6-4.6-4.6h-62.2c-2.5 0-4.6 2.1-4.6 4.6v15.4c0 19.7 16 35.7 35.7 35.7 19.7 0 35.7-16 35.7-35.7z" />
                <path d="m170.4 224.8c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.6-1.4-1.4-1.4z" />
                <path d="m136.3 78.1c-75 6.2-108.5 26.4-123.4 43.8-13 15-13.9 30.2-12.3 40.3 6.6 43.5 17.7 104.5 23.7 137 .2 1 .8 1.4 1.3 1.6s1.3.3 2.1-.3c6.8-5.5 11.9-9.1 17.4-13 5.1-3.6 10.4-7.3 17.6-13.1 0-1.7 0-3.4 0-5.2 0-43.5 12.3-95.4 32.2-135.4 11.9-24.2 26-43 41.4-55.7z" />
                <path d="m376.1 78.1c15.3 12.6 29.2 31 41 54.7 19.9 39.7 32.2 92 32.2 136.4v7.1c6.9 5.4 12.1 8.6 17.1 11.7 5.3 3.3 10.8 6.7 17.9 12.4.8.6 1.5.5 2.1.3.5-.2 1.2-.6 1.3-1.6 6-32.5 17.1-93.5 23.7-137 1.5-10.1.6-25.3-12.3-40.3-14.9-17.3-48.3-37.5-123-43.7z" />
                <path d="m326.1 76.1h-70.1-70.1c-37.3 0-63.2 41-75.4 65.4-18.7 37.8-30.4 86.7-30.4 127.6 0 103.3 8.5 166.7 175.8 166.7s175.8-63.3 175.8-166.7c0-41.8-11.6-91.1-30.4-128.5-11.9-24-37.7-64.5-75.2-64.5zm-174.7 150.1c0-10.5 8.5-19 19-19s19 8.5 19 19-8.5 19-19 19c-10.4 0-19-8.5-19-19zm168.5 159.3c-31.4 0-51.6-9.7-63.9-19.2-12.3 9.5-32.5 19.2-63.9 19.2-4.9 0-8.8-3.9-8.8-8.8s3.9-8.8 8.8-8.8c25.2 0 41.4-7.1 51.3-14.1-2.3-3-3.4-5.1-3.6-5.4-.1-.2-.2-.5-.3-.7-21.3-7-36.8-27.1-36.8-50.7v-15.4c0-12.2 10-22.2 22.2-22.2h62.2c12.2 0 22.2 10 22.2 22.2v15.4c0 23.6-15.5 43.7-36.8 50.7-.1.2-.2.5-.3.7-.2.3-1.3 2.4-3.6 5.4 9.9 7 26 14.1 51.3 14.1 4.9 0 8.8 3.9 8.8 8.8-.1 4.8-4 8.8-8.8 8.8zm21.7-140.3c-10.5 0-19-8.5-19-19s8.5-19 19-19 19 8.5 19 19-8.6 19-19 19z" />
              </svg>
            ) : (
              <svg viewBox="0 0 64 64" fill="currentColor" className="w-full h-full">
                <path d="m17.61 50.9a1.689 1.689 0 0 0 .34-.1l-.65-4.77a5.154 5.154 0 0 0 -1.58-2.97 10.367 10.367 0 0 1 -1.8-2.31 47.485 47.485 0 0 1 -.52 8.95c-.21 1.4-1.97 1.3-2.13 1.29a2.5 2.5 0 0 0 .26 4.98h3.91a2.992 2.992 0 0 1 -.8-2.13 3.038 3.038 0 0 1 2.97-2.94z" />
                <path d="m53.57 51.32-.14-1.96a1.688 1.688 0 0 0 -1-1.41c-2.23-1.03-5.2-2.85-6.76-5.7a4.471 4.471 0 0 0 -3.91-2.29c.98 2.3 3.47 6.94 8.22 8.95a.623.623 0 0 1 .23.55v1.76a.781.781 0 0 1 -.78.78h-.67a1.985 1.985 0 0 0 0 3.97h2.93a2.808 2.808 0 0 1 -.68-1.83 2.842 2.842 0 0 1 2.56-2.82z" />
                <path d="m62.476 32.259c-.8-2.476-2.046-4.147-3.7-4.964a5.343 5.343 0 0 0 -3.508-.418 11.331 11.331 0 0 0 -12.806-4.7c-5.39 1.5-14.18.27-15.16-.68a13.318 13.318 0 0 1 -4.26-7.3c-.525-3.324-3.747-6.423-6.77-6.16-2.26.1-4.14 1.18-6.69 3.84-1.55 1.61-4.5 2.42-6.13 2.76a2.417 2.417 0 0 0 -1.91 2.79 5.429 5.429 0 0 0 3.51 4.49 24.175 24.175 0 0 0 6.55 1.35 52.594 52.594 0 0 1 1.45 6.92c-.29 3.03-.24 8.65 3.37 12.16a6.1 6.1 0 0 1 1.87 3.54l.67 4.9a.862.862 0 0 1 -.19.64 1.939 1.939 0 0 1 -1.09.47 2.033 2.033 0 0 0 -2.04 1.96 2.055 2.055 0 0 0 2.04 2.11h3.11a3.134 3.134 0 0 0 2.97-2.12 18.3 18.3 0 0 0 .74-8.88 3.324 3.324 0 0 1 2.05-3.64c.06-.03 5.68-2.37 15.17-2.37a5.488 5.488 0 0 1 4.83 2.81c1.43 2.62 4.21 4.31 6.29 5.27a2.683 2.683 0 0 1 1.59 2.25l.16 2.21a.762.762 0 0 1 -.75.81 1.83 1.83 0 0 0 0 3.66h2.78a2.657 2.657 0 0 0 2.66-2.65v-6.337a6.874 6.874 0 0 0 -.5-2.65c-1.43-3.42-1.45-10.31-1.45-10.4a13.152 13.152 0 0 0 -1.532-6.13 4.354 4.354 0 0 1 2.544.4c1.4.7 2.466 2.165 3.177 4.366a.5.5 0 0 0 .952-.307zm-49.208-18.348-.513.512a.5.5 0 0 1 -.707-.707l.513-.512a.5.5 0 0 1 .707.707zm9.094 9.628a1.994 1.994 0 0 1 -1.254 1.633c-3.25 1.137-6.46-1.282-5.889-6.141a.5.5 0 1 1 .993.12c-.634 3.231 1.751 6.138 4.481 5.111a1.028 1.028 0 0 0 .673-.806c.191-2.291-2.282-7.268-2.306-7.318a.5.5 0 0 1 .894-.448c.107.215 2.622 5.279 2.408 7.849z" />
              </svg>
            );
          return (
            <span
              key={i}
              className="absolute animate-icon-pulse select-none text-zinc-400"
              style={{
                top: item.top,
                left: item.left,
                width: item.size,
                height: item.size,
                animationDelay: item.delay,
                transform: `rotate(${item.rotate}deg)`,
              }}
            >
              {icon}
            </span>
          );
        })}
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 text-center pt-10 pb-8 px-4">
        {/* Badge con contador - pulso primary */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full px-4 py-1.5 mb-6 animate-fade-in shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
          </span>
          <span className="text-[11px] font-bold text-primary-700 tracking-wide">
            {count.toLocaleString()} dueños de perros ya usan Blis Pro
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 mb-4 leading-tight animate-slide-up">
          Tu perro merece lo
          <span className="block bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(107,99,243,0.3)]">
            mejor
          </span>
        </h1>

        <p className="text-sm text-zinc-500 max-w-md mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Nutricion BARF personalizada, entrenamiento profesional y salud integral. Todo en una sola app.
        </p>

        {/* Social Proof Stars - glow primary/accent */}
        <div className="flex items-center justify-center gap-1 mb-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-warning-400 fill-warning-400 animate-pulse-star" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
          <span className="text-sm font-bold text-zinc-700 ml-2">4.9/5</span>
        </div>
        <p className="text-xs text-zinc-400 animate-slide-up" style={{ animationDelay: "0.25s" }}>
          Basado en 1,200+ resenas de dueños de perros
        </p>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="relative z-10 px-4 pb-8">
        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm font-bold transition-colors ${!isAnnual ? "text-zinc-900" : "text-zinc-400"}`}>
            Trimestral
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-8 rounded-full bg-zinc-200 transition-colors duration-300"
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${ isAnnual ? "translate-x-6" : "translate-x-0" }`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-accent-500" />
            </div>
          </button>
          <span className={`text-sm font-bold transition-colors ${isAnnual ? "text-zinc-900" : "text-zinc-400"}`}>
            Anual
          </span>
          <span className="text-[10px] font-bold bg-secondary-100 text-secondary-600 rounded-full px-2 py-0.5">
            Ahorra ${savings}
          </span>
        </div>

        {/* Cards */}
        <div className="max-w-sm mx-auto space-y-4">
          {/* Quarterly Card */}
          {!isAnnual && (
            <div className="relative group animate-scale-in">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-[1.5rem] blur opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-white rounded-[1.5rem] p-6 border border-zinc-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Oferta especial</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-warning-400 animate-pulse-glow" />
                    <span className="text-[10px] font-bold text-warning-600">Ahorra 80%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-zinc-900 mb-1">Pro Trimestral</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-extrabold text-zinc-900 tracking-tight">${quarterlyPrice}</span>
                  <span className="text-zinc-400 font-medium">/trimestre</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6">Flexibilidad total · Cancela cuando quieras</p>

                <Link
                  href={`/guau/app/checkout?plan=${quarterly?.id ?? monthly?.id ?? "quarterly"}`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-zinc-900 text-white py-3.5 font-bold text-sm transition-all active:scale-[0.98] hover:bg-zinc-800"
                >
                  Suscribirse ahora
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Annual Card - Featured */}
          {isAnnual && (
            <div className="relative group animate-scale-in">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-[1.5rem] blur opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative bg-white rounded-[1.5rem] p-6 border border-zinc-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Más popular</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-warning-400 animate-pulse-glow" />
                    <span className="text-[10px] font-bold text-warning-600">Ahorra ${savings}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-extrabold text-zinc-900 mb-1">Pro Anual</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-extrabold text-zinc-900 tracking-tight">${annualPrice}</span>
                  <span className="text-zinc-400 font-medium">/año</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6">La mejor opción · Cancela cuando quieras</p>

                <Link
                  href={`/guau/app/checkout?plan=${annual?.id ?? "annual"}`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3.5 font-bold text-sm shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] relative overflow-hidden group/btn animate-glow-brand"
                >
                  <Zap className="w-4 h-4" />
                  Suscribirse ahora
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Creative copy */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-zinc-50 rounded-full px-4 py-2">
            <span className="text-lg">🍪</span>
            <p className="text-xs text-zinc-500">
              Menos de lo que cuesta una galleta al dia. Tu perro se lo merece.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section className="relative z-10 px-4 py-8">
        <h2 className="text-xl font-extrabold text-center text-zinc-900 mb-6">
          Todo lo que incluye
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {ALL_FEATURES.map((f, i) => (
            <div
              key={i}
              className="group card-soft rounded-2xl p-4 hover:border-primary-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h4 className="text-xs font-bold text-zinc-800 mb-1">{f.label}</h4>
              <p className="text-[10px] text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="relative z-10 px-4 py-8">
        <h2 className="text-xl font-extrabold text-center text-zinc-900 mb-6">
          Lo que dicen los dueños
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[260px] card-soft rounded-2xl p-5"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.stars)].map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 text-warning-400 fill-warning-400" />
                ))}
              </div>
              <p className="text-sm text-zinc-700 mb-3 leading-relaxed">"{t.text}"</p>
              <p className="text-xs font-bold text-zinc-500">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="relative z-10 px-4 py-8 max-w-lg mx-auto">
        <h2 className="text-xl font-extrabold text-center text-zinc-900 mb-6">
          Preguntas frecuentes
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="card-soft rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-bold text-zinc-800 pr-4">{faq.q}</span>
                <span className={`text-lg text-primary-500 transition-transform duration-300 shrink-0 ${openFaq === i ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="px-4 pb-4 text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 px-4 py-12">
        <div className="max-w-lg mx-auto text-center relative">
          {/* Glow detras - accent brand */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-primary-600/10 blur-2xl" />
          
          <div className="relative rounded-[2rem] p-8 text-white border border-primary-200/50 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6b63f3 0%, #8b5cf6 50%, #a855f7 100%)' }}>
            
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl font-extrabold">¿Que estas esperando?</h2>
              <p className="text-sm text-white/80">
                Miles de perros ya viven mejor gracias a Blis Pro. El tuyo puede ser el siguiente.
              </p>
              <Link
                href={`/guau/app/checkout?plan=${activePlanId}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white py-4 px-8 font-extrabold text-sm shadow-xl transition-all active:scale-[0.98] hover:bg-zinc-50 animate-glow-gold"
                style={{ color: '#6b63f3' }}
              >
                <Heart className="w-4 h-4 fill-current" />
                Suscribirme ahora
              </Link>
              <p className="text-[10px] text-white/60">
                Cancela cuando quieras. Sin compromiso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <section className="relative z-10 px-4 pb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3 h-3 text-primary-500" />
            Pago seguro
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <Clock className="w-3 h-3 text-primary-500" />
            Soporte 24/7
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <CreditCard className="w-3 h-3 text-primary-500" />
            Cancela cuando quieras
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-400">
          <Link href="/legal/terminos" className="hover:text-primary-500 transition-colors">Terminos</Link>
          <span>·</span>
          <Link href="/legal/privacidad" className="hover:text-primary-500 transition-colors">Privacidad</Link>
          <span>·</span>
          <Link href="/legal/reembolsos" className="hover:text-primary-500 transition-colors">Reembolsos</Link>
        </div>
      </section>

      {/* ═══ CUSTOM CSS ═══ */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-star {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(251,191,36,0.4)); }
          50% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.9)); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(251,191,36,0.3)); }
          50% { filter: drop-shadow(0 0 12px rgba(251,191,36,0.8)); }
        }
        @keyframes glow-brand {
          0%, 100% { box-shadow: 0 0 20px rgba(107,99,243,0.3), 0 4px 15px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 0 35px rgba(107,99,243,0.5), 0 0 50px rgba(139,92,246,0.2), 0 4px 15px rgba(0,0,0,0.1); }
        }
        @keyframes glow-gold {
          0%, 100% { box-shadow: 0 0 15px rgba(251,191,36,0.3); }
          50% { box-shadow: 0 0 30px rgba(251,191,36,0.6), 0 0 50px rgba(251,191,36,0.2); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
        .animate-pulse-star {
          animation: pulse-star 2s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-glow-brand {
          animation: glow-brand 3s ease-in-out infinite;
        }
        .animate-glow-gold {
          animation: glow-gold 2.5s ease-in-out infinite;
        }
        @keyframes icon-pulse {
          0%, 100% { opacity: 0.12; transform: scale(0.92); }
          50% { opacity: 0.32; transform: scale(1.12); }
        }
        .animate-icon-pulse {
          animation: icon-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
