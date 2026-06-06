import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 30, // 30 segundos de stale-while-revalidate para páginas dinámicas
      static: 180, // 3 minutos para páginas estáticas
    },
    optimizePackageImports: [
      "lucide-react",
      "@supabase/supabase-js",
      "@supabase/ssr",
    ],
  },
};

export default nextConfig;
