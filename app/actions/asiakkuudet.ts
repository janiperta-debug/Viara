"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { haeOmaKayttajaRooliTiukasti } from "@/lib/oma-kayttaja";

type HallintaTulos =
  | { ok: true; asiakkuusId: string }
  | { ok: false; virhe: string };

async function haeOmaOrganisaatio(): Promise<
  | { ok: true; organisaatioId: string }
  | { ok: false; virhe: string }
> {
  const rooliTulos = await haeOmaKayttajaRooliTiukasti();
  if (rooliTulos.tila !== "ok") {
    return { ok: false, virhe: "Kirjautuminen ei ole voimassa." };
  }

  if (rooliTulos.rooli !== "tyonjohto") {
    return { ok: false, virhe: "Vain organisaation työnjohto voi hallita asiakkuuksia." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();

  if (error || !data || typeof data !== "object") {
    return { ok: false, virhe: "Oman käyttäjän tietoja ei voitu lukea." };
  }

  const kayttaja = data as Record<string, unknown>;
  if (typeof kayttaja.organisaatio_id !== "string") {
    return { ok: false, virhe: "Käyttäjällä ei ole organisaatiota." };
  }

  return { ok: true, organisaatioId: kayttaja.organisaatio_id };
}

function validoiNimi(nimi: string): string | null {
  const value = nimi.trim();
  if (!value || value.length > 200) return null;
  return value;
}

export async function luoAsiakkuus(nimi: string): Promise<HallintaTulos> {
  const hallinta = await haeOmaOrganisaatio();
  if (!hallinta.ok) return hallinta;

  const validoituNimi = validoiNimi(nimi);
  if (!validoituNimi) return { ok: false, virhe: "Asiakkuuden nimi ei kelpaa." };

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("asiakkuudet")
    .insert({ organisaatio_id: hallinta.organisaatioId, nimi: validoituNimi })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, virhe: "Asiakkuuden luonti epäonnistui." };
  }

  return { ok: true, asiakkuusId: data.id };
}

export async function paivitaAsiakkuus(
  asiakkuusId: string,
  nimi: string
): Promise<HallintaTulos> {
  const hallinta = await haeOmaOrganisaatio();
  if (!hallinta.ok) return hallinta;
  if (!asiakkuusId) return { ok: false, virhe: "Asiakkuutta ei tunnistettu." };

  const validoituNimi = validoiNimi(nimi);
  if (!validoituNimi) return { ok: false, virhe: "Asiakkuuden nimi ei kelpaa." };

  const admin = createSupabaseAdminClient();
  const { data: kohde, error: hakuError } = await admin
    .from("asiakkuudet")
    .select("id")
    .eq("id", asiakkuusId)
    .eq("organisaatio_id", hallinta.organisaatioId)
    .maybeSingle();

  if (hakuError || !kohde) {
    return { ok: false, virhe: "Asiakkuutta ei löytynyt omasta organisaatiosta." };
  }

  const { error } = await admin
    .from("asiakkuudet")
    .update({ nimi: validoituNimi })
    .eq("id", asiakkuusId)
    .eq("organisaatio_id", hallinta.organisaatioId);

  if (error) return { ok: false, virhe: "Asiakkuuden päivittäminen epäonnistui." };
  return { ok: true, asiakkuusId };
}
