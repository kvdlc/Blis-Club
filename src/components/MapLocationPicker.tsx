"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Loader2, X } from "lucide-react";
import type * as LeafletNS from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}

/** Selector de ubicación con Leaflet/OSM: clic en el mapa para fijar, botón "mi ubicación". */
export function MapLocationPicker({ lat, lng, onChange, height = 220 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const markerRef = useRef<LeafletNS.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    async function init() {
      const L = (await import("leaflet")).default;
      if (disposed || !containerRef.current) return;

      const center: [number, number] = [lat ?? lng ?? -12.0464, lng ?? lat ?? -77.0428];
      const map = L.map(containerRef.current, { center, zoom: lat != null ? 15 : 12, scrollWheelZoom: false });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map);

      if (lat != null && lng != null) {
        const icon = L.divIcon({ className: "", html: '<div class="map-pin"></div>', iconSize: [30, 42], iconAnchor: [15, 40] });
        markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const p = markerRef.current?.getLatLng();
          if (p) onChange(p.lat, p.lng);
        });
      }

      map.on("click", (e: LeafletNS.LeafletMouseEvent) => {
        onChange(e.latlng.lat, e.latlng.lng);
        if (!mapRef.current) return;
        if (!markerRef.current) {
          const icon = L.divIcon({ className: "", html: '<div class="map-pin"></div>', iconSize: [30, 42], iconAnchor: [15, 40] });
          markerRef.current = L.marker(e.latlng, { icon, draggable: true }).addTo(mapRef.current);
          markerRef.current.on("dragend", () => {
            const p = markerRef.current?.getLatLng();
            if (p) onChange(p.lat, p.lng);
          });
        } else {
          markerRef.current.setLatLng(e.latlng);
        }
      });
    }

    init();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locate = () => {
    if (!("geolocation" in navigator)) { setGeoError("Tu navegador no soporta geolocalización."); return; }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange(latitude, longitude);
        setLocating(false);
        const L = (await import("leaflet")).default;
        const map = mapRef.current;
        if (map) {
          map.setView([latitude, longitude], 16);
          if (!markerRef.current) {
            const icon = L.divIcon({ className: "", html: '<div class="map-pin"></div>', iconSize: [30, 42], iconAnchor: [15, 40] });
            markerRef.current = L.marker([latitude, longitude], { icon, draggable: true }).addTo(map);
            markerRef.current.on("dragend", () => {
              const p = markerRef.current?.getLatLng();
              if (p) onChange(p.lat, p.lng);
            });
          } else {
            markerRef.current.setLatLng([latitude, longitude]);
          }
        }
      },
      (err) => {
        setLocating(false);
        setGeoError(err.code === 1 ? "Permite el acceso a tu ubicación para usar este botón." : "No se pudo obtener tu ubicación.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={locate} disabled={locating}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-auto-600/10 border border-auto-600/20 text-auto-400 text-[10px] font-bold hover:bg-auto-600/20 transition-colors disabled:opacity-50">
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
          {locating ? "Ubicando..." : "Usar mi ubicación"}
        </button>
        {lat != null && lng != null && !isNaN(lat) && (
          <button type="button" onClick={() => { markerRef.current?.remove(); markerRef.current = null; onChange(NaN, NaN); }}
            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <X className="w-3 h-3" /> Quitar
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-800 relative"
        style={{ height, zIndex: 0 }}
      >
        <style>{`
          .map-pin {
            width: 0; height: 0;
            border-left: 9px solid transparent;
            border-right: 9px solid transparent;
            border-bottom: 20px solid #10b981;
            filter: drop-shadow(0 2px 3px rgba(0,0,0,.4));
            position: relative;
          }
          .map-pin::after {
            content: '';
            position: absolute; left: -5px; top: 20px;
            width: 10px; height: 10px; border-radius: 9999px;
            background: #0f9d6e;
          }
        `}</style>
      </div>
      {geoError && <p className="text-[10px] text-red-400">{geoError}</p>}
      {lat != null && lng != null && !isNaN(lat) && (
        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-auto-400" />
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}
