"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, GeoJSON as LeafletGeoJSON } from "leaflet";

type GeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: unknown;
};

type Props = {
  geometry: GeoJsonGeometry;
};

export function MmlHoitoalueEsikatselu({ geometry }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LeafletGeoJSON | null>(null);

  useEffect(() => {
    let peruttu = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (peruttu || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      map.setView([60.6305, 24.861], 13);
    })();

    return () => {
      peruttu = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;
      layerRef.current?.remove();
      const layer = L.geoJSON(geometry as never, {
        style: { color: "#0e7c86", weight: 3, fillOpacity: 0.18 },
      }).addTo(map);
      layerRef.current = layer;
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.12));
    })();

    return () => {
      cancelled = true;
    };
  }, [geometry]);

  return (
    <div className="h-[320px] w-full overflow-hidden rounded-xl border border-border">
      <div ref={containerRef} className="h-full w-full" role="application" aria-label="Maanmittauslaitoksen kiinteistörajan esikatselu" />
    </div>
  );
}
