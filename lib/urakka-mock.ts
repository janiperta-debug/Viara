// Abstrakti urakan tilannekuva — EI maantieteellistä dataa.
//
// Tämä on KIINTEÄ visuaalinen malli, joka pysyy rakenteellisesti samana
// riippumatta siitä, kuinka monta oikeaa hoitoaluetta kuljettajalla on.
// Myöhemmin todellinen tapahtumadata määrittää vain vyöhykkeiden statuksen:
//   tapahtumat -> johdettu edistymä -> vyöhykkeiden statukset
// Tässä vaiheessa kaikki arvot ovat mock-dataa.

export type VyohykeStatus = "valmis" | "kaynnissa" | "aloittamatta";

export type Vyohyke = {
  id: string;
  // Kiinteät sijainnit abstraktissa 320x320 -näkymässä (ei karttakoordinaatteja).
  x: number;
  y: number;
  status: VyohykeStatus;
};

export type Yhteys = [string, string];

// Kiinteä 10 vyöhykkeen verkosto — sama jokaiselle kuljettajalle.
export const VYOHYKKEET: Vyohyke[] = [
  { id: "a", x: 62, y: 72, status: "valmis" },
  { id: "b", x: 144, y: 50, status: "valmis" },
  { id: "c", x: 226, y: 82, status: "aloittamatta" },
  { id: "d", x: 272, y: 156, status: "aloittamatta" },
  { id: "e", x: 208, y: 182, status: "aloittamatta" },
  { id: "f", x: 132, y: 150, status: "kaynnissa" },
  { id: "g", x: 54, y: 162, status: "valmis" },
  { id: "h", x: 92, y: 244, status: "valmis" },
  { id: "i", x: 176, y: 252, status: "aloittamatta" },
  { id: "j", x: 252, y: 244, status: "aloittamatta" },
];

// Kiinteät yhteydet vyöhykkeiden välillä (visuaalinen verkosto).
export const YHTEYDET: Yhteys[] = [
  ["a", "b"],
  ["b", "c"],
  ["c", "d"],
  ["d", "e"],
  ["e", "f"],
  ["f", "g"],
  ["g", "a"],
  ["f", "b"],
  ["f", "i"],
  ["i", "j"],
  ["j", "e"],
  ["h", "g"],
  ["h", "i"],
];

// Mock-yhteenveto. Todellisuudessa tämä johdetaan tapahtumista.
export const URAKAN_TILANNE = {
  valmisProsentti: 42,
  valmis: 4,
  kaynnissa: 1,
  aloittamatta: 5,
};
