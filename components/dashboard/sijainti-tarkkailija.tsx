"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { paivitaSijainti } from "@/app/actions/paivita-sijainti";

export function SijaintiTarkkailija() {
  const router = useRouter();
  const refreshRef = useRef<() => void>(() => {});

  useEffect(() => {
    refreshRef.current = () => {
      router.refresh();
    };
  }, [router]);

  useEffect(() => {
    const geolocation = navigator.geolocation;

    if (!geolocation) {
      return;
    }

    const watchId = geolocation.watchPosition(
      async (position) => {
        try {
          if (position.coords.accuracy > 100) {
            return;
          }

          const tulos = await paivitaSijainti({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });

          if (
            tulos.success &&
            "muutos" in tulos &&
            tulos.muutos === true
          ) {
            refreshRef.current();
          }
        } catch {}
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 15000,
      }
    );

    return () => {
      geolocation.clearWatch(watchId);
    };
  }, []);

  return null;
}
