import { HoitoalueetNakyma, type HoitoalueRivi } from "@/components/tyonjohto/hoitoalueet/hoitoalueet-nakyma";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { MmlHoitoalueKohde } from "@/lib/mml-kiinteisto";

type Asiakkuus = { id: string; nimi: string };
type RawHoitoalue = {
  id: string;
  nimi: string;
  osoite: string | null;
  kiinteistotunnus: string | null;
  asiakkuus_id: string | null;
  raja_geojson: unknown;
};

function koordinaatitGeoJsonista(geojson: unknown): { lat: number; lng: number } | null {
  if (!geojson || typeof geojson !== "object") return null;
  const value = geojson as Record<string, unknown>;
  const geometry = value.type === "Feature" && value.geometry && typeof value.geometry === "object"
    ? value.geometry as Record<string, unknown>
    : value;
  const coordinates = geometry.coordinates;
  if (!Array.isArray(coordinates)) return null;

  function ensimmainenPari(node: unknown): [number, number] | null {
    if (Array.isArray(node) && node.length >= 2 && typeof node[0] === "number" && typeof node[1] === "number") {
      return [node[0], node[1]];
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        const pari = ensimmainenPari(child);
        if (pari) return pari;
      }
    }
    return null;
  }

  const pari = ensimmainenPari(coordinates);
  return pari ? { lat: pari[1], lng: pari[0] } : null;
}

export default async function HoitoalueetPage() {
  await vaadiRooli(["admin", "tyonjohto"]);
  const supabase = await createSupabaseServerClient();
  const { data: omaKayttaja } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  const organisaatioId = omaKayttaja && typeof omaKayttaja === "object" && typeof (omaKayttaja as Record<string, unknown>).organisaatio_id === "string"
    ? (omaKayttaja as Record<string, unknown>).organisaatio_id as string
    : null;

  if (!organisaatioId) {
    return <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10"><div className="w-full max-w-3xl rounded-2xl border border-border bg-white p-6"><h1 className="text-xl font-semibold text-foreground">Hoitoalueet</h1><p className="mt-2 text-sm text-muted">Käyttäjälle ei ole määritetty organisaatiota.</p></div></main>;
  }

  const { data: asiakkuudetData } = await supabase
    .from("asiakkuudet")
    .select("id, nimi")
    .eq("organisaatio_id", organisaatioId)
    .order("nimi");
  const asiakkuudet: Asiakkuus[] = (asiakkuudetData ?? []).filter((a): a is Asiakkuus => typeof a.id === "string" && typeof a.nimi === "string");
  const asiakkuusNimet = new Map(asiakkuudet.map((a) => [a.id, a.nimi]));

  const { data: hoitoalueData } = await supabase
    .from("hoitoalueet")
    .select("id, nimi, osoite, kiinteistotunnus, asiakkuus_id, raja_geojson, asiakkuudet!inner(organisaatio_id)")
    .eq("asiakkuudet.organisaatio_id", organisaatioId)
    .order("nimi");

  const hoitoalueet: HoitoalueRivi[] = (hoitoalueData ?? []).flatMap((a) => {
    const row = a as unknown as RawHoitoalue;
    if (!row.asiakkuus_id || !asiakkuusNimet.has(row.asiakkuus_id)) return [];
    const point = koordinaatitGeoJsonista(row.raja_geojson);
    return [{
      id: row.id,
      nimi: row.nimi,
      osoite: row.osoite ?? "Ei osoitetta",
      kiinteistotunnus: row.kiinteistotunnus,
      asiakkuusId: row.asiakkuus_id,
      asiakkuusNimi: asiakkuusNimet.get(row.asiakkuus_id)!,
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
      rajaGeoJson: row.raja_geojson as MmlHoitoalueKohde["rajaGeoJson"],
    }];
  });

  return <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10 lg:px-8 lg:py-16"><div className="w-full max-w-[1500px]"><HoitoalueetNakyma hoitoalueet={hoitoalueet} asiakkuudet={asiakkuudet} /></div></main>;
}
