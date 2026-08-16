"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { HOITOALUE_TILAT, type Hoitoalue } from "@/lib/tyonjohto-mock";

// OIKEA maantieteellinen kartta (Leaflet + OpenStreetMap).
// TÄMÄ ON ERI ASIA kuin Yleiskuvan abstrakti tilannekuva.
// HUOM: tämä on mock-vaihe — EI Maanmittauslaitoksen kiinteistödataa.
// Merkit sijoitetaan mock-koordinaateille; polygoni-/kiinteistörajat tulevat
// myöhemmin MML-integraation myötä.

function pinIcon(L: typeof import("leaflet"), vari: string, valittu: boolean) {
  const koko = valittu ? 30 : 22;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:${koko}px;height:${koko}px;border-radius:9999px;
      background:${vari};border:3px solid #fff;
      box-shadow:0 2px 6px rgba(27,42,71,0.45);
      ${valittu ? "outline:3px solid rgba(14,124,134,0.4);" : ""}
    "></span>`,
    iconSize: [koko, koko],
    iconAnchor: [koko / 2, koko / 2],
  });
}

export function HoitoalueKartta({
  alueet,
  valittuId,
  onValitse,
}: {
  alueet: Hoitoalue[];
  valittuId: string | null;
  onValitse: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const LRef = useRef<typeof import("leaflet") | null>(null);
  // Ajantasainen valinta-callback ilman kartan uudelleeninitointia.
  const onValitseRef = useRef(onValitse);
  onValitseRef.current = onValitse;

  // Kartan alustus (kerran).
  useEffect(() => {
    let peruttu = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (peruttu || !containerRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([60.6305, 24.861], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      alueet.forEach((a) => {
        const vari = HOITOALUE_TILAT[a.tila].vari;
        const marker = L.marker([a.lat, a.lng], {
          icon: pinIcon(L, vari, a.id === valittuId),
          title: a.nimi,
        })
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

  // Päivitä merkkien korostus ja keskitä valittuun.
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    alueet.forEach((a) => {
      const marker = markersRef.current[a.id];
      if (!marker) return;
      const vari = HOITOALUE_TILAT[a.tila].vari;
      marker.setIcon(pinIcon(L, vari, a.id === valittuId));
    });

    if (valittuId) {
      const valittu = alueet.find((a) => a.id === valittuId);
      if (valittu) {
        map.panTo([valittu.lat, valittu.lng], { animate: true });
      }
    }
  }, [valittuId, alueet]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[420px] w-full rounded-2xl"
      role="application"
      aria-label="Hoitoalueiden kartta (Hyvinkää)"
    />
  );
}
