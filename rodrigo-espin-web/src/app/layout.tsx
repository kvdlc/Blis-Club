import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://www.blis.club/arqui";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blis.club/arqui/"),
  title: {
    default: "Rodrigo Espín | El Arqui te acolita · Alcalde de Latacunga",
    template: "%s | Rodrigo Espín Alcalde",
  },
  description:
    "Rodrigo Espín, arquitecto y emprendedor, candidato a Alcalde de Latacunga. Internet gratis, seguridad, obra pública con sentido y una ciudad que se ve bien. El Arqui te acolita.",
  keywords: [
    "Rodrigo Espín",
    "El Arqui te acolita",
    "Alcalde de Latacunga",
    "Latacunga",
    "Cotopaxi",
    "elecciones Latacunga",
    "internet gratis Latacunga",
    "candidato alcalde",
  ],
  authors: [{ name: "Movimiento Ciudadano El Arqui" }],
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: SITE_URL,
    siteName: "Rodrigo Espín · Alcalde de Latacunga",
    title: "Rodrigo Espín | El Arqui te acolita",
    description:
      "Un arquitecto y emprendedor que construye ciudad con la gente. Conoce las propuestas de Rodrigo Espín para Latacunga.",
    images: [
      {
        url: "https://www.blis.club/arqui/img/hero-latacunga.webp",
        width: 1280,
        height: 720,
        alt: "Latacunga y el volcán Cotopaxi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rodrigo Espín | El Arqui te acolita",
    description:
      "Un arquitecto y emprendedor que construye ciudad con la gente. Alcalde de Latacunga.",
    images: ["https://www.blis.club/arqui/img/hero-latacunga.webp"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.blis.club/arqui" },
};

export const viewport: Viewport = {
  themeColor: "#061a31",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-EC"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-sand font-sans text-ink">
        <a
          href="#inicio"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
