import { getActiveVehicleToolData } from "@/lib/auto-tool-data";
import FinanciamientoClient from "./FinanciamientoClient";

export default async function FinanciamientoPage() {
  const d = await getActiveVehicleToolData();
  return <FinanciamientoClient defaults={{ precioVehiculo: d.precioVehiculo }} />;
}
