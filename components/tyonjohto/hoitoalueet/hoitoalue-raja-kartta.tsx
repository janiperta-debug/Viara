"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Polygon } from "leaflet";

export type RajaPiste = { lat: number; lng: number };

type Props = {
  pisteet: RajaPiste[];
  onMuuta: (pisteet: RajaPiste[]) => void;
};

export function HoitoalueRajaKartta({ pisteet, onMuuta }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const polygonRef = useRef<Polygon | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const pisteetRef = useRef(pisteet);
  const onMuutaRef = useRef(onMuuta);

  useEffect(() => {
    pisteetRef.current = pisteet;
    onMuutaRef.current = onMuuta;
  }, [pisteet, onMuuta]);

  useEffect(() => {
    let peruttu = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (peruttu || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
      }).setView([60.6305, 24.861], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (event) => {
        const next = [...pisteetRef.current, { lat: event.latlng.lat, lng: event.latlng.lng }];
        onMuutaRef.current(next);
      });

      map.on("dblclick", (event) => {
        L.DomEvent.stopPropagation(event);
        L.DomEvent.preventDefault(event);
        const current = pisteetRef.current;
        if (current.length < 3) return;
        const next = current.slice(0, -1);
        onMuutaRef.current(next);
      });
    })();

    return () => {
      peruttu = true;
      mapRef.current?.remove();
      mapRef.current = null;
      polygonRef.current = null;
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      polygonRef.current?.remove();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const latLngs = pisteet.map((p) => [p.lat, p.lng] as [number, number]);
      if (latLngs.length >= 2) {
        polygonRef.current = L.polygon(latLngs, {
          color: "#0e7c86",
          weight: 3,
          fillOpacity: 0.18,
        }).addTo(map);
      }

      pisteet.forEach((p, index) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 6,
          color: "#ffffff",
          weight: 2,
          fillColor: "#0e7c86",
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip(`Piste ${index + 1}`, { direction: "top" });
        marker.on("click", (event) => {
          L.DomEvent.stopPropagation(event);
          const next = pisteet.filter((_, i) => i !== index);
          onMuutaRef.current(next);
        });
        markersRef.current.push(marker);
      });

      if (pisteet.length > 0 && pisteet.length < 2) {
        map.panTo([pisteet[0].lat, pisteet[0].lng]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pisteet]);

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-xl border border-border">
      <div ref={containerRef} className="h-full w-full" role="application" aria-label="Hoitoalueen rajauskartta" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border bg-white/95 px-3 py-2 text-xs leading-5 text-muted shadow-sm">
        Klikkaa karttaa lisätäksesi rajapisteen. Klikkaa pistettä poistaaksesi sen.
      </div>
    </div>
  );
}
