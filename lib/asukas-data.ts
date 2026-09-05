import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { muotoileViaraAika } from "@/lib/viara-aika";
import type { AsiakasHavainto } from "@/lib/asiakas-havainnot";

export type AsukasHoitoalue = {
  id: string;
  nimi: string;
  osoite: string | null;
  tila: "valmis" | "tyon_alla" | "aloittamatta";
  edistyma: number;
  viimeisinTapahtuma: string | null;
  havainnot: AsiakasHavainto[];
};

export async function haeAsukasHoitoalue(
  hoitoalueId: string | null | undefined,
): Promise<AsukasHoitoalue | null> {
  if (!hoitoalueId) return null;

  const admin = createSupabaseAdminClient();
  const { data: alue, error: alueError } = await admin
    .from("hoitoalueet")
    .select("id, nimi, osoite")
    .eq("id", hoitoalueId)
    .maybeSingle();

  if (alueError || !alue) return null;

  const { data: tapahtumat, error: tapahtumaError } = await admin
    .from("tapahtumat")
    .select("hoitoalue_id, tyyppi, aikaleima")
    .eq("hoitoalue_id", alue.id)
    .in("tyyppi", ["tyo_aloitettu", "tyo_valmis"])
    .order("aikaleima", { ascending: false });

  if (tapahtumaError) return null;

  const viimeisin = tapahtumat?.[0] ?? null;
  const tila = viimeisin?.tyyppi === "tyo_valmis"
    ? "valmis"
    : viimeisin?.tyyppi === "tyo_aloitettu"
      ? "tyon_alla"
      : "aloittamatta";
  const edistyma = tila === "valmis" ? 100 : tila === "tyon_alla" ? 50 : 0;

  const { data: havainnot, error: havaintoError } = await admin
    .from("havainnot")
    .select("id, hoitoalue_id, tyyppi, luoja_id, tila, sijainti_kuvaus, lisatiedot, luotu")
    .eq("hoitoalue_id", alue.id)
    .order("luotu", { ascending: false });

  if (havaintoError) return null;

  const havaintoIds = (havainnot ?? []).map((havainto) => havainto.id);
  const tapahtumaMap = new Map<string, { kuittaus: string | null; valmistuminen: string | null; sulkeminen: string | null }>();

  if (havaintoIds.length > 0) {
    const { data: havaintoTapahtumat } = await admin
      .from("tapahtumat")
      .select("havainto_id, tyyppi, aikaleima")
      .in("havainto_id", havaintoIds)
      .in("tyyppi", ["havainto_otettu_tyon_alle", "havainto_valmis", "havainto_suljettu"])
      .order("aikaleima", { ascending: true });

    for (const tapahtuma of havaintoTapahtumat ?? []) {
      if (!tapahtuma.havainto_id) continue;
      const nykyinen = tapahtumaMap.get(tapahtuma.havainto_id) ?? {
        kuittaus: null,
        valmistuminen: null,
        sulkeminen: null,
      };
      if (tapahtuma.tyyppi === "havainto_otettu_tyon_alle" && !nykyinen.kuittaus) nykyinen.kuittaus = tapahtuma.aikaleima;
      if (tapahtuma.tyyppi === "havainto_valmis" && !nykyinen.valmistuminen) nykyinen.valmistuminen = tapahtuma.aikaleima;
      if (tapahtuma.tyyppi === "havainto_suljettu" && !nykyinen.sulkeminen) nykyinen.sulkeminen = tapahtuma.aikaleima;
      tapahtumaMap.set(tapahtuma.havainto_id, nykyinen);
    }
  }

  const luojaIds = Array.from(
    new Set(
      (havainnot ?? [])
        .map((havainto) => havainto.luoja_id)
        .filter((id): id is string => Boolean(id)),
    ),
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

  const normalisoiTyyppi = (tyyppi: string): AsiakasHavainto["tyyppi"] => {
    if (tyyppi === "liukkaus" || tyyppi === "auraus" || tyyppi === "hiekoitus" || tyyppi === "vaurio") return tyyppi;
    return "muu";
  };
  const normalisoiStatus = (status: string): AsiakasHavainto["status"] | null => {
    if (status === "avoin" || status === "tyon_alla" || status === "valmis" || status === "suljettu") return status;
    return null;
  };
  const tyyppiOtsikko = (tyyppi: AsiakasHavainto["tyyppi"]) => {
    if (tyyppi === "liukkaus") return "Liukkaus";
    if (tyyppi === "auraus") return "Auraus";
    if (tyyppi === "hiekoitus") return "Hiekoitus";
    if (tyyppi === "vaurio") return "Vaurio";
    return "Muu havainto";
  };
  const kuvaus = (sijainti: string | null, lisatiedot: unknown) => {
    if (typeof lisatiedot === "string" && lisatiedot.trim()) return lisatiedot.trim();
    if (sijainti?.trim()) return sijainti.trim();
    if (lisatiedot && typeof lisatiedot === "object") {
      const teksti = JSON.stringify(lisatiedot);
      return teksti === "{}" ? "" : teksti;
    }
    return "";
  };
  const aika = (aikaleima: string | null) =>
    aikaleima
      ? muotoileViaraAika(aikaleima, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
      : null;

  const alueHavainnot: AsiakasHavainto[] = (havainnot ?? []).flatMap((havainto) => {
    const status = normalisoiStatus(havainto.tila);
    if (!status) return [];
    const tyyppi = normalisoiTyyppi(havainto.tyyppi);
    const tekija = havainto.luoja_id ? kayttajaMap.get(havainto.luoja_id) : undefined;
    const ajat = tapahtumaMap.get(havainto.id);
    const rooli = tekija?.rooli === "kuljettaja"
      ? "Kuljettaja"
      : tekija?.rooli === "tyonjohto"
        ? "Työnjohto"
        : tekija?.rooli === "asiakas"
          ? "Asiakas"
          : tekija?.rooli === "asukas"
            ? "Asukas"
            : tekija?.rooli === "admin"
              ? "Ylläpito"
              : "Käyttäjä";

    return [{
      id: havainto.id,
      hoitoalueId: havainto.hoitoalue_id,
      hoitoalueNimi: alue.nimi,
      hoitoalueOsoite: alue.osoite,
      tyyppi,
      otsikko: tyyppiOtsikko(tyyppi),
      kuvaus: kuvaus(havainto.sijainti_kuvaus, havainto.lisatiedot),
      aika: aika(havainto.luotu) ?? "",
      status,
      tekija: tekija?.nimi ?? "Tuntematon käyttäjä",
      tekijaRooli: rooli,
      kuittausaika: aika(ajat?.kuittaus ?? null),
      valmistumisaika: aika(ajat?.valmistuminen ?? null),
      sulkemisaika: aika(ajat?.sulkeminen ?? null),
    }];
  });

  return {
    id: alue.id,
    nimi: alue.nimi,
    osoite: alue.osoite,
    tila,
    edistyma,
    viimeisinTapahtuma: viimeisin
      ? `${viimeisin.tyyppi === "tyo_valmis" ? "Työ valmis" : "Työ aloitettu"} ${aika(viimeisin.aikaleima) ?? ""}`.trim()
      : null,
    havainnot: alueHavainnot,
  };
}
