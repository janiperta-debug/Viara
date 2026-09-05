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

const MAAPALLON_SADE_METREINA = 6_371_000;

function pistePolygonissa(
  lat: number,
  lng: number,
  polygon: number[][][]
): boolean {
  const ulkorengas = polygon[0];
  if (!ulkorengas || ulkorengas.length < 3) return false;

  function pisteRenkaassa(ring: number[][]): boolean {
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

      if (leikkaa) sisalla = !sisalla;
    }

    return sisalla;
  }

  if (!pisteRenkaassa(ulkorengas)) return false;

  for (const reika of polygon.slice(1)) {
    if (pisteRenkaassa(reika)) return false;
  }

  return true;
}

function etaisyysPisteestaJanaanMetreina(
  lat: number,
  lng: number,
  alku: number[],
  loppu: number[]
): number {
  const lat0 = (lat * Math.PI) / 180;
  const mittakaavaX = Math.cos(lat0) * MAAPALLON_SADE_METREINA;
  const mittakaavaY = MAAPALLON_SADE_METREINA;

  const x1 = ((alku[0] - lng) * Math.PI) / 180 * mittakaavaX;
  const y1 = ((alku[1] - lat) * Math.PI) / 180 * mittakaavaY;
  const x2 = ((loppu[0] - lng) * Math.PI) / 180 * mittakaavaX;
  const y2 = ((loppu[1] - lat) * Math.PI) / 180 * mittakaavaY;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const pituusNelio = dx * dx + dy * dy;

  if (pituusNelio === 0) return Math.hypot(x1, y1);

  const t = Math.max(0, Math.min(1, -(x1 * dx + y1 * dy) / pituusNelio));
  return Math.hypot(x1 + t * dx, y1 + t * dy);
}

function etaisyysPolygoninRajastaMetreina(
  lat: number,
  lng: number,
  polygon: number[][][]
): number {
  let pienin = Number.POSITIVE_INFINITY;

  for (const ring of polygon) {
    if (ring.length < 2) continue;
    for (let i = 0; i < ring.length - 1; i += 1) {
      pienin = Math.min(
        pienin,
        etaisyysPisteestaJanaanMetreina(lat, lng, ring[i], ring[i + 1])
      );
    }
  }

  return pienin;
}

function pisteGeoJSONissa(
  lat: number,
  lng: number,
  geojson: GeoJSONPolygon | GeoJSONMultiPolygon,
  lasnaoloalueMetrit: number
): boolean {
  const toleranssi = Math.abs(lasnaoloalueMetrit);

  if (geojson.type === "Polygon") {
    const sisalla = pistePolygonissa(lat, lng, geojson.coordinates);
    const etaisyys = etaisyysPolygoninRajastaMetreina(lat, lng, geojson.coordinates);

    if (lasnaoloalueMetrit >= 0) return sisalla || etaisyys <= toleranssi;
    return sisalla && etaisyys >= toleranssi;
  }

  const sisallaPolygonissa = geojson.coordinates.find((polygon) =>
    pistePolygonissa(lat, lng, polygon)
  );

  if (lasnaoloalueMetrit >= 0) {
    if (sisallaPolygonissa) return true;
    return geojson.coordinates.some(
      (polygon) => etaisyysPolygoninRajastaMetreina(lat, lng, polygon) <= toleranssi
    );
  }

  if (!sisallaPolygonissa) return false;
  return etaisyysPolygoninRajastaMetreina(lat, lng, sisallaPolygonissa) >= toleranssi;
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
    .select("id, nimi, raja_geojson, lasnaoloalue_metrit");

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
        alue.raja_geojson,
        alue.lasnaoloalue_metrit ?? 0
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
