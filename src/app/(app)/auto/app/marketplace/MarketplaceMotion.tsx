"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion, useScroll, useTransform, type Variants,
} from "framer-motion";

/* ═══════════ Variantes compartidas ═══════════ */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 14 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 160, damping: 18 } },
};

/* ═══════════ Reveal (fade + slide al entrar en viewport) ═══════════ */
export function Reveal({
  children, className, delay = 0, y = 22,
}: {
  children: React.ReactNode; className?: string; delay?: number; y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════ Stagger (padre) ═══════════ */
export function Stagger({
  children, className, stagger = 0.07,
}: {
  children: React.ReactNode; className?: string; stagger?: number;
}) {
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
  };
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════ Item de stagger (hijo) ═══════════ */
export function StaggerItem({
  children, className, as = "div",
}: {
  children: React.ReactNode; className?: string; as?: "div" | "li";
}) {
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp variants={fadeUp} className={className}>
      {children}
    </Comp>
  );
}

/* ═══════════ Contador animado con flip ═══════════ */
export function FlipDigit({ value, label }: { value: number; label: string }) {
  const pad = String(value).padStart(2, "0");
  return (
    <div className="text-center">
      <div className="relative w-16 py-3 rounded-xl bg-black/40 border border-white/10 overflow-hidden">
        {pad.split("").map((d, i) => (
          <DigitBox key={i} digit={d} />
        ))}
      </div>
      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">{label}</span>
    </div>
  );
}

function DigitBox({ digit }: { digit: string }) {
  const prev = useRef(digit);
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (prev.current !== digit) {
      prev.current = digit;
      setFlip(true);
      const t = setTimeout(() => setFlip(false), 300);
      return () => clearTimeout(t);
    }
  }, [digit]);
  return (
    <motion.span
      animate={flip ? { rotateX: [0, 90], opacity: [1, 0.4] } : { rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="inline-block text-3xl font-black tabular-nums text-zinc-50 [transform-style:preserve-3d]"
    >
      {digit}
    </motion.span>
  );
}

/* ═══════════ Tarjeta con tilt 3D sutil ═══════════ */
export function TiltCard({
  children, className, intensity = 5,
}: {
  children: React.ReactNode; className?: string; intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * intensity, ry: px * intensity });
  };
  const reset = () => setT({ rx: 0, ry: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      animate={{ rotateX: t.rx, rotateY: t.ry }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      style={{ transformStyle: "preserve-3d", perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════ Orbe de luz flotante (parallax decorativo) ═══════════ */
export function GlowOrb({
  className, size = 200, float = 1, delay = 0,
}: {
  className?: string; size?: number; float?: number; delay?: number;
}) {
  return (
    <motion.div
      aria-hidden
      animate={{ y: [0, -18 * float, 0] }}
      transition={{ duration: 5 + float * 2, repeat: Infinity, ease: "easeInOut", delay }}
      className={`pointer-events-none absolute rounded-full blur-3xl ${className || ""}`}
      style={{ width: size, height: size }}
    />
  );
}

/* ═══════════ Capa con parallax al hacer scroll (usa el scroll de página) ═══════════ */
export function ScrollParallax({
  children, from = -24, to = 24, className,
}: {
  children: React.ReactNode; from?: number; to?: number; className?: string;
}) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [from, to]);
  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════ Marquee / cinta infinita ═══════════ */
export function Marquee({
  items, speed = 30, className, reverse = false,
}: {
  items: React.ReactNode[]; speed?: number; className?: string; reverse?: boolean;
}) {
  const row = [...items, ...items, ...items];
  return (
    <div className={`overflow-hidden relative ${className || ""}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#0a0a0c] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#0a0a0c] to-transparent z-10" />
      <motion.div
        animate={{ x: reverse ? ["-33.333%", "0%"] : ["0%", "-33.333%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex w-max"
      >
        {row.map((item, i) => (
          <div key={i} className="flex items-center shrink-0">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
