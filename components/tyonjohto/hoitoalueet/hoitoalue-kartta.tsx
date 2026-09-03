"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { HoitoalueRivi } from "./hoitoalueet-nakyma";

function pinIcon(L: typeof import("leaflet"), valittu: boolean) {
  const koko = valittu ? 30 : 22;
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${koko}px;height:${koko}px;border-radius:9999px;background:#0e7c86;border:3px solid #fff;box-shadow:0 2px 6px rgba(27,42,71,0.45);${valittu ? "outline:3px solid rgba(14,124,134,0.4);" : ""}"></span>`,
    iconSize: [koko, koko],
    iconAnchor: [koko / 2, koko / 2],
  });
}

export function HoitoalueKartta({ alueet, valittuId, onValitse }: {
  alueet: HoitoalueRivi[];
  valittuId: string | null;
  onValitse: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const onValitseRef = useRef(onValitse);

  useEffect(() => { onValitseRef.current = onValitse; }, [onValitse]);

  useEffect(() => {
    let peruttu = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (peruttu || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const withLocation = alueet.filter((a) => a.lat !== null && a.lng !== null);
      const first = withLocation[0];
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(first ? [first.lat!, first.lng!] : [60.6305, 24.861], 13);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      withLocation.forEach((a) => {
        const marker = L.marker([a.lat!, a.lng!], { icon: pinIcon(L, a.id === valittuId), title: a.nimi })
          .addTo(map)
          .on("click", () => onValitseRef.current(a.id));
        markersRef.current[a.id] = marker;
      });
    })();
    return () => {
      peruttu = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    alueet.forEach((a) => {
      const marker = markersRef.current[a.id];
      if (marker) marker.setIcon(pinIcon(L, a.id === valittuId));
    });
    if (valittuId) {
      const valittu = alueet.find((a) => a.id === valittuId);
      if (valittu?.lat !== null && valittu?.lat !== undefined && valittu.lng !== null && valittu.lng !== undefined) {
        map.panTo([valittu.lat, valittu.lng], { animate: true });
      }
    }
  }, [valittuId, alueet]);

  const hasMarkers = alueet.some((a) => a.lat !== null && a.lng !== null);
  return (
    <div className="relative h-full min-h-[420px] w-full rounded-2xl">
      <div ref={containerRef} className="h-full min-h-[420px] w-full rounded-2xl" role="application" aria-label="Hoitoalueiden kartta" />
      {!hasMarkers && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="rounded-xl border border-border bg-white/90 px-4 py-3 text-center text-sm text-muted shadow-sm">Yhdelläkään hoitoalueella ei ole vielä karttasijaintia.</div></div>}
    </div>
  );
}
