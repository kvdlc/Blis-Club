import type { Metadata, Viewport } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-quicksand" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "700", "900"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Blis Club",
  description: "Tu ecosistema de apps para mascotas",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Blis Club", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#5956e9",
  colorScheme: "only light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`antialiased bg-app-gradient text-zinc-900 min-h-screen ${quicksand.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}
