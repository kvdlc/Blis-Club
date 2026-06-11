import type { Metadata, Viewport } from "next"
import { Montserrat } from "next/font/google"
import "../globals.css"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import WhatsAppButton from "./components/layout/WhatsAppButton"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Cafecito Inmobiliario | Ambato 2026",
  description:
    "Capacitación presencial en Ambato. Conecta mentes para transformar el futuro inmobiliario. 13 de Agosto 2026.",
  openGraph: {
    title: "Cafecito Inmobiliario | Ambato 2026",
    description:
      "Capacitación presencial en Ambato. 4 ponentes expertos, networking y estrategias prácticas para el sector inmobiliario.",
    type: "website",
    locale: "es_EC",
  },
}

export const viewport: Viewport = {
  themeColor: "#6B4423",
  colorScheme: "only light",
}

export default function CafecitoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body
        className="antialiased bg-cafe-50 text-cafe-900 min-h-screen"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <Navbar />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
