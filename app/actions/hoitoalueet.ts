"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { haeOmaKayttajaRooliTiukasti } from "@/lib/oma-kayttaja";

type Tulos =
  | { ok: true; hoitoalueId: string }
  | { ok: false; virhe: string };

async function haeOmaOrganisaatio(): Promise<
  | { ok: true; organisaatioId: string }
  | { ok: false; virhe: string }
> {
  const rooliTulos = await haeOmaKayttajaRooliTiukasti();
  if (rooliTulos.tila !== "ok" || rooliTulos.rooli !== "tyonjohto") {
    return { ok: false, virhe: "Vain organisaation työnjohto voi hallita hoitoalueita." };
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

function validoiTeksti(value: string, max = 200): string | null {
  const result = value.trim();
  return result && result.length <= max ? result : null;
}

export async function luoHoitoalue(input: {
  nimi: string;
  osoite: string;
  kiinteistotunnus: string;
  asiakkuusId: string;
}): Promise<Tulos> {
  const hallinta = await haeOmaOrganisaatio();
  if (!hallinta.ok) return hallinta;

  const nimi = validoiTeksti(input.nimi);
  const osoite = validoiTeksti(input.osoite);
  const kiinteistotunnus = validoiTeksti(input.kiinteistotunnus);
  if (!nimi) return { ok: false, virhe: "Hoitoalueen nimi ei kelpaa." };
  if (!osoite) return { ok: false, virhe: "Osoite ei kelpaa." };
  if (!input.asiakkuusId) return { ok: false, virhe: "Valitse asiakkuus." };

  const admin = createSupabaseAdminClient();
  const { data: asiakkuus, error: asiakkuusError } = await admin
    .from("asiakkuudet")
    .select("id")
    .eq("id", input.asiakkuusId)
    .eq("organisaatio_id", hallinta.organisaatioId)
    .maybeSingle();

  if (asiakkuusError || !asiakkuus) {
    return { ok: false, virhe: "Asiakkuutta ei löytynyt omasta organisaatiosta." };
  }

  const { data, error } = await admin
    .from("hoitoalueet")
    .insert({
      nimi,
      osoite,
      kiinteistotunnus: kiinteistotunnus || null,
      asiakkuus_id: asiakkuus.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, virhe: "Hoitoalueen luonti epäonnistui." };
  }

  return { ok: true, hoitoalueId: data.id };
}

export async function paivitaHoitoalue(
  hoitoalueId: string,
  input: { nimi: string; osoite: string; kiinteistotunnus: string; asiakkuusId: string }
): Promise<Tulos> {
  const hallinta = await haeOmaOrganisaatio();
  if (!hallinta.ok) return hallinta;
  if (!hoitoalueId) return { ok: false, virhe: "Hoitoaluetta ei tunnistettu." };

  const nimi = validoiTeksti(input.nimi);
  const osoite = validoiTeksti(input.osoite);
  const kiinteistotunnus = validoiTeksti(input.kiinteistotunnus);
  if (!nimi) return { ok: false, virhe: "Hoitoalueen nimi ei kelpaa." };
  if (!osoite) return { ok: false, virhe: "Osoite ei kelpaa." };
  if (!input.asiakkuusId) return { ok: false, virhe: "Valitse asiakkuus." };

  const admin = createSupabaseAdminClient();
  const { data: asiakkuus } = await admin
    .from("asiakkuudet")
    .select("id")
    .eq("id", input.asiakkuusId)
    .eq("organisaatio_id", hallinta.organisaatioId)
    .maybeSingle();
  if (!asiakkuus) return { ok: false, virhe: "Asiakkuutta ei löytynyt omasta organisaatiosta." };

  const { data: kohde } = await admin
    .from("hoitoalueet")
    .select("id, asiakkuudet!inner(organisaatio_id)")
    .eq("id", hoitoalueId)
    .eq("asiakkuudet.organisaatio_id", hallinta.organisaatioId)
    .maybeSingle();
  if (!kohde) return { ok: false, virhe: "Hoitoaluetta ei löytynyt omasta organisaatiosta." };

  const { error } = await admin
    .from("hoitoalueet")
    .update({
      nimi,
      osoite,
      kiinteistotunnus: kiinteistotunnus || null,
      asiakkuus_id: asiakkuus.id,
    })
    .eq("id", hoitoalueId);

  if (error) return { ok: false, virhe: "Hoitoalueen päivittäminen epäonnistui." };
  return { ok: true, hoitoalueId };
}
