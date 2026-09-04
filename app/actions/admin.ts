"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { haeOmaKayttajaRooliTiukasti } from "@/lib/oma-kayttaja";

export type AdminOrganisaatio = {
  id: string;
  nimi: string;
  kayttajia: number;
  asiakkuuksia: number;
  hoitoalueita: number;
};

async function varmistaAdmin(): Promise<{ ok: true } | { ok: false; virhe: string }> {
  const tulos = await haeOmaKayttajaRooliTiukasti();
  if (tulos.tila !== "ok" || tulos.rooli !== "admin") {
    return { ok: false, virhe: "Vain Viara-admin voi käyttää ylläpitoa." };
  }
  return { ok: true };
}

export async function paivitaAdminOrganisaatio(
  organisaatioId: string,
  nimi: string
): Promise<{ ok: true } | { ok: false; virhe: string }> {
  const adminTulos = await varmistaAdmin();
  if (!adminTulos.ok) return adminTulos;

  const validoituNimi = nimi.trim();
  if (!organisaatioId) return { ok: false, virhe: "Organisaatiota ei tunnistettu." };
  if (!validoituNimi || validoituNimi.length > 200) {
    return { ok: false, virhe: "Organisaation nimi ei kelpaa." };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("organisaatiot")
    .update({ nimi: validoituNimi })
    .eq("id", organisaatioId);

  if (error) return { ok: false, virhe: "Organisaation päivittäminen epäonnistui." };

  revalidatePath("/admin/kayttajat");
  return { ok: true };
}
