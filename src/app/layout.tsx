import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`antialiased bg-app-gradient text-zinc-900 dark:text-zinc-100 min-h-screen ${quicksand.variable} ${nunito.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
