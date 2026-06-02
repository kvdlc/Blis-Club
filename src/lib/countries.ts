"use client";

import { useState, useEffect } from "react";

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
        // Fallback: países LATAM + principales
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
