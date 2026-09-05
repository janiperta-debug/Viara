import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { pisteGeoJSONissa } from "@/lib/hoitoalue-geometria";
import { muotoileViaraAika } from "@/lib/viara-aika";

export type TyonjohtoRaporttiTyyppi = "tyon_suoritus" | "poikkeamat" | "tapahtumat";
export type TyonjohtoRaportti = { id: string; tyyppi: TyonjohtoRaporttiTyyppi; otsikko: string; kuvaus: string; aika: string; tapahtumia: number; valmis: boolean };
export type TyonjohtoRaporttiTapahtuma = { id: string; aikaleima: string; tyyppi: string; hoitoalue: string; tekija: string; tyovaline: string | null; gps: boolean };
export type TyonjohtoTyonSuoritus = {
  hoitoalue: string;
  saapuminen: string | null;
  poistuminen: string | null;
  aloitus: string | null;
  valmistuminen: string | null;
  tyontekijat: string[];
  tyovalineet: string[];
  gpsTapahtumia: number;
  gpsSaapuminen: "varmistettu" | "ei_varmistettu" | "puuttuu";
  gpsPoistuminen: "varmistettu" | "ei_varmistettu" | "puuttuu";
  poikkeamia: number;
  poikkeamatRatkaistu: number;
  tila: "valmis" | "aloitettu" | "ei_tapahtumia";
};

type RawTapahtuma = {
  id: string;
  aikaleima: string;
  hoitoalue_id: string | null;
  kayttaja_id: string | null;
  tyovalinetyyppi_id: string | null;
  tyyppi: string;
  gps_lat: number | null;
  gps_lng: number | null;
  hoitoalueet: { nimi: string; raja_geojson: unknown; lasnaoloalue_metrit: number | null } | null;
  kayttajat: { nimi: string } | null;
  tyovalinetyypit: { nimi: string } | null;
};

function paivaAvain(aikaleima: string) {
  const osat = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(aikaleima));
  const arvot = Object.fromEntries(osat.map((osa) => [osa.type, osa.value]));
  return `${arvot.year}-${arvot.month}-${arvot.day}`;
}
function paivaTeksti(paiva: string) { return paiva.split("-").reverse().join("."); }
function raporttiId(tyyppi: TyonjohtoRaporttiTyyppi, paiva: string) { return `${tyyppi}-${paiva}`; }
function ryhmittelePaivittain(tapahtumat: RawTapahtuma[]) {
  const ryhmat = new Map<string, RawTapahtuma[]>();
  for (const tapahtuma of tapahtumat) { const paiva = paivaAvain(tapahtuma.aikaleima); ryhmat.set(paiva, [...(ryhmat.get(paiva) ?? []), tapahtuma]); }
  return ryhmat;
}

export async function haeTyonjohtoRaportit(organisaatioId: string): Promise<TyonjohtoRaportti[]> {
  const tapahtumat = await haeOrganisaationTapahtumat(organisaatioId);
  const raportit: TyonjohtoRaportti[] = [];
  for (const [paiva, paivanTapahtumat] of ryhmittelePaivittain(tapahtumat)) {
    const tyot = paivanTapahtumat.filter((t) => t.tyyppi === "tyo_aloitettu" || t.tyyppi === "tyo_valmis");
    const poikkeamat = paivanTapahtumat.filter((t) => t.tyyppi === "poikkeama_luotu" || t.tyyppi === "poikkeama_ratkaistu");
    raportit.push({ id: raporttiId("tyon_suoritus", paiva), tyyppi: "tyon_suoritus", otsikko: "Työn suoritus", kuvaus: `${new Set(tyot.map((t) => t.hoitoalue_id).filter(Boolean)).size} hoitoaluetta · ${tyot.length} työtapahtumaa`, aika: paivaTeksti(paiva), tapahtumia: tyot.length, valmis: tyot.length > 0 });
    if (poikkeamat.length > 0) raportit.push({ id: raporttiId("poikkeamat", paiva), tyyppi: "poikkeamat", otsikko: "Poikkeamat", kuvaus: `${new Set(poikkeamat.map((t) => t.hoitoalue_id).filter(Boolean)).size} hoitoaluetta · ${poikkeamat.length} tapahtumaa`, aika: paivaTeksti(paiva), tapahtumia: poikkeamat.length, valmis: true });
    raportit.push({ id: raporttiId("tapahtumat", paiva), tyyppi: "tapahtumat", otsikko: "Tapahtumahistoria", kuvaus: `${paivanTapahtumat.length} tapahtumaa kaikista työn tapahtumista`, aika: paivaTeksti(paiva), tapahtumia: paivanTapahtumat.length, valmis: paivanTapahtumat.length > 0 });
  }
  return raportit.slice(0, 30);
}

export async function haeTyonjohtoRaportti(organisaatioId: string, raporttiIdArvo: string): Promise<{ raportti: TyonjohtoRaportti; tapahtumat: TyonjohtoRaporttiTapahtuma[]; suoritukset: TyonjohtoTyonSuoritus[] } | null> {
  const osa = raporttiIdArvo.match(/^(tyon_suoritus|poikkeamat|tapahtumat)-(\d{4}-\d{2}-\d{2})$/);
  if (!osa) return null;
  const [, tyyppi, paiva] = osa as [string, TyonjohtoRaporttiTyyppi, string];
  const kaikki = await haeOrganisaationTapahtumat(organisaatioId);
  const paivanTapahtumat = kaikki.filter((t) => paivaAvain(t.aikaleima) === paiva);
  const valitut = tyyppi === "tyon_suoritus" ? paivanTapahtumat.filter((t) => t.tyyppi === "tyo_aloitettu" || t.tyyppi === "tyo_valmis") : tyyppi === "poikkeamat" ? paivanTapahtumat.filter((t) => t.tyyppi === "poikkeama_luotu" || t.tyyppi === "poikkeama_ratkaistu") : paivanTapahtumat;
  const raportti: TyonjohtoRaportti = { id: raporttiId(tyyppi, paiva), tyyppi, otsikko: tyyppi === "tyon_suoritus" ? "Työn suoritus" : tyyppi === "poikkeamat" ? "Poikkeamat" : "Tapahtumahistoria", kuvaus: `${new Set(valitut.map((t) => t.hoitoalue_id).filter(Boolean)).size} hoitoaluetta · ${valitut.length} tapahtumaa`, aika: paivaTeksti(paiva), tapahtumia: valitut.length, valmis: valitut.length > 0 };
  if (!raportti.valmis) return null;
  return { raportti, tapahtumat: valitut.map((t) => ({ id: t.id, aikaleima: t.aikaleima, tyyppi: tapahtumaLabel(t.tyyppi), hoitoalue: t.hoitoalueet?.nimi ?? "Ei kohdetta", tekija: t.kayttajat?.nimi ?? "Tuntematon käyttäjä", tyovaline: t.tyovalinetyypit?.nimi ?? null, gps: onGps(t) })), suoritukset: tyyppi === "tyon_suoritus" ? muodostaTyonSuoritukset(paivanTapahtumat) : [] };
}

function onGps(t: RawTapahtuma) { return t.gps_lat !== null && t.gps_lng !== null; }

function muodostaTyonSuoritukset(tapahtumat: RawTapahtuma[]): TyonjohtoTyonSuoritus[] {
  const alueet = new Map<string, RawTapahtuma[]>();
  for (const tapahtuma of tapahtumat) if (tapahtuma.hoitoalue_id) alueet.set(tapahtuma.hoitoalue_id, [...(alueet.get(tapahtuma.hoitoalue_id) ?? []), tapahtuma]);
  return [...alueet.values()].map((tapahtumatAlueella) => {
    const jarjestetty = [...tapahtumatAlueella].sort((a, b) => new Date(a.aikaleima).getTime() - new Date(b.aikaleima).getTime());
    const tapahtuma = (tyyppi: string) => jarjestetty.find((t) => t.tyyppi === tyyppi) ?? null;
    const viimeinen = (tyyppi: string) => [...jarjestetty].reverse().find((t) => t.tyyppi === tyyppi) ?? null;
    const arrival = tapahtuma("hoitoalue_saapui");
    const departure = viimeinen("hoitoalue_poistui");
    const aloitus = tapahtuma("tyo_aloitettu");
    const valmis = viimeinen("tyo_valmis");
    const poikkeamaLuotu = tapahtumatAlueella.filter((t) => t.tyyppi === "poikkeama_luotu").length;
    const poikkeamaRatkaistu = tapahtumatAlueella.filter((t) => t.tyyppi === "poikkeama_ratkaistu").length;
    return {
      hoitoalue: tapahtumatAlueella[0].hoitoalueet?.nimi ?? "Ei kohdetta",
      saapuminen: arrival ? muotoileViaraAika(arrival.aikaleima, { hour: "2-digit", minute: "2-digit" }) : null,
      poistuminen: departure ? muotoileViaraAika(departure.aikaleima, { hour: "2-digit", minute: "2-digit" }) : null,
      aloitus: aloitus ? muotoileViaraAika(aloitus.aikaleima, { hour: "2-digit", minute: "2-digit" }) : null,
      valmistuminen: valmis ? muotoileViaraAika(valmis.aikaleima, { hour: "2-digit", minute: "2-digit" }) : null,
      tyontekijat: [...new Set(tapahtumatAlueella.map((t) => t.kayttajat?.nimi).filter((nimi): nimi is string => Boolean(nimi)))],
      tyovalineet: [...new Set(tapahtumatAlueella.map((t) => t.tyovalinetyypit?.nimi).filter((nimi): nimi is string => Boolean(nimi)))],
      gpsTapahtumia: tapahtumatAlueella.filter(onGps).length,
      gpsSaapuminen: tarkistaGps(arrival),
      gpsPoistuminen: tarkistaGps(departure),
      poikkeamia: poikkeamaLuotu,
      poikkeamatRatkaistu: Math.min(poikkeamaRatkaistu, poikkeamaLuotu),
      tila: valmis ? "valmis" : aloitus ? "aloitettu" : "ei_tapahtumia",
    };
  }).sort((a, b) => a.hoitoalue.localeCompare(b.hoitoalue, "fi"));
}

function tarkistaGps(tapahtuma: RawTapahtuma | null): "varmistettu" | "ei_varmistettu" | "puuttuu" {
  if (!tapahtuma || !onGps(tapahtuma)) return "puuttuu";
  const alue = tapahtuma.hoitoalueet;
  if (!alue?.raja_geojson) return "ei_varmistettu";
  try {
    return pisteGeoJSONissa(Number(tapahtuma.gps_lat), Number(tapahtuma.gps_lng), alue.raja_geojson as Parameters<typeof pisteGeoJSONissa>[2], alue.lasnaoloalue_metrit ?? 0) ? "varmistettu" : "ei_varmistettu";
  } catch {
    return "ei_varmistettu";
  }
}

async function haeOrganisaationTapahtumat(organisaatioId: string): Promise<RawTapahtuma[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("tapahtumat").select("id, aikaleima, hoitoalue_id, kayttaja_id, tyovalinetyyppi_id, tyyppi, gps_lat, gps_lng, hoitoalueet(nimi, raja_geojson, lasnaoloalue_metrit), kayttajat(nimi, organisaatio_id), tyovalinetyypit(nimi)").eq("kayttajat.organisaatio_id", organisaatioId).order("aikaleima", { ascending: false }).limit(2000);
  if (error || !data) return [];
  return data as unknown as RawTapahtuma[];
}

function tapahtumaLabel(tyyppi: string) {
  const tekstit: Record<string, string> = { tyo_aloitettu: "Työ aloitettu", tyo_valmis: "Työ valmis", tyovuoro_alkoi: "Työvuoro aloitettu", tyovuoro_paattyi: "Työvuoro päättynyt", hoitoalue_saapui: "Saapui hoitoalueelle", hoitoalue_poistui: "Poistui hoitoalueelta", tyovaline_on: "Työväline kytketty", tyovaline_off: "Työväline irrotettu", havainto_luotu: "Havainto luotu", havainto_uusi: "Uusi havainto", havainto_vastaanotettu: "Havainto vastaanotettu", havainto_otettu_tyon_alle: "Havainto työn alle", havainto_valmis: "Havainto valmis", havainto_suljettu: "Havainto suljettu", poikkeama_luotu: "Poikkeama luotu", poikkeama_ratkaistu: "Poikkeama ratkaistu" };
  return tekstit[tyyppi] ?? tyyppi;
}
