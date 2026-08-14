// Kenttähavaintojen mock-data — EI kytketty backendiin.
//
// Tämä on eristetty esitystason data. Myöhemmin tämä korvataan
// todellisilla tapahtumapohjaisilla havainnoilla:
//   tapahtumat -> johdettu havaintojen tila -> UI
// Tässä vaiheessa kaikki arvot ovat mock-dataa.
//
// Statusmalli vastaa olemassa olevaa työnkulkua, jonka Server Actionit
// (luo-havainto, ota-havainto-vastaan, merkitse-havainto-valmiiksi,
// sulje-havainto) myöhemmin toteuttavat. UI näyttää kolme tilaa:
//   uusi -> kasittelyssa -> kasitelty

export type HavaintoStatus = "uusi" | "kasittelyssa" | "kasitelty";
export type HavaintoVakavuus = "korkea" | "normaali";
export type HavaintoTyyppi = "liukkaus" | "katuvalo" | "liikennemerkki" | "muu";

export type Havainto = {
  id: string;
  otsikko: string;
  sijainti: string;
  aika: string;
  status: HavaintoStatus;
  vakavuus: HavaintoVakavuus;
  tyyppi: HavaintoTyyppi;
  kuvaus: string;
};

// Statusten visuaaliset määritteet — hillityt, helposti silmäiltävät.
export const STATUS_MAARITTEET: Record<
  HavaintoStatus,
  { label: string; vari: string }
> = {
  uusi: { label: "Uusi", vari: "#d97706" },
  kasittelyssa: { label: "Käsittelyssä", vari: "#2f6df6" },
  kasitelty: { label: "Käsitelty", vari: "#16a34a" },
};

export const HAVAINNOT: Havainto[] = [
  {
    id: "h1",
    otsikko: "Liukkaus havaittu",
    sijainti: "As Oy Mäntyrinne",
    aika: "08:14",
    status: "uusi",
    vakavuus: "korkea",
    tyyppi: "liukkaus",
    kuvaus:
      "Piha-alue ja sisäänkäynti A liukkaita. Hiekoitusta ei ole vielä tehty aamun sulamisen jälkeen.",
  },
  {
    id: "h2",
    otsikko: "Rikkoutunut katuvalo",
    sijainti: "Keskuskatu",
    aika: "07:52",
    status: "uusi",
    vakavuus: "normaali",
    tyyppi: "katuvalo",
    kuvaus:
      "Katuvalo ei syty pysäköintialueen kohdalla. Alue jää pimeäksi aamuvuoron aikana.",
  },
  {
    id: "h3",
    otsikko: "Vaurioitunut liikennemerkki",
    sijainti: "Kirkkokatu",
    aika: "07:21",
    status: "uusi",
    vakavuus: "normaali",
    tyyppi: "liikennemerkki",
    kuvaus:
      "Väistämisvelvollisuus-merkki taipunut ja osittain lumen peitossa. Näkyvyys heikko.",
  },
  {
    id: "h4",
    otsikko: "Aurauskaluston jälki",
    sijainti: "Koulutie 4",
    aika: "06:58",
    status: "kasittelyssa",
    vakavuus: "normaali",
    tyyppi: "muu",
    kuvaus:
      "Nurmikon reuna vaurioitunut aurauksessa. Ilmoitettu isännöitsijälle, korjaus keväällä.",
  },
  {
    id: "h5",
    otsikko: "Huonosti hiekoitettu",
    sijainti: "Rautatienkatu 12",
    aika: "06:32",
    status: "kasitelty",
    vakavuus: "normaali",
    tyyppi: "liukkaus",
    kuvaus:
      "Jalkakäytävä jäi ohuelle hiekoitukselle. Käyty lisäämässä hiekoitusta, tilanne kunnossa.",
  },
];

// Yhteenveto — todellisuudessa johdetaan tapahtumista.
export const HAVAINTO_YHTEENVETO = {
  vaatiiHuomiota: HAVAINNOT.filter((h) => h.status === "uusi").length,
  tanaan: HAVAINNOT.length,
};
