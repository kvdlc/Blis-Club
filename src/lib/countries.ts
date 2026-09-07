"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/* ═══════════════════════ Países (phone/restcountries) ═══════════════════════ */

export interface Country {
  cca2: string;
  name: string;
  flag: string;
  callingCode: string;
}

let cachedCountries: Country[] | null = null;

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>(cachedCountries ?? []);
  const [loading, setLoading] = useState(!cachedCountries);

  useEffect(() => {
    if (cachedCountries) {
      setCountries(cachedCountries);
      setLoading(false);
      return;
    }

    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags,idd")
      .then((res) => res.json())
      .then((data: any[]) => {
        const mapped: Country[] = data
          .filter((c: any) => c.idd?.root)
          .map((c: any) => {
            const callingCode =
              c.idd.root +
              (c.idd.suffixes && c.idd.suffixes.length === 1 ? c.idd.suffixes[0] : "");
            const name =
              c.name?.translations?.spa?.common ||
              c.name?.common ||
              c.cca2;
            return {
              cca2: c.cca2,
              name,
              flag: c.flags?.svg || c.flags?.png || "",
              callingCode: callingCode || "",
            };
          })
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        cachedCountries = mapped;
        setCountries(mapped);
        setLoading(false);
      })
      .catch(() => {
        const fallback: Country[] = [
          { cca2: "PE", name: "Perú", flag: "🇵🇪", callingCode: "+51" },
          { cca2: "MX", name: "México", flag: "🇲🇽", callingCode: "+52" },
          { cca2: "CO", name: "Colombia", flag: "🇨🇴", callingCode: "+57" },
          { cca2: "AR", name: "Argentina", flag: "🇦🇷", callingCode: "+54" },
          { cca2: "CL", name: "Chile", flag: "🇨🇱", callingCode: "+56" },
          { cca2: "EC", name: "Ecuador", flag: "🇪🇨", callingCode: "+593" },
          { cca2: "ES", name: "España", flag: "🇪🇸", callingCode: "+34" },
          { cca2: "VE", name: "Venezuela", flag: "🇻🇪", callingCode: "+58" },
          { cca2: "UY", name: "Uruguay", flag: "🇺🇾", callingCode: "+598" },
          { cca2: "BO", name: "Bolivia", flag: "🇧🇴", callingCode: "+591" },
          { cca2: "CR", name: "Costa Rica", flag: "🇨🇷", callingCode: "+506" },
          { cca2: "PA", name: "Panamá", flag: "🇵🇦", callingCode: "+507" },
          { cca2: "US", name: "Estados Unidos", flag: "🇺🇸", callingCode: "+1" },
          { cca2: "BR", name: "Brasil", flag: "🇧🇷", callingCode: "+55" },
        ];
        cachedCountries = fallback;
        setCountries(fallback);
        setLoading(false);
      });
  }, []);

  return { countries, loading };
}

export function getCountryByCode(countries: Country[], code: string): Country | undefined {
  return countries.find((c) => c.cca2 === code);
}

export function getCountryByCallingCode(countries: Country[], code: string): Country | undefined {
  return countries.find((c) => c.callingCode === code);
}

/* ═══════════════════════ Combustible / moneda por país (Auto) ═══════════════════════ */

export interface FuelTypeOption {
  value: string;
  label: string;
}

export interface CountryConfig {
  code: string;
  nombre: string;
  bandera: string;
  currency: string; // ISO 4217
  fuelUnit: "galon" | "litro";
  fuelUnitShort: string; // "gal" | "L"
  fuelTypes: FuelTypeOption[];
}

/** Registro de países LATAM (mercado objetivo). */
export const COUNTRIES: CountryConfig[] = [
  {
    code: "PE", nombre: "Perú", bandera: "🇵🇪", currency: "PEN",
    fuelUnit: "galon", fuelUnitShort: "gal",
    fuelTypes: [
      { value: "90", label: "90 (Regular)" },
      { value: "95", label: "95 (Premium)" },
      { value: "97", label: "97 (Premium+)" },
      { value: "diesel", label: "Diésel" },
      { value: "glp", label: "GLP" },
      { value: "gnv", label: "GNV" },
    ],
  },
  {
    code: "CO", nombre: "Colombia", bandera: "🇨🇴", currency: "COP",
    fuelUnit: "galon", fuelUnitShort: "gal",
    fuelTypes: [
      { value: "corriente", label: "Corriente" },
      { value: "extra", label: "Extra" },
      { value: "diesel", label: "Diésel" },
    ],
  },
  {
    code: "EC", nombre: "Ecuador", bandera: "🇪🇨", currency: "USD",
    fuelUnit: "galon", fuelUnitShort: "gal",
    fuelTypes: [
      { value: "extra", label: "Extra (85)" },
      { value: "super", label: "Súper (92)" },
      { value: "diesel", label: "Diésel" },
    ],
  },
  {
    code: "MX", nombre: "México", bandera: "🇲🇽", currency: "MXN",
    fuelUnit: "litro", fuelUnitShort: "L",
    fuelTypes: [
      { value: "87", label: "Magna (87)" },
      { value: "91", label: "Premium (91)" },
      { value: "diesel", label: "Diésel" },
    ],
  },
  {
    code: "CL", nombre: "Chile", bandera: "🇨🇱", currency: "CLP",
    fuelUnit: "litro", fuelUnitShort: "L",
    fuelTypes: [
      { value: "93", label: "93 Octanos" },
      { value: "95", label: "95 Octanos" },
      { value: "97", label: "97 Octanos" },
      { value: "diesel", label: "Diésel" },
    ],
  },
  {
    code: "AR", nombre: "Argentina", bandera: "🇦🇷", currency: "ARS",
    fuelUnit: "litro", fuelUnitShort: "L",
    fuelTypes: [
      { value: "95", label: "Súper (95)" },
      { value: "98", label: "Premium (98)" },
      { value: "diesel", label: "Diésel" },
      { value: "gnc", label: "GNC" },
    ],
  },
  {
    code: "BO", nombre: "Bolivia", bandera: "🇧🇴", currency: "BOB",
    fuelUnit: "litro", fuelUnitShort: "L",
    fuelTypes: [
      { value: "85", label: "Especial (85)" },
      { value: "95", label: "Premium (95)" },
      { value: "diesel", label: "Diésel" },
    ],
  },
  {
    code: "PY", nombre: "Paraguay", bandera: "🇵🇾", currency: "PYG",
    fuelUnit: "litro", fuelUnitShort: "L",
    fuelTypes: [
      { value: "93", label: "93 Octanos" },
      { value: "97", label: "97 Octanos" },
      { value: "diesel", label: "Diésel" },
    ],
  },
  {
    code: "UY", nombre: "Uruguay", bandera: "🇺🇾", currency: "UYU",
    fuelUnit: "litro", fuelUnitShort: "L",
    fuelTypes: [
      { value: "95", label: "Súper (95)" },
      { value: "97", label: "Premium (97)" },
      { value: "diesel", label: "Diésel" },
    ],
  },
];

/** Devuelve la config del país (default Perú). */
export function getCountryConfig(code: string | null | undefined): CountryConfig {
  if (!code) return COUNTRIES[0];
  return COUNTRIES.find((c) => c.code === code.toUpperCase()) ?? COUNTRIES[0];
}

/** Obtener el país actual del usuario logueado (client-side). */
export async function getCurrentCountryCode(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("country").eq("id", user.id).single();
    return (data as { country: string | null } | null)?.country ?? null;
  } catch {
    return null;
  }
}
