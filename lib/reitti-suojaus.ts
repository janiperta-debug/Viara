import { forbidden, redirect } from "next/navigation";
import { haeOmaKayttajaRooli } from "@/lib/oma-kayttaja";

const ROOLIT = ["kuljettaja", "tyonjohto", "asiakas", "admin"] as const;
type Rooli = (typeof ROOLIT)[number];

function onRooli(arvo: string): arvo is Rooli {
  return ROOLIT.includes(arvo as Rooli);
}

export async function vaadiRooli(sallitutRoolit: Rooli[]) {
  const rooli = await haeOmaKayttajaRooli();

  if (!rooli) {
    redirect("/kirjaudu");
  }

  if (!onRooli(rooli) || !sallitutRoolit.includes(rooli)) {
    forbidden();
  }

  return rooli;
}
