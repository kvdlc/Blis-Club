"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Car } from "lucide-react";

/** Auto low-poly estilizado con glow (representa el marketplace de autos). */
function Car3D() {
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.35;
    ref.current.position.y = Math.sin(t * 1.2) * 0.04;
  });
  return (
    <group ref={ref}>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh castShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[3.4, 0.55, 1.5]} />
          <meshStandardMaterial color="#1c1c28" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.95, 0.1]}>
          <boxGeometry args={[1.6, 0.5, 1.4]} />
          <meshStandardMaterial color="#26263a" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Luces / ventanas */}
        <mesh position={[1.5, 0.55, 0.45]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[1.5, 0.55, -0.45]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.8} />
        </mesh>
        {/* Ruedas */}
        {[[1.1, 0.3, 0.72], [1.1, 0.3, -0.72], [-1.1, 0.3, 0.72], [-1.1, 0.3, -0.72]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
            <meshStandardMaterial color="#0a0a0c" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

export function MarketplaceHero3D() {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-auto-gradient"
    >
      {/* Glow decorativo aurora */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ x: [0, 20, 0], y: [0, -16, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-auto-500/15 blur-3xl" />
        <motion.div animate={{ x: [0, -24, 0], y: [0, 18, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-32 -right-24 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl" />
        <motion.div animate={{ x: [0, 26, 0], y: [0, -12, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(139,92,246,0.10),transparent_55%)]" />
      </div>

      <div className="relative grid md:grid-cols-2 gap-4 items-center p-6 md:p-10">
        {/* Texto + CTAs */}
        <div className="relative z-10 space-y-3">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 text-[11px] font-bold text-white bg-[linear-gradient(120deg,#10b981,#8b5cf6)] px-3 py-1.5 rounded-full uppercase tracking-wider shadow-glow-auto"
          >
            <Car className="w-3.5 h-3.5" /> Marketplace Blis Club
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-zinc-50 leading-[1.05]"
          >
            Tu próximo auto
            <br />
            <span className="text-auto-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">empieza aquí.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-zinc-400 leading-relaxed max-w-md"
          >
            Compra y vende autos usados con seguridad. Publica tu vehículo, o explora los mejores accesorios y repuestos seleccionados.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2 pt-1"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/auto/app/marketplace/publicar")}
              className="px-5 py-3 rounded-2xl grad-auto text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-glow-auto active:scale-[0.98]"
            >
              Vender mi vehículo
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("autos")?.scrollIntoView({ behavior: "smooth" })}
              className="px-5 py-3 rounded-2xl bg-white/[0.06] border border-violet-500/25 text-zinc-100 font-bold text-sm hover:bg-white/[0.1] transition-colors"
            >
              Explorar autos
            </motion.button>
          </motion.div>
        </div>

        {/* 3D (desktop) / 2D fallback (móvil) */}
        <div className="relative hidden md:block h-64">
          <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.6, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 6, 4]} intensity={1.2} />
            <pointLight position={[-3, 2, -3]} intensity={1.5} color="#a855f7" />
            <Suspense fallback={null}>
              <Car3D />
              <Environment preset="city" />
              <ContactShadows position={[0, -0.1, 0]} opacity={0.5} scale={8} blur={2} />
            </Suspense>
          </Canvas>
        </div>

        {/* Fallback 2D móvil */}
        <div className="md:hidden relative h-36 flex items-center justify-center">
          <div className="w-40 h-24 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Car className="w-16 h-16 text-auto-400" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 bg-auto-500/10 blur-3xl rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
