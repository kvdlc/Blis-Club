import { getActiveVehicleToolData } from "@/lib/auto-tool-data";
import DepreciacionClient from "./DepreciacionClient";

export default async function DepreciacionPage() {
  const d = await getActiveVehicleToolData();
  return <DepreciacionClient defaults={{ precioVehiculo: d.precioVehiculo, anios: d.anios }} />;
}
