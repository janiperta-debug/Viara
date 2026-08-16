// Työnjohto (supervisor) -näkymän mock-data — EI kytketty backendiin.
//
// Kaikki tämän tiedoston data on eristettyä esitystason mock-dataa.
// Myöhemmin nämä korvataan todellisilla tapahtumapohjaisilla arvoilla:
//   tapahtumat -> johdettu tila -> UI
// Pidetään mock-data erillään UI-komponenteista, jotta korvaaminen on helppoa.

// ---------------------------------------------------------------------------
// Yläpalkin KPI:t, sää ja aika
// ---------------------------------------------------------------------------

export const YLAPALKKI = {
  valmis: 8,
  tyonAlla: 4,
  avoimetHavainnot: 3,
  saa: {
    lampotila: "-5°C",
    kuvaus: "Puolipilvistä",
    lumi: "Lumi 2 cm",
  },
  paiva: "Ti 7.12.2023",
  kello: "09:32",
  ilmoitukset: 3,
};

// ---------------------------------------------------------------------------
// Urakan tilanne (Yleiskuva) — sama malli kuin kuljettajan tilannekuvassa
// ---------------------------------------------------------------------------

export const URAKKA = {
  valmisProsentti: 42,
  valmis: 4,
  kaynnissa: 1,
  aloittamatta: 5,
};

// ---------------------------------------------------------------------------
// Kuljettajat
// ---------------------------------------------------------------------------

export type KuljettajaTila = "tyossa" | "ei_tyossa";

export type Kuljettaja = {
  id: string;
  nimi: string;
  tila: KuljettajaTila;
  hoitoalueet: number;
  valmis: number;
  kaynnissa: number;
  aloittamatta: number;
};

export const KULJETTAJAT: Kuljettaja[] = [
  {
    id: "k1",
    nimi: "Ville Perta",
    tila: "tyossa",
    hoitoalueet: 6,
    valmis: 4,
    kaynnissa: 1,
    aloittamatta: 1,
  },
  {
    id: "k2",
    nimi: "Toni Virtanen",
    tila: "tyossa",
    hoitoalueet: 8,
    valmis: 5,
    kaynnissa: 2,
    aloittamatta: 1,
  },
  {
    id: "k3",
    nimi: "Matti Meikäläinen",
    tila: "ei_tyossa",
    hoitoalueet: 5,
    valmis: 0,
    kaynnissa: 0,
    aloittamatta: 5,
  },
];

// ---------------------------------------------------------------------------
// Tapahtumavirta
// ---------------------------------------------------------------------------

export type TapahtumaTyyppi =
  | "tyo_valmis"
  | "tyovaline"
  | "havainto_uusi"
  | "havainto_vastaanotettu"
  | "tyo_aloitettu";

export type Tapahtuma = {
  id: string;
  aika: string;
  otsikko: string;
  konteksti: string;
  tekija: string;
  tyyppi: TapahtumaTyyppi;
};

export const TAPAHTUMAVIRTA: Tapahtuma[] = [
  {
    id: "t1",
    aika: "09:31",
    otsikko: "As Oy Mäntyrinne",
    konteksti: "Työ valmis",
    tekija: "Ville",
    tyyppi: "tyo_valmis",
  },
  {
    id: "t2",
    aika: "09:18",
    otsikko: "Teollisuusalue A",
    konteksti: "Hiekoitin kytketty",
    tekija: "Toni",
    tyyppi: "tyovaline",
  },
  {
    id: "t3",
    aika: "08:47",
    otsikko: "Liukasilmoitus – Keskuskatu 12",
    konteksti: "Uusi havainto",
    tekija: "Asukas",
    tyyppi: "havainto_uusi",
  },
  {
    id: "t4",
    aika: "08:46",
    otsikko: "Havainto vastaanotettu",
    konteksti: "Keskuskatu 12",
    tekija: "Toni",
    tyyppi: "havainto_vastaanotettu",
  },
  {
    id: "t5",
    aika: "07:12",
    otsikko: "Keskuskatu",
    konteksti: "Työ aloitettu",
    tekija: "Ville",
    tyyppi: "tyo_aloitettu",
  },
];

// ---------------------------------------------------------------------------
// Havainnot (työnjohdon laajempi näkymä)
// ---------------------------------------------------------------------------

export type HavaintoTila = "uusi" | "kasittelyssa" | "kasitelty";

export type TyonjohtoHavainto = {
  id: string;
  otsikko: string;
  hoitoalue: string;
  tekija: string;
  aika: string;
  tila: HavaintoTila;
  kiireellinen?: boolean;
};

export const HAVAINTO_TILAT: Record<
  HavaintoTila,
  { label: string; vari: string }
> = {
  uusi: { label: "Uusi", vari: "#d97706" },
  kasittelyssa: { label: "Käsittelyssä", vari: "#2f6df6" },
  kasitelty: { label: "Käsitelty", vari: "#16a34a" },
};

export const TYONJOHTO_HAVAINNOT: TyonjohtoHavainto[] = [
  {
    id: "h1",
    otsikko: "Liukkaus havaittu",
    hoitoalue: "As Oy Mäntyrinne",
    tekija: "Ville",
    aika: "08:14",
    tila: "uusi",
    kiireellinen: true,
  },
  {
    id: "h2",
    otsikko: "Rikkoutunut katuvalo",
    hoitoalue: "Keskuskatu",
    tekija: "Asukas",
    aika: "07:52",
    tila: "kasittelyssa",
  },
  {
    id: "h3",
    otsikko: "Vaurioitunut liikennemerkki",
    hoitoalue: "Kirkkokatu",
    tekija: "Asukas",
    aika: "07:21",
    tila: "uusi",
  },
  {
    id: "h4",
    otsikko: "Aurauskaluston jälki",
    hoitoalue: "Koulutie 4",
    tekija: "Toni",
    aika: "06:58",
    tila: "kasittelyssa",
  },
  {
    id: "h5",
    otsikko: "Huonosti hiekoitettu",
    hoitoalue: "Rautatienkatu 12",
    tekija: "Ville",
    aika: "06:32",
    tila: "kasitelty",
  },
];

// ---------------------------------------------------------------------------
// Raportit
// ---------------------------------------------------------------------------

export type Raportti = {
  id: string;
  otsikko: string;
  konteksti: string;
  paiva: string;
  tila?: "valmis";
};

export const RAPORTIT: Raportti[] = [
  {
    id: "r1",
    otsikko: "Työraportti",
    konteksti: "As Oy Mäntyrinne",
    paiva: "7.12.2023",
    tila: "valmis",
  },
  {
    id: "r2",
    otsikko: "Urakkayhteenveto",
    konteksti: "Talvikunnossapito",
    paiva: "7.12.2023",
  },
  {
    id: "r3",
    otsikko: "Työraportti",
    konteksti: "Teollisuusalue A",
    paiva: "6.12.2023",
    tila: "valmis",
  },
  {
    id: "r4",
    otsikko: "Kuukausiraportti",
    konteksti: "Marraskuu 2023",
    paiva: "1.12.2023",
    tila: "valmis",
  },
];

// ---------------------------------------------------------------------------
// Hoitoalueet — sisältää OIKEAT koordinaatit (Hyvinkää) todellista karttaa
// varten. Tämä on eri asia kuin Yleiskuvan abstrakti tilannekuva.
// ---------------------------------------------------------------------------

export type HoitoalueTila = "valmis" | "tyon_alla" | "ei_aloitettu";

export type Hoitoalue = {
  id: string;
  nimi: string;
  osoite: string;
  postitoimipaikka: string;
  edistyma: number;
  tila: HoitoalueTila;
  kuljettaja: string;
  viimeisinTapahtuma: string;
  tyovalineet: string[];
  havainnot: string;
  havaintojaAvoinna: boolean;
  // Oikeat maantieteelliset koordinaatit (mock, mutta todellista geografiaa).
  lat: number;
  lng: number;
};

export const HOITOALUE_TILAT: Record<
  HoitoalueTila,
  { label: string; vari: string }
> = {
  valmis: { label: "Valmis", vari: "#16a34a" },
  tyon_alla: { label: "Työn alla", vari: "#d97706" },
  ei_aloitettu: { label: "Ei aloitettu", vari: "#6b7480" },
};

export const HOITOALUEET: Hoitoalue[] = [
  {
    id: "ha1",
    nimi: "As Oy Mäntyrinne",
    osoite: "Keskuskatu 12",
    postitoimipaikka: "05800 Hyvinkää",
    edistyma: 100,
    tila: "valmis",
    kuljettaja: "Ville",
    viimeisinTapahtuma: "Työ valmis 06:43",
    tyovalineet: ["Aura", "Hiekoitin"],
    havainnot: "1 käsitelty",
    havaintojaAvoinna: false,
    lat: 60.6305,
    lng: 24.8615,
  },
  {
    id: "ha2",
    nimi: "Keskuskatu",
    osoite: "Keskuskatu",
    postitoimipaikka: "05800 Hyvinkää",
    edistyma: 65,
    tila: "tyon_alla",
    kuljettaja: "Ville",
    viimeisinTapahtuma: "Työ aloitettu 07:12",
    tyovalineet: ["Aura"],
    havainnot: "2 avointa",
    havaintojaAvoinna: true,
    lat: 60.6321,
    lng: 24.8578,
  },
  {
    id: "ha3",
    nimi: "Teollisuusalue A",
    osoite: "Teollisuuskatu 3",
    postitoimipaikka: "05810 Hyvinkää",
    edistyma: 100,
    tila: "valmis",
    kuljettaja: "Toni",
    viimeisinTapahtuma: "Työ valmis 06:15",
    tyovalineet: ["Aura", "Hiekoitin"],
    havainnot: "Ei havaintoja",
    havaintojaAvoinna: false,
    lat: 60.6412,
    lng: 24.8689,
  },
  {
    id: "ha4",
    nimi: "Rantatie",
    osoite: "Rantatie 8",
    postitoimipaikka: "05800 Hyvinkää",
    edistyma: 20,
    tila: "tyon_alla",
    kuljettaja: "Toni",
    viimeisinTapahtuma: "Työ aloitettu 08:21",
    tyovalineet: ["Aura"],
    havainnot: "Ei havaintoja",
    havaintojaAvoinna: false,
    lat: 60.6258,
    lng: 24.8532,
  },
  {
    id: "ha5",
    nimi: "As Oy Koivikko",
    osoite: "Koivukuja 5",
    postitoimipaikka: "05820 Hyvinkää",
    edistyma: 40,
    tila: "tyon_alla",
    kuljettaja: "Ville",
    viimeisinTapahtuma: "Työ aloitettu 07:58",
    tyovalineet: ["Aura", "Hiekoitin"],
    havainnot: "1 avoin",
    havaintojaAvoinna: true,
    lat: 60.6367,
    lng: 24.8701,
  },
  {
    id: "ha6",
    nimi: "Liikekeskus Plaza",
    osoite: "Hämeenkatu 1",
    postitoimipaikka: "05800 Hyvinkää",
    edistyma: 100,
    tila: "valmis",
    kuljettaja: "Toni",
    viimeisinTapahtuma: "Työ valmis 06:30",
    tyovalineet: ["Aura", "Hiekoitin"],
    havainnot: "Ei havaintoja",
    havaintojaAvoinna: false,
    lat: 60.6289,
    lng: 24.8567,
  },
  {
    id: "ha7",
    nimi: "Satama-alue",
    osoite: "Satamakatu 20",
    postitoimipaikka: "05830 Hyvinkää",
    edistyma: 10,
    tila: "tyon_alla",
    kuljettaja: "Toni",
    viimeisinTapahtuma: "Työ aloitettu 08:05",
    tyovalineet: ["Aura"],
    havainnot: "Ei havaintoja",
    havaintojaAvoinna: false,
    lat: 60.6198,
    lng: 24.8623,
  },
  {
    id: "ha8",
    nimi: "Ydinkeskusta",
    osoite: "Torikatu",
    postitoimipaikka: "05800 Hyvinkää",
    edistyma: 0,
    tila: "ei_aloitettu",
    kuljettaja: "Ei osoitettu",
    viimeisinTapahtuma: "Suunniteltu 10:00",
    tyovalineet: [],
    havainnot: "Ei havaintoja",
    havaintojaAvoinna: false,
    lat: 60.6338,
    lng: 24.8598,
  },
];
