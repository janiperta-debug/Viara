import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { muotoileViaraAika, muotoileViaraPaivamaara } from "@/lib/viara-aika";

export type RaporttiTyyppi = "hoitopaivakirja" | "havainnot";
export type RaporttiKohde = "hoitoalue" | "asiakkuus";

export type RaporttiValinta = {
  hoitoalueet: { id: string; nimi: string; osoite: string | null }[];
  asiakkuudet: { id: string; nimi: string }[];
};

export type HoitopaivakirjaRivi = {
  paiva: string;
  hoitoalue: string;
  tapahtuma: string;
  aloitus: string | null;
  lopetus: string | null;
  kestoMinuutit: number | null;
  tekija: string;
  tyovaline: string | null;
  gps: boolean;
};

export type HavaintoRaporttiRivi = {
  paiva: string;
  hoitoalue: string;
  tyyppi: string;
  tila: string;
  luotu: string | null;
  tyonAlle: string | null;
  ratkaistu: string | null;
  kasittelyMinuutit: number | null;
};

export type RaporttiData = {
  tyyppi: RaporttiTyyppi;
  kohde: string;
  aikavali: string;
  tapahtumia: number;
  hoitopaivakirja: HoitopaivakirjaRivi[];
  havainnot: HavaintoRaporttiRivi[];
};

type RawTapahtuma = {
  id: string;
  aikaleima: string;
  hoitoalue_id: string | null;
  kayttaja_id: string | null;
  tyovalinetyyppi_id: string | null;
  havainto_id: string | null;
  tyyppi: string;
  gps_lat: number | null;
  gps_lng: number | null;
  hoitoalueet: { nimi: string; osoite: string | null } | null;
  kayttajat: { nimi: string } | null;
  tyovalinetyypit: { nimi: string } | null;
};

type RawHavainto = {
  id: string;
  hoitoalue_id: string;
  tyyppi: string;
  tila: string;
  luotu: string;
  hoitoalueet: { nimi: string } | null;
};

function minuutit(a: string | null, b: string | null) {
  if (!a || !b) return null;
  const arvo = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
  return arvo >= 0 ? arvo : null;
}

function havaintoTeksti(tyyppi: string) {
  const tekstit: Record<string, string> = {
    liukkaus: "Liukkaus",
    auraus: "Auraus",
    hiekoitus: "Hiekoitus",
    vaurio: "Vaurio",
    muu: "Muu",
  };
  return tekstit[tyyppi] ?? tyyppi;
}

function tilaTeksti(tila: string) {
  const tekstit: Record<string, string> = {
    avoin: "Avoin",
    tyon_alla: "Työn alla",
    valmis: "Valmis",
    suljettu: "Suljettu",
  };
  return tekstit[tila] ?? tila;
}

export async function haeRaporttiValinnat(organisaatioId: string): Promise<RaporttiValinta> {
  const admin = createSupabaseAdminClient();
  const [{ data: alueet }, { data: asiakkuudet }] = await Promise.all([
    admin.from("hoitoalueet").select("id, nimi, osoite, asiakkuudet!inner(organisaatio_id)").eq("asiakkuudet.organisaatio_id", organisaatioId).order("nimi", { ascending: true }),
    admin.from("asiakkuudet").select("id, nimi").eq("organisaatio_id", organisaatioId).order("nimi", { ascending: true }),
  ]);
  return {
    hoitoalueet: (alueet ?? []).map((r) => ({ id: r.id, nimi: r.nimi, osoite: r.osoite })),
    asiakkuudet: (asiakkuudet ?? []).map((r) => ({ id: r.id, nimi: r.nimi })),
  };
}

async function haeOrganisaationTapahtumat(organisaatioId: string, from: string, to: string, hoitoalueIds: string[]) {
  const admin = createSupabaseAdminClient();
  let query = admin.from("tapahtumat").select("id, aikaleima, hoitoalue_id, kayttaja_id, tyovalinetyyppi_id, havainto_id, tyyppi, gps_lat, gps_lng, hoitoalueet(nimi, osoite), kayttajat(nimi, organisaatio_id), tyovalinetyypit(nimi)").eq("kayttajat.organisaatio_id", organisaatioId).gte("aikaleima", `${from}T00:00:00+03:00`).lt("aikaleima", `${to}T23:59:59.999+03:00`).order("aikaleima", { ascending: true }).limit(5000);
  if (hoitoalueIds.length > 0) query = query.in("hoitoalue_id", hoitoalueIds);
  const { data, error } = await query;
  if (error || !data) return [] as RawTapahtuma[];
  return data as unknown as RawTapahtuma[];
}

async function haeHavainnot(hoitoalueIds: string[], from: string, to: string) {
  if (hoitoalueIds.length === 0) return [] as RawHavainto[];
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("havainnot").select("id, hoitoalue_id, tyyppi, tila, luotu, hoitoalueet(nimi)").in("hoitoalue_id", hoitoalueIds).gte("luotu", `${from}T00:00:00+03:00`).lt("luotu", `${to}T23:59:59.999+03:00`).order("luotu", { ascending: true });
  if (error || !data) return [] as RawHavainto[];
  return data as unknown as RawHavainto[];
}

function muodostaHoitopaivakirja(tapahtumat: RawTapahtuma[]): HoitopaivakirjaRivi[] {
  const rivit: HoitopaivakirjaRivi[] = [];
  const alueet = new Map<string, RawTapahtuma[]>();
  for (const t of tapahtumat) if (t.hoitoalue_id) alueet.set(t.hoitoalue_id, [...(alueet.get(t.hoitoalue_id) ?? []), t]);

  for (const alueTapahtumat of alueet.values()) {
    const jarjestetty = [...alueTapahtumat].sort((a, b) => new Date(a.aikaleima).getTime() - new Date(b.aikaleima).getTime());
    const poistumiset = jarjestetty.filter((t) => t.tyyppi === "hoitoalue_poistui");
    const saapumiset = jarjestetty.filter((t) => t.tyyppi === "hoitoalue_saapui");

    for (const saapuminen of saapumiset) {
      const saapumisaika = new Date(saapuminen.aikaleima).getTime();
      const lopetus = poistumiset.find((p) => new Date(p.aikaleima).getTime() > saapumisaika);
      const lopetusaika = lopetus ? new Date(lopetus.aikaleima).getTime() : null;
      const tyovaline = jarjestetty.find((t) => t.tyyppi === "tyovaline_on" && t.kayttaja_id === saapuminen.kayttaja_id && new Date(t.aikaleima).getTime() >= saapumisaika && (!lopetusaika || new Date(t.aikaleima).getTime() <= lopetusaika));

      rivit.push({
        paiva: muotoileViaraPaivamaara(saapuminen.aikaleima),
        hoitoalue: saapuminen.hoitoalueet?.nimi ?? "Ei kohdetta",
        tapahtuma: "Hoitoalueen käsittely",
        aloitus: muotoileViaraAika(saapuminen.aikaleima, { hour: "2-digit", minute: "2-digit" }),
        lopetus: lopetus ? muotoileViaraAika(lopetus.aikaleima, { hour: "2-digit", minute: "2-digit" }) : null,
        kestoMinuutit: minuutit(saapuminen.aikaleima, lopetus?.aikaleima ?? null),
        tekija: saapuminen.kayttajat?.nimi ?? "Tuntematon käyttäjä",
        tyovaline: tyovaline?.tyovalinetyypit?.nimi ?? null,
        gps: saapuminen.gps_lat !== null && saapuminen.gps_lng !== null,
      });
    }
  }

  return rivit.sort((a, b) => `${a.paiva}${a.hoitoalue}${a.aloitus}`.localeCompare(`${b.paiva}${b.hoitoalue}${b.aloitus}`, "fi"));
}

function muodostaHavaintoRaportti(havainnot: RawHavainto[], tapahtumat: RawTapahtuma[]): HavaintoRaporttiRivi[] {
  return havainnot.map((havainto) => {
    const tapahtuma = tapahtumat.filter((t) => t.havainto_id === havainto.id).sort((a, b) => new Date(a.aikaleima).getTime() - new Date(b.aikaleima).getTime());
    const luotu = tapahtuma.find((t) => t.tyyppi === "havainto_luotu");
    const tyonAlle = tapahtuma.find((t) => t.tyyppi === "havainto_otettu_tyon_alle");
    const ratkaistu = tapahtuma.find((t) => t.tyyppi === "havainto_suljettu" || t.tyyppi === "havainto_valmis");
    return {
      paiva: muotoileViaraPaivamaara(havainto.luotu),
      hoitoalue: havainto.hoitoalueet?.nimi ?? "Ei kohdetta",
      tyyppi: havaintoTeksti(havainto.tyyppi),
      tila: tilaTeksti(havainto.tila),
      luotu: luotu ? muotoileViaraAika(luotu.aikaleima, { hour: "2-digit", minute: "2-digit" }) : muotoileViaraAika(havainto.luotu, { hour: "2-digit", minute: "2-digit" }),
      tyonAlle: tyonAlle ? muotoileViaraAika(tyonAlle.aikaleima, { hour: "2-digit", minute: "2-digit" }) : null,
      ratkaistu: ratkaistu ? muotoileViaraAika(ratkaistu.aikaleima, { hour: "2-digit", minute: "2-digit" }) : null,
      kasittelyMinuutit: minuutit(tyonAlle?.aikaleima ?? luotu?.aikaleima ?? havainto.luotu, ratkaistu?.aikaleima ?? null),
    };
  });
}

export async function haeTyonjohtoRaporttiSuodattimilla(organisaatioId: string, tyyppi: RaporttiTyyppi, kohde: RaporttiKohde, kohdeId: string, from: string, to: string): Promise<RaporttiData | null> {
  const valinnat = await haeRaporttiValinnat(organisaatioId);
  let hoitoalueIds: string[] = [];
  let kohteenNimi = "";

  if (kohde === "hoitoalue") {
    const alue = valinnat.hoitoalueet.find((r) => r.id === kohdeId);
    if (!alue) return null;
    hoitoalueIds = [alue.id];
    kohteenNimi = alue.nimi;
  } else {
    const asiakkuus = valinnat.asiakkuudet.find((r) => r.id === kohdeId);
    if (!asiakkuus) return null;
    kohteenNimi = asiakkuus.nimi;
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from("hoitoalueet").select("id").eq("asiakkuus_id", kohdeId);
    hoitoalueIds = (data ?? []).map((r) => r.id);
  }

  const tapahtumat = await haeOrganisaationTapahtumat(organisaatioId, from, to, hoitoalueIds);
  const havainnot = await haeHavainnot(hoitoalueIds, from, to);
  const paivakirja = muodostaHoitopaivakirja(tapahtumat);
  const havaintorivit = muodostaHavaintoRaportti(havainnot, tapahtumat);
  const tapahtumamaara = tyyppi === "hoitopaivakirja" ? paivakirja.length : havaintorivit.length;

  return {
    tyyppi,
    kohde: kohteenNimi,
    aikavali: `${muotoileViaraPaivamaara(`${from}T12:00:00+03:00`)} - ${muotoileViaraPaivamaara(`${to}T12:00:00+03:00`)}`,
    tapahtumia: tapahtumamaara,
    hoitopaivakirja: paivakirja,
    havainnot: havaintorivit,
  };
}

// Vanhan PDF-toteutuksen tyypit säilytetään vielä yhteensopivuutta varten.
export type TyonjohtoRaportti = { id: string; tyyppi: "tyon_suoritus" | "poikkeamat" | "tapahtumat"; otsikko: string; kuvaus: string; aika: string; tapahtumia: number; valmis: boolean };
export type TyonjohtoRaporttiTapahtuma = { id: string; aikaleima: string; tyyppi: string; hoitoalue: string; tekija: string; tyovaline: string | null; gps: boolean };
export type TyonjohtoTyonSuoritus = { hoitoalue: string; saapuminen: string | null; poistuminen: string | null; aloitus: string | null; valmistuminen: string | null; tyontekijat: string[]; tyovalineet: string[]; gpsTapahtumia: number; gpsSaapuminen: "varmistettu" | "ei_varmistettu" | "puuttuu"; gpsPoistuminen: "varmistettu" | "ei_varmistettu" | "puuttuu"; poikkeamia: number; poikkeamatRatkaistu: number; tila: "valmis" | "aloitettu" | "ei_tapahtumia" };
