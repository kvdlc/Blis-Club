import { getActiveVehicleToolData } from "@/lib/auto-tool-data";
import EquivalenciaClient from "./EquivalenciaClient";

export default async function EquivalenciaLlantasPage() {
  const d = await getActiveVehicleToolData();
  return <EquivalenciaClient defaults={{ ancho: d.llantaAncho, perfil: d.llantaPerfil, rin: d.llantaRin }} />;
}
