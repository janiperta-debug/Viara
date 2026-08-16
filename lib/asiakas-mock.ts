// ASIAKAS (customer) -näkymän mock-data — EI kytketty backendiin.
//
// Eristettyä esitystason dataa. Myöhemmin korvataan Supabase-kyselyillä,
// jotka on rajattu asiakkaan omiin hoitoalueisiin (rooli-/RLS-vaihe myöhemmin).
//
// TÄRKEIN PERIAATE: havainto kuuluu HOITOALUEELLE, ei tekijälle.
// Havainto on jaettua tietoa hoitoalueesta. UI on rakennettu
// HOITOALUE -> HAVAINNOT -logiikalla, ei "omat havainnot" -logiikalla.

export type HavaintoStatus = "uusi" | "kasittelyssa" | "kasitelty";
export type HavaintoTyyppi =
  | "liukkaus"
  | "auraus"
  | "hiekoitus"
  | "vaurio"
  | "muu";
export type AlueTila = "valmis" | "tyon_alla" | "aloittamatta";
export type Vakavuus = "kiireellinen" | "normaali";

// Havainnon tila — sama työnkulku kuin muuallakin (uusi -> käsittelyssä -> käsitelty).
export const STATUS_MAARITTEET: Record<
  HavaintoStatus,
  { label: string; vari: string }
> = {
  uusi: { label: "Uusi", vari: "#d97706" },
  kasittelyssa: { label: "Käsittelyssä", vari: "#2f6df6" },
  kasitelty: { label: "Käsitelty", vari: "#16a34a" },
};

// Hoitoalueen tila — liikennevalologiikka.
export const TILA_MAARITTEET: Record<
  AlueTila,
  { label: string; vari: string }
> = {
  valmis: { label: "Valmis", vari: "#16a34a" },
  tyon_alla: { label: "Työn alla", vari: "#d97706" },
  aloittamatta: { label: "Aloittamatta", vari: "#6b7480" },
};

export const TYYPPI_LABEL: Record<HavaintoTyyppi, string> = {
  liukkaus: "Liukkaus",
  auraus: "Auraus",
  hiekoitus: "Hiekoitus",
  vaurio: "Vaurio",
  muu: "Muu havainto",
};

// ---------------------------------------------------------------------------
// Kirjautunut asiakas (esim. isännöitsijä / kiinteistöpäällikkö)
// ---------------------------------------------------------------------------
export const ASIAKAS = {
  nimi: "Jani Perta",
  nimikirjaimet: "JP",
  organisaatio: "Kiinteistö-Huolto Oy",
  rooli: "Isännöitsijä",
  sahkoposti: "jani.perta@kiinteistohuolto.fi",
};

// ---------------------------------------------------------------------------
// Asiakkaan hoitoalueet (koko hallinnoitu kokonaisuus)
// ---------------------------------------------------------------------------
export type Hoitoalue = {
  id: string;
  nimi: string;
  osoite: string;
  postitoimipaikka: string;
  tila: AlueTila;
  edistyma: number; // 0-100
  viimeisinTapahtuma: string;
};

export const HOITOALUEET: Hoitoalue[] = [
  {
    id: "ha1",
    nimi: "As Oy Mäntyvinne",
    osoite: "Keskuskatu 12",
    postitoimipaikka: "05800 Hyvinkää",
    tila: "valmis",
    edistyma: 100,
    viimeisinTapahtuma: "Työ valmis 06:43",
  },
  {
    id: "ha2",
    nimi: "As Oy Koivikko",
    osoite: "Koivikkotie 4",
    postitoimipaikka: "05820 Hyvinkää",
    tila: "tyon_alla",
    edistyma: 40,
    viimeisinTapahtuma: "Työ aloitettu 07:58",
  },
  {
    id: "ha3",
    nimi: "As Oy Kivistö",
    osoite: "Kivistöntie 8",
    postitoimipaikka: "05800 Hyvinkää",
    tila: "aloittamatta",
    edistyma: 0,
    viimeisinTapahtuma: "Suunniteltu 10:00",
  },
  {
    id: "ha4",
    nimi: "As Oy Puistola",
    osoite: "Puistokatu 6",
    postitoimipaikka: "05800 Hyvinkää",
    tila: "valmis",
    edistyma: 100,
    viimeisinTapahtuma: "Työ valmis 06:12",
  },
  {
    id: "ha5",
    nimi: "As Oy Rinnekoti",
    osoite: "Rinnetie 2",
    postitoimipaikka: "05810 Hyvinkää",
    tila: "tyon_alla",
    edistyma: 65,
    viimeisinTapahtuma: "Työ aloitettu 07:20",
  },
  {
    id: "ha6",
    nimi: "Liikekeskus Plaza",
    osoite: "Hämeenkatu 1",
    postitoimipaikka: "05800 Hyvinkää",
    tila: "valmis",
    edistyma: 100,
    viimeisinTapahtuma: "Työ valmis 06:30",
  },
];

// ---------------------------------------------------------------------------
// Havainnot — kuuluvat hoitoalueille (hoitoalueId), eivät tekijälle.
// Asiakas näkee KAIKKI omien hoitoalueidensa havainnot.
// ---------------------------------------------------------------------------
export type Havainto = {
  id: string;
  hoitoalueId: string;
  otsikko: string;
  tyyppi: HavaintoTyyppi;
  kuvaus: string;
  aika: string;
  status: HavaintoStatus;
  tekija: string;
  tekijaRooli: string;
  vakavuus: Vakavuus;
};

export const HAVAINNOT: Havainto[] = [
  {
    id: "h1",
    hoitoalueId: "ha1",
    otsikko: "Liukkaus havaittu",
    tyyppi: "liukkaus",
    kuvaus:
      "Piha-alue ja sisäänkäynti A liukkaita. Hiekoitusta ei ole vielä tehty aamun sulamisen jälkeen.",
    aika: "08:14",
    status: "uusi",
    tekija: "Jussi Nieminen",
    tekijaRooli: "Asukas",
    vakavuus: "kiireellinen",
  },
  {
    id: "h2",
    hoitoalueId: "ha1",
    otsikko: "Lumivalli näköesteenä",
    tyyppi: "auraus",
    kuvaus:
      "Pihatien risteykseen kasautunut lumivalli estää näkyvyyden. Toivotaan siirtoa.",
    aika: "09:02",
    status: "uusi",
    tekija: "Jani Perta",
    tekijaRooli: "Asiakas",
    vakavuus: "normaali",
  },
  {
    id: "h3",
    hoitoalueId: "ha2",
    otsikko: "Rikkoutunut katuvalo",
    tyyppi: "vaurio",
    kuvaus:
      "Katuvalo ei syty pysäköintialueen kohdalla. Alue jää pimeäksi aamulla.",
    aika: "07:52",
    status: "kasittelyssa",
    tekija: "Toni Virtanen",
    tekijaRooli: "Kuljettaja",
    vakavuus: "normaali",
  },
  {
    id: "h4",
    hoitoalueId: "ha3",
    otsikko: "Hiekoitus puuttuu",
    tyyppi: "hiekoitus",
    kuvaus:
      "Asukas ilmoitti liukkaasta luiskasta. Hiekoitusta pyydetään ennen aamuruuhkaa.",
    aika: "07:21",
    status: "uusi",
    tekija: "Jani Perta",
    tekijaRooli: "Asiakas",
    vakavuus: "kiireellinen",
  },
  {
    id: "h5",
    hoitoalueId: "ha5",
    otsikko: "Aurauskaluston jälki",
    tyyppi: "vaurio",
    kuvaus:
      "Nurmikon reuna vaurioitunut aurauksessa. Kirjattu ylös, korjaus keväällä.",
    aika: "eilen 15:40",
    status: "kasitelty",
    tekija: "Toni Virtanen",
    tekijaRooli: "Kuljettaja",
    vakavuus: "normaali",
  },
];

// ---------------------------------------------------------------------------
// Apufunktiot & johdettu yhteenveto (myöhemmin tapahtumista/DB:stä)
// ---------------------------------------------------------------------------
export function havainnotAlueelle(hoitoalueId: string): Havainto[] {
  return HAVAINNOT.filter((h) => h.hoitoalueId === hoitoalueId);
}

export function avoimetHavainnotAlueelle(hoitoalueId: string): number {
  return HAVAINNOT.filter(
    (h) => h.hoitoalueId === hoitoalueId && h.status !== "kasitelty",
  ).length;
}

export function hoitoalueNimi(hoitoalueId: string): string {
  return HOITOALUEET.find((a) => a.id === hoitoalueId)?.nimi ?? "";
}

export const YHTEENVETO = {
  hoitoalueet: HOITOALUEET.length,
  valmisProsentti: Math.round(
    HOITOALUEET.reduce((s, a) => s + a.edistyma, 0) / HOITOALUEET.length,
  ),
  tyonAlla: HOITOALUEET.filter((a) => a.tila === "tyon_alla").length,
  avoimetHavainnot: HAVAINNOT.filter((h) => h.status !== "kasitelty").length,
};
