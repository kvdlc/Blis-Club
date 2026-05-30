import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

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
      <body className="antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
