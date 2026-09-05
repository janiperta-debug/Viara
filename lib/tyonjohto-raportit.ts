import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { muotoileViaraAika, muotoileViaraPaivamaara } from "@/lib/viara-aika";

export type TyonjohtoRaporttiTyyppi = "tyon_suoritus" | "poikkeamat" | "tapahtumat";

export type TyonjohtoRaportti = {
  id: string;
  tyyppi: TyonjohtoRaporttiTyyppi;
  otsikko: string;
  kuvaus: string;
  aika: string;
  tapahtumia: number;
  valmis: boolean;
};

export type TyonjohtoRaporttiTapahtuma = {
  id: string;
  aikaleima: string;
  tyyppi: string;
  hoitoalue: string;
  tekija: string;
  tyovaline: string | null;
  gps: boolean;
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
  hoitoalueet: { nimi: string } | null;
  kayttajat: { nimi: string } | null;
  tyovalinetyypit: { nimi: string } | null;
};

function paivaAvain(aikaleima: string) {
  const osat = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(aikaleima));
  const arvot = Object.fromEntries(osat.map((osa) => [osa.type, osa.value]));
  return `${arvot.year}-${arvot.month}-${arvot.day}`;
}

function ryhmittelePaivittain(tapahtumat: RawTapahtuma[]) {
  const ryhmat = new Map<string, RawTapahtuma[]>();
  for (const tapahtuma of tapahtumat) {
    const paiva = paivaAvain(tapahtuma.aikaleima);
    const nykyinen = ryhmat.get(paiva) ?? [];
    nykyinen.push(tapahtuma);
    ryhmat.set(paiva, nykyinen);
  }
  return ryhmat;
}

function raporttiId(tyyppi: TyonjohtoRaporttiTyyppi, paiva: string) {
  return `${tyyppi}-${paiva}`;
}

export async function haeTyonjohtoRaportit(organisaatioId: string): Promise<TyonjohtoRaportti[]> {
  const tapahtumat = await haeOrganisaationTapahtumat(organisaatioId);
  const ryhmat = ryhmittelePaivittain(tapahtumat);
  const raportit: TyonjohtoRaportti[] = [];

  for (const [paiva, paivanTapahtumat] of ryhmat) {
    const tyot = paivanTapahtumat.filter((t) => t.tyyppi === "tyo_aloitettu" || t.tyyppi === "tyo_valmis");
    const poikkeamat = paivanTapahtumat.filter((t) => t.tyyppi === "poikkeama_luotu" || t.tyyppi === "poikkeama_ratkaistu");
    const paivaTeksti = paiva.split("-").reverse().join(".");

    raportit.push({
      id: raporttiId("tyon_suoritus", paiva),
      tyyppi: "tyon_suoritus",
      otsikko: "Työn suoritus",
      kuvaus: `${new Set(tyot.map((t) => t.hoitoalue_id).filter(Boolean)).size} hoitoaluetta · ${tyot.length} työtapahtumaa`,
      aika: paivaTeksti,
      tapahtumia: tyot.length,
      valmis: tyot.length > 0,
    });

    if (poikkeamat.length > 0) {
      raportit.push({
        id: raporttiId("poikkeamat", paiva),
        tyyppi: "poikkeamat",
        otsikko: "Poikkeamat",
        kuvaus: `${new Set(poikkeamat.map((t) => t.hoitoalue_id).filter(Boolean)).size} hoitoaluetta · ${poikkeamat.length} tapahtumaa`,
        aika: paivaTeksti,
        tapahtumia: poikkeamat.length,
        valmis: true,
      });
    }

    raportit.push({
      id: raporttiId("tapahtumat", paiva),
      tyyppi: "tapahtumat",
      otsikko: "Tapahtumahistoria",
      kuvaus: `${paivanTapahtumat.length} tapahtumaa kaikista työn tapahtumista`,
      aika: paivaTeksti,
      tapahtumia: paivanTapahtumat.length,
      valmis: paivanTapahtumat.length > 0,
    });
  }

  return raportit.slice(0, 30);
}

export async function haeTyonjohtoRaportti(
  organisaatioId: string,
  raporttiIdArvo: string,
): Promise<{ raportti: TyonjohtoRaportti; tapahtumat: TyonjohtoRaporttiTapahtuma[] } | null> {
  const osa = raporttiIdArvo.match(/^(tyon_suoritus|poikkeamat|tapahtumat)-(\d{4}-\d{2}-\d{2})$/);
  if (!osa) return null;
  const [, tyyppi, paiva] = osa as [string, TyonjohtoRaporttiTyyppi, string];
  const kaikki = await haeOrganisaationTapahtumat(organisaatioId);
  const paivanTapahtumat = kaikki.filter((t) => paivaAvain(t.aikaleima) === paiva);
  const valitut = tyyppi === "tyon_suoritus"
    ? paivanTapahtumat.filter((t) => t.tyyppi === "tyo_aloitettu" || t.tyyppi === "tyo_valmis")
    : tyyppi === "poikkeamat"
      ? paivanTapahtumat.filter((t) => t.tyyppi === "poikkeama_luotu" || t.tyyppi === "poikkeama_ratkaistu")
      : paivanTapahtumat;

  const paivaTeksti = paiva.split("-").reverse().join(".");
  const raportti: TyonjohtoRaportti = {
    id: raporttiId(tyyppi, paiva),
    tyyppi,
    otsikko: tyyppi === "tyon_suoritus" ? "Työn suoritus" : tyyppi === "poikkeamat" ? "Poikkeamat" : "Tapahtumahistoria",
    kuvaus: `${new Set(valitut.map((t) => t.hoitoalue_id).filter(Boolean)).size} hoitoaluetta · ${valitut.length} tapahtumaa`,
    aika: paivaTeksti,
    tapahtumia: valitut.length,
    valmis: valitut.length > 0,
  };

  if (!raportti.valmis) return null;
  return { raportti, tapahtumat: valitut.map((t) => ({
    id: t.id,
    aikaleima: t.aikaleima,
    tyyppi: tapahtumaLabel(t.tyyppi),
    hoitoalue: t.hoitoalueet?.nimi ?? "Ei kohdetta",
    tekija: t.kayttajat?.nimi ?? "Tuntematon käyttäjä",
    tyovaline: t.tyovalinetyypit?.nimi ?? null,
    gps: t.gps_lat !== null && t.gps_lng !== null,
  })) };
}

async function haeOrganisaationTapahtumat(organisaatioId: string): Promise<RawTapahtuma[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tapahtumat")
    .select("id, aikaleima, hoitoalue_id, kayttaja_id, tyovalinetyyppi_id, tyyppi, gps_lat, gps_lng, hoitoalueet(nimi), kayttajat(nimi, organisaatio_id), tyovalinetyypit(nimi)")
    .eq("kayttajat.organisaatio_id", organisaatioId)
    .order("aikaleima", { ascending: false })
    .limit(2000);

  if (error || !data) return [];
  return data as unknown as RawTapahtuma[];
}

function tapahtumaLabel(tyyppi: string) {
  const tekstit: Record<string, string> = {
    tyo_aloitettu: "Työ aloitettu",
    tyo_valmis: "Työ valmis",
    tyovuoro_alkoi: "Työvuoro aloitettu",
    tyovuoro_paattyi: "Työvuoro päättynyt",
    hoitoalue_saapui: "Saapui hoitoalueelle",
    hoitoalue_poistui: "Poistui hoitoalueelta",
    tyovaline_on: "Työväline kytketty",
    tyovaline_off: "Työväline irrotettu",
    havainto_luotu: "Havainto luotu",
    havainto_uusi: "Uusi havainto",
    havainto_vastaanotettu: "Havainto vastaanotettu",
    havainto_otettu_tyon_alle: "Havainto työn alle",
    havainto_valmis: "Havainto valmis",
    havainto_suljettu: "Havainto suljettu",
    poikkeama_luotu: "Poikkeama luotu",
    poikkeama_ratkaistu: "Poikkeama ratkaistu",
  };
  return tekstit[tyyppi] ?? tyyppi;
}
