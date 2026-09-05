"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { pisteGeoJSONissa, type HoitoalueGeoJSON } from "@/lib/hoitoalue-geometria";

type Koordinaatit = {
  lat: number;
  lng: number;
};

type Hoitoalue = {
  id: string;
  nimi: string;
  raja_geojson: HoitoalueGeoJSON;
  lasnaoloalue_metrit: number;
};

export async function etsiHoitoalue({ lat, lng }: Koordinaatit) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: "Käyttäjä ei ole kirjautunut." };

  const { data: hoitoalueet, error } = await supabase
    .from("hoitoalueet")
    .select("id, nimi, raja_geojson, lasnaoloalue_metrit");

  if (error) {
    console.error("Hoitoalueiden hakeminen epäonnistui:", error);
    return { success: false, error: error.message };
  }

  const hoitoalue = (hoitoalueet as Hoitoalue[]).find(
    (alue) => alue.raja_geojson && pisteGeoJSONissa(lat, lng, alue.raja_geojson, alue.lasnaoloalue_metrit ?? 0),
  );

  if (!hoitoalue) return { success: true, hoitoalue: null };
  return { success: true, hoitoalue: { id: hoitoalue.id, nimi: hoitoalue.nimi } };
}
