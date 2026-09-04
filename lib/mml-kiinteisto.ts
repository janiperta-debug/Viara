const MML_GEOCODING_URL = "https://avoin-paikkatieto.maanmittauslaitos.fi/geocoding/v2/pelias/search";
const MML_KIINTEISTO_URL = "https://avoin-paikkatieto.maanmittauslaitos.fi/kiinteisto-avoin/simple-features/v3/collections/PalstanSijaintitiedot/items";

type GeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: unknown;
};

type MmlFeature = {
  type?: string;
  id?: string | number;
  geometry?: { type?: string; coordinates?: unknown } | null;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
};

type MmlFeatureCollection = {
  type?: string;
  features?: MmlFeature[];
};

type MmlPolygonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: unknown;
};

export type MmlOsoiteKohde = {
  id: string;
  osoite: string;
  kiinteistotunnus: string | null;
  lat: number | null;
  lng: number | null;
};

export type MmlHoitoalueKohde = MmlOsoiteKohde & {
  rajaGeoJson: GeoJsonGeometry | null;
};

function haeApiAvain() {
  const apiKey = process.env.MML_API_KEY;
  if (!apiKey) throw new Error("MML_API_KEY puuttuu ympäristömuuttujista.");
  return apiKey;
}

function propertyString(feature: MmlFeature, ...keys: string[]) {
  const properties = feature.properties ?? {};
  for (const key of keys) {
    const value = properties[key] ?? feature[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function featureLabel(feature: MmlFeature) {
  return propertyString(feature, "label", "address", "name") ?? "Löydetty kohde";
}

function featurePoint(feature: MmlFeature) {
  const geometry = feature.geometry;
  if (!geometry || geometry.type !== "Point" || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
    return { lat: null, lng: null };
  }
  const lng = Number(geometry.coordinates[0]);
  const lat = Number(geometry.coordinates[1]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : { lat: null, lng: null };
}

function normalizeKiinteistotunnus(value: string) {
  const digits = value.replace(/-/g, "").trim();
  return /^\d{14}$/.test(digits) ? digits : value.trim();
}

function isMmlPolygonGeometry(geometry: MmlFeature["geometry"]): geometry is MmlPolygonGeometry {
  return Boolean(
    geometry &&
      (geometry.type === "Polygon" || geometry.type === "MultiPolygon") &&
      Array.isArray(geometry.coordinates)
  );
}

function muodostaRaja(features: MmlFeature[]): GeoJsonGeometry | null {
  const geometries = features.map((feature) => feature.geometry).filter(isMmlPolygonGeometry);

  if (geometries.length === 0) return null;
  if (geometries.length === 1) return geometries[0];

  const coordinates: unknown[] = [];
  for (const geometry of geometries) {
    if (geometry.type === "Polygon") coordinates.push(geometry.coordinates);
    else coordinates.push(...(geometry.coordinates as unknown[]));
  }
  return coordinates.length > 0 ? { type: "MultiPolygon", coordinates } : null;
}

async function mmlFetch(url: URL) {
  const apiKey = haeApiAvain();
  const response = await fetch(url, {
    headers: {
      Accept: "application/geo+json, application/json",
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`MML palautti HTTP ${response.status}.`);
  return (await response.json()) as MmlFeatureCollection;
}

export async function haeMmlOsoitteet(osoite: string): Promise<MmlOsoiteKohde[]> {
  const url = new URL(MML_GEOCODING_URL);
  url.searchParams.set("text", osoite.trim());
  url.searchParams.set("sources", "addresses");
  url.searchParams.set("crs", "CRS84");
  url.searchParams.set("lang", "fi");
  url.searchParams.set("size", "5");
  url.searchParams.set("options", "nowildcard,use_any_codelist_lang_match");

  const data = await mmlFetch(url);
  return (data.features ?? []).map((feature, index) => {
    const point = featurePoint(feature);
    const tunnus = propertyString(feature, "kiinteistotunnus");
    return {
      id: String(feature.id ?? `${index}-${tunnus ?? "kohde"}`),
      osoite: featureLabel(feature),
      kiinteistotunnus: tunnus,
      lat: point.lat,
      lng: point.lng,
    };
  });
}

export async function haeMmlKiinteistotunnuksella(kiinteistotunnus: string): Promise<MmlHoitoalueKohde> {
  const tunnus = kiinteistotunnus.trim();
  const url = new URL(MML_KIINTEISTO_URL);
  url.searchParams.set("kiinteistotunnus", normalizeKiinteistotunnus(tunnus));
  const data = await mmlFetch(url);
  return {
    id: `kiinteisto-${normalizeKiinteistotunnus(tunnus)}`,
    osoite: "",
    kiinteistotunnus: tunnus,
    lat: null,
    lng: null,
    rajaGeoJson: muodostaRaja(data.features ?? []),
  };
}

export async function haeMmlHoitoalueKohteet(osoite: string): Promise<MmlHoitoalueKohde[]> {
  const osoitteet = await haeMmlOsoitteet(osoite);
  const kohteet = osoitteet.filter((kohde) => kohde.kiinteistotunnus);
  return Promise.all(
    kohteet.map(async (kohde) => {
      const raja = await haeMmlKiinteistotunnuksella(kohde.kiinteistotunnus!);
      return { ...kohde, rajaGeoJson: raja.rajaGeoJson };
    })
  );
}
