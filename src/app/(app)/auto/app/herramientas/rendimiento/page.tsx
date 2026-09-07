import { getActiveVehicleToolData } from "@/lib/auto-tool-data";
import RendimientoClient from "./RendimientoClient";

export default async function RendimientoPage() {
  const d = await getActiveVehicleToolData();
  const precios = Object.keys(d.ultimoPrecioPorTipo).length > 0 ? d.ultimoPrecioPorTipo : null;

  return (
    <RendimientoClient
      defaults={{
        octanajeRecomendado: d.octanajeRecomendado,
        capacidadTanque: d.capacidadTanque,
        ultimosPrecios: precios,
        kmAnuales: d.kmAnuales,
      }}
    />
  );
}
