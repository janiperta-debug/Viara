import { redirect } from "next/navigation";
import { haeOmaKayttajaRooliTiukasti } from "@/lib/oma-kayttaja";

const ROOLIT = ["kuljettaja", "tyonjohto", "asiakas", "admin"] as const;
type Rooli = (typeof ROOLIT)[number];

function onRooli(arvo: string): arvo is Rooli {
  return ROOLIT.includes(arvo as Rooli);
}

export async function vaadiRooli(sallitutRoolit: Rooli[]) {
  const tulos = await haeOmaKayttajaRooliTiukasti();

  if (tulos.tila === "unauthenticated") {
    redirect("/kirjaudu");
  }

  if (tulos.tila !== "ok") {
    redirect("/valitse");
  }

  const rooli = tulos.rooli;

  if (!onRooli(rooli) || !sallitutRoolit.includes(rooli)) {
    redirect("/valitse");
  }

  return rooli;
}
