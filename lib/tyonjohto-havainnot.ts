import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { muotoileViaraAika } from "@/lib/viara-aika";

export type TyonjohtoHavaintoTila = "avoin" | "tyon_alla" | "valmis" | "suljettu";
export type TyonjohtoHavaintoTyyppi = "liukkaus" | "auraus" | "hiekoitus" | "vaurio" | "muu";

export type TyonjohtoHavainto = {
  id: string;
  hoitoalueId: string;
  hoitoalueNimi: string;
  hoitoalueOsoite: string | null;
  tyyppi: TyonjohtoHavaintoTyyppi;
  otsikko: string;
  kuvaus: string;
  aika: string;
  aikaleima: string;
  tila: TyonjohtoHavaintoTila;
  tekija: string;
  tekijaRooli: string;
  vastuuhenkilo: string | null;
};

type Kayttaja = { nimi: string; rooli: string };

function tyyppiNormalisoi(tyyppi: string): TyonjohtoHavaintoTyyppi {
  if (tyyppi === "liukkaus") return "liukkaus";
  if (tyyppi === "auraus") return "auraus";
  if (tyyppi === "hiekoitus") return "hiekoitus";
  if (tyyppi === "vaurio") return "vaurio";
  return "muu";
}

function tyyppiOtsikko(tyyppi: TyonjohtoHavaintoTyyppi) {
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

function kuvausMuotoile(sijainti: string | null, lisatiedot: unknown) {
  if (typeof lisatiedot === "string" && lisatiedot.trim()) return lisatiedot.trim();
  if (sijainti?.trim()) return sijainti.trim();
  if (lisatiedot && typeof lisatiedot === "object") {
    const teksti = JSON.stringify(lisatiedot);
    return teksti === "{}" ? "" : teksti;
  }
  return "";
}

export async function haeOmaOrganisaatioId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  if (!data || typeof data !== "object") return null;
  const kayttaja = data as Record<string, unknown>;
  return typeof kayttaja.organisaatio_id === "string" ? kayttaja.organisaatio_id : null;
}

export async function haeTyonjohtoHavainnot(
  organisaatioId: string,
): Promise<TyonjohtoHavainto[]> {
  const admin = createSupabaseAdminClient();
  const { data: alueet, error: alueError } = await admin
    .from("hoitoalueet")
    .select("id, nimi, osoite, asiakkuudet!inner(organisaatio_id)")
    .eq("asiakkuudet.organisaatio_id", organisaatioId);

  if (alueError || !alueet || alueet.length === 0) return [];

  const alueIds = alueet.map((alue) => alue.id);
  const alueMap = new Map(alueet.map((alue) => [alue.id, { nimi: alue.nimi, osoite: alue.osoite }]));

  const { data: havainnot, error: havaintoError } = await admin
    .from("havainnot")
    .select("id, hoitoalue_id, tyyppi, luoja_id, tila, vastuuhenkilo_id, sijainti_kuvaus, lisatiedot, luotu")
    .in("hoitoalue_id", alueIds)
    .order("luotu", { ascending: false });

  if (havaintoError || !havainnot) return [];

  const kayttajaIds = Array.from(
    new Set(
      havainnot
        .flatMap((havainto) => [havainto.luoja_id, havainto.vastuuhenkilo_id])
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const kayttajaMap = new Map<string, Kayttaja>();
  if (kayttajaIds.length > 0) {
    const { data: kayttajat } = await admin
      .from("kayttajat")
      .select("id, nimi, rooli")
      .in("id", kayttajaIds)
      .eq("organisaatio_id", organisaatioId);

    for (const kayttaja of kayttajat ?? []) {
      kayttajaMap.set(kayttaja.id, { nimi: kayttaja.nimi, rooli: kayttaja.rooli });
    }
  }

  return havainnot.flatMap((havainto) => {
    const alue = alueMap.get(havainto.hoitoalue_id);
    if (!alue) return [];

    const tyyppi = tyyppiNormalisoi(havainto.tyyppi);
    const tila = havainto.tila as TyonjohtoHavaintoTila;
    const tekija = havainto.luoja_id ? kayttajaMap.get(havainto.luoja_id) : undefined;
    const vastuuhenkilo = havainto.vastuuhenkilo_id
      ? kayttajaMap.get(havainto.vastuuhenkilo_id)?.nimi ?? null
      : null;

    return [{
      id: havainto.id,
      hoitoalueId: havainto.hoitoalue_id,
      hoitoalueNimi: alue.nimi,
      hoitoalueOsoite: alue.osoite,
      tyyppi,
      otsikko: tyyppiOtsikko(tyyppi),
      kuvaus: kuvausMuotoile(havainto.sijainti_kuvaus, havainto.lisatiedot),
      aika: muotoileViaraAika(havainto.luotu),
      aikaleima: havainto.luotu,
      tila,
      tekija: tekija?.nimi ?? "Tuntematon käyttäjä",
      tekijaRooli: rooliLabel(tekija?.rooli),
      vastuuhenkilo,
    }];
  });
}
