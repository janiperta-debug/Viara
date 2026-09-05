import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AsiakasAlue = {
  id: string;
  nimi: string;
  osoite: string | null;
  kiinteistotunnus: string | null;
  tila: "valmis" | "tyon_alla" | "aloittamatta";
  edistyma: number;
  viimeisinTapahtuma: string | null;
};

export type AsiakasTiedot = {
  asiakkuusId: string | null;
  asiakkuusNimi: string | null;
  organisaatioId: string | null;
  alueet: AsiakasAlue[];
  avoimetHavainnot: number;
};

export async function haeAsiakasTiedot(): Promise<AsiakasTiedot | null> {
  const supabase = await createSupabaseServerClient();
  const { data: omaKayttaja, error: kayttajaError } = await supabase
    .rpc("fn_oma_kayttaja")
    .maybeSingle();

  if (kayttajaError || !omaKayttaja || typeof omaKayttaja !== "object") {
    return null;
  }

  const kayttaja = omaKayttaja as Record<string, unknown>;
  const organisaatioId =
    typeof kayttaja.organisaatio_id === "string" ? kayttaja.organisaatio_id : null;
  const asiakkuusId =
    typeof kayttaja.asiakkuus_id === "string" ? kayttaja.asiakkuus_id : null;

  if (!asiakkuusId) {
    return {
      asiakkuusId: null,
      asiakkuusNimi: null,
      organisaatioId,
      alueet: [],
      avoimetHavainnot: 0,
    };
  }

  const admin = createSupabaseAdminClient();
  const { data: asiakkuus, error: asiakkuusError } = await admin
    .from("asiakkuudet")
    .select("id, nimi, organisaatio_id")
    .eq("id", asiakkuusId)
    .maybeSingle();

  if (asiakkuusError || !asiakkuus) return null;
  if (organisaatioId && asiakkuus.organisaatio_id !== organisaatioId) return null;

  const { data: alueet, error: alueError } = await admin
    .from("hoitoalueet")
    .select("id, nimi, osoite, kiinteistotunnus")
    .eq("asiakkuus_id", asiakkuusId)
    .order("nimi", { ascending: true });

  if (alueError) return null;

  const ids = (alueet ?? []).map((alue) => alue.id);
  if (ids.length === 0) {
    return {
      asiakkuusId,
      asiakkuusNimi: asiakkuus.nimi,
      organisaatioId: asiakkuus.organisaatio_id,
      alueet: [],
      avoimetHavainnot: 0,
    };
  }

  const { data: tapahtumat } = await admin
    .from("tapahtumat")
    .select("hoitoalue_id, tyyppi, aikaleima")
    .in("hoitoalue_id", ids)
    .in("tyyppi", ["tyo_aloitettu", "tyo_valmis"])
    .order("aikaleima", { ascending: false });

  const { data: havainnot } = await admin
    .from("havainnot")
    .select("tila")
    .in("hoitoalue_id", ids)
    .in("tila", ["avoin", "tyon_alla"]);

  const avoimetHavainnot = havainnot?.length ?? 0;

  const viimeiset = new Map<string, { tyyppi: string; aikaleima: string }>();
  for (const tapahtuma of tapahtumat ?? []) {
    if (!tapahtuma.hoitoalue_id || viimeiset.has(tapahtuma.hoitoalue_id)) continue;
    viimeiset.set(tapahtuma.hoitoalue_id, {
      tyyppi: tapahtuma.tyyppi,
      aikaleima: tapahtuma.aikaleima,
    });
  }

  const alueData: AsiakasAlue[] = (alueet ?? []).map((alue) => {
    const viimeisin = viimeiset.get(alue.id);
    const valmis = viimeisin?.tyyppi === "tyo_valmis";
    const kaynnissa = viimeisin?.tyyppi === "tyo_aloitettu";
    return {
      id: alue.id,
      nimi: alue.nimi,
      osoite: alue.osoite,
      kiinteistotunnus: alue.kiinteistotunnus,
      tila: valmis ? "valmis" : kaynnissa ? "tyon_alla" : "aloittamatta",
      edistyma: valmis ? 100 : kaynnissa ? 50 : 0,
      viimeisinTapahtuma: viimeisin?.aikaleima ?? null,
    };
  });

  return {
    asiakkuusId,
    asiakkuusNimi: asiakkuus.nimi,
    organisaatioId: asiakkuus.organisaatio_id,
    alueet: alueData,
    avoimetHavainnot,
  };
}
