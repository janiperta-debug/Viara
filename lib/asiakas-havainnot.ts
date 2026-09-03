import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AsiakasHavaintoStatus = "avoin" | "tyon_alla" | "valmis" | "suljettu";
export type AsiakasHavaintoTyyppi = "liukkaus" | "auraus" | "hiekoitus" | "vaurio" | "muu";

export type AsiakasHavainto = {
  id: string;
  hoitoalueId: string;
  hoitoalueNimi: string;
  hoitoalueOsoite: string | null;
  tyyppi: AsiakasHavaintoTyyppi;
  otsikko: string;
  kuvaus: string;
  aika: string;
  status: AsiakasHavaintoStatus;
  tekija: string;
  tekijaRooli: string;
};

function tyyppiNormalisoi(tyyppi: string): AsiakasHavaintoTyyppi {
  if (tyyppi === "liukkaus") return "liukkaus";
  if (tyyppi === "auraus") return "auraus";
  if (tyyppi === "hiekoitus") return "hiekoitus";
  if (tyyppi === "vaurio") return "vaurio";
  return "muu";
}

function tyyppiOtsikko(tyyppi: AsiakasHavaintoTyyppi) {
  if (tyyppi === "liukkaus") return "Liukkaus";
  if (tyyppi === "auraus") return "Auraus";
  if (tyyppi === "hiekoitus") return "Hiekoitus";
  if (tyyppi === "vaurio") return "Vaurio";
  return "Muu havainto";
}

function rooliLabel(rooli: string | null | undefined) {
  if (rooli === "kuljettaja") return "Kuljettaja";
  if (rooli === "tyonjohto") return "Työnjohto";
  if (rooli === "asiakas") return "Asiakas";
  if (rooli === "asukas") return "Asukas";
  if (rooli === "admin") return "Ylläpito";
  return "Käyttäjä";
}

function statusNormalisoi(status: string): AsiakasHavaintoStatus | null {
  if (status === "avoin" || status === "tyon_alla" || status === "valmis" || status === "suljettu") return status;
  return null;
}

function kuvausMuotoile(sijainti: string | null, lisatiedot: unknown) {
  if (typeof lisatiedot === "string" && lisatiedot.trim()) return lisatiedot.trim();
  if (sijainti?.trim()) return sijainti.trim();
  if (lisatiedot && typeof lisatiedot === "object") {
    const teksti = JSON.stringify(lisatiedot);
    return teksti === "{}" ? "" : teksti;
  }
  return "";
}

export async function haeAsiakasHavainnot(): Promise<AsiakasHavainto[] | null> {
  const supabase = await createSupabaseServerClient();
  const { data: omaKayttaja, error: kayttajaError } = await supabase
    .rpc("fn_oma_kayttaja")
    .maybeSingle();

  if (kayttajaError || !omaKayttaja || typeof omaKayttaja !== "object") return null;

  const kayttaja = omaKayttaja as Record<string, unknown>;
  const asiakkuusId = typeof kayttaja.asiakkuus_id === "string" ? kayttaja.asiakkuus_id : null;
  const organisaatioId = typeof kayttaja.organisaatio_id === "string" ? kayttaja.organisaatio_id : null;

  if (!asiakkuusId) return [];

  const admin = createSupabaseAdminClient();
  const { data: asiakkuus, error: asiakkuusError } = await admin
    .from("asiakkuudet")
    .select("id, organisaatio_id")
    .eq("id", asiakkuusId)
    .maybeSingle();

  if (asiakkuusError || !asiakkuus) return null;
  if (organisaatioId && asiakkuus.organisaatio_id !== organisaatioId) return null;

  const { data: alueet, error: alueError } = await admin
    .from("hoitoalueet")
    .select("id, nimi, osoite")
    .eq("asiakkuus_id", asiakkuusId);

  if (alueError) return null;

  const alueIds = (alueet ?? []).map((alue) => alue.id);
  if (alueIds.length === 0) return [];

  const alueMap = new Map(
    (alueet ?? []).map((alue) => [alue.id, { nimi: alue.nimi, osoite: alue.osoite }]),
  );

  const { data: havainnot, error: havaintoError } = await admin
    .from("havainnot")
    .select("id, hoitoalue_id, tyyppi, luoja_id, tila, sijainti_kuvaus, lisatiedot, luotu")
    .in("hoitoalue_id", alueIds)
    .order("luotu", { ascending: false });

  if (havaintoError) return null;

  const luojaIds = Array.from(
    new Set((havainnot ?? []).map((havainto) => havainto.luoja_id).filter((id): id is string => Boolean(id))),
  );

  const kayttajaMap = new Map<string, { nimi: string; rooli: string }>();
  if (luojaIds.length > 0) {
    const { data: kayttajat } = await admin
      .from("kayttajat")
      .select("id, nimi, rooli")
      .in("id", luojaIds);

    for (const kayttaja of kayttajat ?? []) {
      kayttajaMap.set(kayttaja.id, { nimi: kayttaja.nimi, rooli: kayttaja.rooli });
    }
  }

  return (havainnot ?? []).flatMap((havainto) => {
    const alue = alueMap.get(havainto.hoitoalue_id);
    const status = statusNormalisoi(havainto.tila);
    if (!alue || !status) return [];

    const tyyppi = tyyppiNormalisoi(havainto.tyyppi);
    const tekija = havainto.luoja_id ? kayttajaMap.get(havainto.luoja_id) : undefined;

    return [{
      id: havainto.id,
      hoitoalueId: havainto.hoitoalue_id,
      hoitoalueNimi: alue.nimi,
      hoitoalueOsoite: alue.osoite,
      tyyppi,
      otsikko: tyyppiOtsikko(tyyppi),
      kuvaus: kuvausMuotoile(havainto.sijainti_kuvaus, havainto.lisatiedot),
      aika: new Date(havainto.luotu).toLocaleString("fi-FI"),
      status,
      tekija: tekija?.nimi ?? "Tuntematon käyttäjä",
      tekijaRooli: rooliLabel(tekija?.rooli),
    }];
  });
}
