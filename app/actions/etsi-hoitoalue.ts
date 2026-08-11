"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type Koordinaatit = {
  lat: number;
  lng: number;
};

type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

type GeoJSONMultiPolygon = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};

type Hoitoalue = {
  id: string;
  nimi: string;
  raja_geojson: GeoJSONPolygon | GeoJSONMultiPolygon;
  lasnaoloalue_metrit: number;
};

function pistePolygonissa(
  lat: number,
  lng: number,
  polygon: number[][][]
): boolean {
  const ring = polygon[0];

  if (!ring || ring.length < 3) {
    return false;
  }

  let sisalla = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const lngI = ring[i][0];
    const latI = ring[i][1];
    const lngJ = ring[j][0];
    const latJ = ring[j][1];

    const leikkaa =
      latI > lat !== latJ > lat &&
      lng <
        ((lngJ - lngI) * (lat - latI)) / (latJ - latI) +
          lngI;

    if (leikkaa) {
      sisalla = !sisalla;
    }
  }

  return sisalla;
}

function pisteGeoJSONissa(
  lat: number,
  lng: number,
  geojson: GeoJSONPolygon | GeoJSONMultiPolygon
): boolean {
  if (geojson.type === "Polygon") {
    return pistePolygonissa(lat, lng, geojson.coordinates);
  }

  if (geojson.type === "MultiPolygon") {
    return geojson.coordinates.some((polygon) =>
      pistePolygonissa(lat, lng, polygon)
    );
  }

  return false;
}

export async function etsiHoitoalue({
  lat,
  lng,
}: Koordinaatit) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Käyttäjä ei ole kirjautunut.",
    };
  }

  const { data: hoitoalueet, error } = await supabase
    .from("hoitoalueet")
    .select(
      "id, nimi, raja_geojson, lasnaoloalue_metrit"
    );

  if (error) {
    console.error(
      "Hoitoalueiden hakeminen epäonnistui:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }

  const hoitoalue = (hoitoalueet as Hoitoalue[]).find(
    (alue) =>
      alue.raja_geojson &&
      pisteGeoJSONissa(
        lat,
        lng,
        alue.raja_geojson
      )
  );

  if (!hoitoalue) {
    return {
      success: true,
      hoitoalue: null,
    };
  }

  return {
    success: true,
    hoitoalue: {
      id: hoitoalue.id,
      nimi: hoitoalue.nimi,
    },
  };
}