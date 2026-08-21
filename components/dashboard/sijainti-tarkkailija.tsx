"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { paivitaSijainti } from "@/app/actions/paivita-sijainti";

export function SijaintiTarkkailija() {
  const router = useRouter();

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

          if (tulos.success && tulos.muutos === true) {
            router.refresh();
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
  }, [router]);

  return null;
}
