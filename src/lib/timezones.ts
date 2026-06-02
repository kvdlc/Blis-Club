export interface TimezoneOption {
  value: string;
  label: string;
  city: string;
  country: string;
  flag: string;
  offset: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { value: "America/Lima", label: "Lima, Perú", city: "Lima", country: "Perú", flag: "🇵🇪", offset: "GMT-5" },
  { value: "America/Bogota", label: "Bogotá, Colombia", city: "Bogotá", country: "Colombia", flag: "🇨🇴", offset: "GMT-5" },
  { value: "America/Mexico_City", label: "Ciudad de México, México", city: "CDMX", country: "México", flag: "🇲🇽", offset: "GMT-6" },
  { value: "America/Guayaquil", label: "Guayaquil, Ecuador", city: "Guayaquil", country: "Ecuador", flag: "🇪🇨", offset: "GMT-5" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires, Argentina", city: "Buenos Aires", country: "Argentina", flag: "🇦🇷", offset: "GMT-3" },
  { value: "America/Santiago", label: "Santiago, Chile", city: "Santiago", country: "Chile", flag: "🇨🇱", offset: "GMT-4" },
  { value: "America/Caracas", label: "Caracas, Venezuela", city: "Caracas", country: "Venezuela", flag: "🇻🇪", offset: "GMT-4" },
  { value: "America/Montevideo", label: "Montevideo, Uruguay", city: "Montevideo", country: "Uruguay", flag: "🇺🇾", offset: "GMT-3" },
  { value: "America/La_Paz", label: "La Paz, Bolivia", city: "La Paz", country: "Bolivia", flag: "🇧🇴", offset: "GMT-4" },
  { value: "America/Costa_Rica", label: "San José, Costa Rica", city: "San José", country: "Costa Rica", flag: "🇨🇷", offset: "GMT-6" },
  { value: "America/Panama", label: "Panamá, Panamá", city: "Panamá", country: "Panamá", flag: "🇵🇦", offset: "GMT-5" },
  { value: "America/Guatemala", label: "Guatemala, Guatemala", city: "Guatemala", country: "Guatemala", flag: "🇬🇹", offset: "GMT-6" },
  { value: "America/El_Salvador", label: "San Salvador, El Salvador", city: "San Salvador", country: "El Salvador", flag: "🇸🇻", offset: "GMT-6" },
  { value: "America/Tegucigalpa", label: "Tegucigalpa, Honduras", city: "Tegucigalpa", country: "Honduras", flag: "🇭🇳", offset: "GMT-6" },
  { value: "America/Managua", label: "Managua, Nicaragua", city: "Managua", country: "Nicaragua", flag: "🇳🇮", offset: "GMT-6" },
  { value: "America/Santo_Domingo", label: "Santo Domingo, RD", city: "Santo Domingo", country: "Rep. Dominicana", flag: "🇩🇴", offset: "GMT-4" },
  { value: "America/Havana", label: "La Habana, Cuba", city: "La Habana", country: "Cuba", flag: "🇨🇺", offset: "GMT-5" },
  { value: "America/Asuncion", label: "Asunción, Paraguay", city: "Asunción", country: "Paraguay", flag: "🇵🇾", offset: "GMT-4" },
  { value: "Europe/Madrid", label: "Madrid, España", city: "Madrid", country: "España", flag: "🇪🇸", offset: "GMT+2" },
  { value: "Europe/Paris", label: "París, Francia", city: "París", country: "Francia", flag: "🇫🇷", offset: "GMT+2" },
  { value: "America/New_York", label: "Nueva York, EE.UU.", city: "Nueva York", country: "EE.UU.", flag: "🇺🇸", offset: "GMT-5" },
  { value: "America/Los_Angeles", label: "Los Ángeles, EE.UU.", city: "Los Ángeles", country: "EE.UU.", flag: "🇺🇸", offset: "GMT-8" },
  { value: "America/Chicago", label: "Chicago, EE.UU.", city: "Chicago", country: "EE.UU.", flag: "🇺🇸", offset: "GMT-6" },
  { value: "America/Denver", label: "Denver, EE.UU.", city: "Denver", country: "EE.UU.", flag: "🇺🇸", offset: "GMT-7" },
  { value: "America/Sao_Paulo", label: "São Paulo, Brasil", city: "São Paulo", country: "Brasil", flag: "🇧🇷", offset: "GMT-3" },
  { value: "America/Manaus", label: "Manaus, Brasil", city: "Manaus", country: "Brasil", flag: "🇧🇷", offset: "GMT-4" },
  { value: "America/Toronto", label: "Toronto, Canadá", city: "Toronto", country: "Canadá", flag: "🇨🇦", offset: "GMT-5" },
  { value: "America/Vancouver", label: "Vancouver, Canadá", city: "Vancouver", country: "Canadá", flag: "🇨🇦", offset: "GMT-8" },
  { value: "Asia/Tokyo", label: "Tokio, Japón", city: "Tokio", country: "Japón", flag: "🇯🇵", offset: "GMT+9" },
  { value: "Australia/Sydney", label: "Sídney, Australia", city: "Sídney", country: "Australia", flag: "🇦🇺", offset: "GMT+10" },
];
