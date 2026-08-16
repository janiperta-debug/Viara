// ASUKAS (resident) -näkymän mock-data — EI kytketty backendiin.
//
// Eristettyä esitystason dataa. Myöhemmin korvataan Supabase-kyselyllä,
// joka on rajattu asukkaan OMAAN hoitoalueeseen (rooli-/RLS-vaihe myöhemmin).
//
// TÄRKEIN PERIAATE: havainto kuuluu HOITOALUEELLE, ei tekijälle.
// Asukas näkee KAIKKI oman hoitoalueensa havainnot — myös muiden tekemät.
// Näin vältetään päällekkäiset ilmoitukset: kun Jussi on jo ilmoittanut
// liukkaudesta, Liisa näkee saman havainnon eikä tee uutta.

export type HavaintoStatus = "uusi" | "kasittelyssa" | "kasitelty";
export type HavaintoTyyppi =
  | "liukkaus"
  | "auraus"
  | "hiekoitus"
  | "vaurio"
  | "muu";
export type AlueTila = "valmis" | "tyon_alla" | "aloittamatta";

export const STATUS_MAARITTEET: Record<
  HavaintoStatus,
  { label: string; vari: string }
> = {
  uusi: { label: "Uusi", vari: "#d97706" },
  kasittelyssa: { label: "Käsittelyssä", vari: "#2f6df6" },
  kasitelty: { label: "Käsitelty", vari: "#16a34a" },
};

export const TILA_MAARITTEET: Record<
  AlueTila,
  { label: string; vari: string }
> = {
  valmis: { label: "Valmis", vari: "#16a34a" },
  tyon_alla: { label: "Työ käynnissä", vari: "#d97706" },
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
// Kirjautunut asukas
// ---------------------------------------------------------------------------
export const ASUKAS = {
  nimi: "Liisa Korhonen",
  nimikirjaimet: "LK",
  huoneisto: "B 14",
  sahkoposti: "liisa.korhonen@example.fi",
};

// ---------------------------------------------------------------------------
// Asukkaan OMA hoitoalue — vain yksi. Tämä on tiukka oikeusraja.
// ---------------------------------------------------------------------------
export const OMA_HOITOALUE = {
  id: "ha1",
  nimi: "As Oy Mäntyvinne",
  osoite: "Keskuskatu 12",
  postitoimipaikka: "05800 Hyvinkää",
  tila: "tyon_alla" as AlueTila,
  edistyma: 65,
  viimeisinTapahtuma: "Työ aloitettu 07:12",
};

// ---------------------------------------------------------------------------
// Oman hoitoalueen havainnot — KAIKKI, ei vain omat.
// ---------------------------------------------------------------------------
export type Havainto = {
  id: string;
  otsikko: string;
  tyyppi: HavaintoTyyppi;
  kuvaus: string;
  aika: string;
  status: HavaintoStatus;
  tekija: string;
  omaHavainto: boolean; // korostetaan hienovaraisesti, ei erillisenä listana
};

export const HAVAINNOT: Havainto[] = [
  {
    id: "h1",
    otsikko: "Liukkaus havaittu",
    tyyppi: "liukkaus",
    kuvaus:
      "Piha-alue ja sisäänkäynti A liukkaita. Hiekoitusta ei ole vielä tehty.",
    aika: "06:15",
    status: "uusi",
    tekija: "Jussi Nieminen",
    omaHavainto: false,
  },
  {
    id: "h2",
    otsikko: "Lumivalli näköesteenä",
    tyyppi: "auraus",
    kuvaus:
      "Pihatien risteykseen kasautunut lumivalli estää näkyvyyden autoillessa.",
    aika: "09:02",
    status: "uusi",
    tekija: "Isännöitsijä",
    omaHavainto: false,
  },
  {
    id: "h3",
    otsikko: "Portaat liukkaat",
    tyyppi: "hiekoitus",
    kuvaus:
      "Takapihan portaat olivat illalla liukkaat. Hiekoitus tehtiin aamulla.",
    aika: "eilen 18:30",
    status: "kasitelty",
    tekija: "Liisa Korhonen",
    omaHavainto: true,
  },
];

// Onko hoitoalueella jo aktiivinen (ei-käsitelty) havainto? Käytetään
// UI:ssa viestimään "tästä on jo ilmoitettu" ennen uuden luontia.
export function aktiivisiaHavaintoja(): number {
  return HAVAINNOT.filter((h) => h.status !== "kasitelty").length;
}
