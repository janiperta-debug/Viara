"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  allekirjoitaNakyma,
  NAKYMA_COOKIE,
  type AktiivinenNakyma,
} from "@/lib/nakyma-cookie";
import { haeOmaKayttajaRooliTiukasti } from "@/lib/oma-kayttaja";
import { onViaraRooli, sallitutNakymat } from "@/lib/nakymat";

const NAKYMA_POLUT: Record<AktiivinenNakyma, string> = {
  tyo: "/tyo",
  tyonjohto: "/tyonjohto",
  asiakas: "/asiakas",
};

/**
 * Asettaa allekirjoitetun aktiivinen-näkymä-evästeen ja ohjaa valittuun näkymään.
 *
 * 1. Tarkistaa, että käyttäjä on kirjautunut ja hänellä on Viara-rooli.
 * 2. Tarkistaa, että pyydetty näkymä on käyttäjän roolille sallittu.
 * 3. Allekirjoittaa näkymän HMAC-SHA256:lla.
 * 4. Asettaa HttpOnly-evästeen.
 * 5. Ohjaa valittuun näkymään.
 */
export async function asetaNakyma(nakyma: AktiivinenNakyma) {
  const tulos = await haeOmaKayttajaRooliTiukasti();

  if (tulos.tila !== "ok") {
    redirect("/kirjaudu");
  }

  const rooli = tulos.rooli;

  if (!onViaraRooli(rooli)) {
    redirect("/kirjaudu");
  }

  // Tarkistetaan, että valittu näkymä on roolille sallittu.
  const sallitut = sallitutNakymat(rooli).map((n) => n.href);
  const kohdePolku = NAKYMA_POLUT[nakyma];
  if (!sallitut.includes(kohdePolku)) {
    redirect("/403");
  }

  const cookieStore = await cookies();
  cookieStore.set(NAKYMA_COOKIE, allekirjoitaNakyma(nakyma), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Ei max-age: eväste vanhenee selainsessioiden myötä.
    // Täsmällinen elinikä voidaan lisätä myöhemmin.
  });

  redirect(kohdePolku);
}
