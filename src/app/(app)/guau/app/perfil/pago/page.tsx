import MetodoPagoClient from "./MetodoPagoClient";

export const metadata = {
  title: "Método de Pago",
  description: "Gestiona tus tarjetas y método de pago",
};

export default function PagoPage() {
  return <MetodoPagoClient />;
}