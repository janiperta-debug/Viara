import { createHmac, timingSafeEqual } from "crypto";

/**
 * Aktiivisen näkymän allekirjoitettu eväste.
 *
 * Evästeen arvo: `<nakyma>.<hmac-sha256-hex>`
 *
 * Allekirjoitus tehdään HMAC-SHA256:lla ympäristömuuttujassa
 * VIARA_NAKYMA_SECRET määritellyllä salaisuudella.
 * Palvelin hylkää arvot, joissa allekirjoitus ei täsmää.
 *
 * Rajoitus (dokumentoitu): eväste on jaettu kaikkien saman
 * selaimen välilehtien kesken. Viimeksi asetettu näkymä
 * on voimassa kaikilla välilehdillä samanaikaisesti.
 */

export const NAKYMA_COOKIE = "viara_nakyma";

export type AktiivinenNakyma = "tyo" | "tyonjohto" | "asiakas";

const SALLITUT_NAKYMAT = new Set<string>(["tyo", "tyonjohto", "asiakas"]);

function haeSecret(): string {
  const secret = process.env.VIARA_NAKYMA_SECRET;
  if (!secret) {
    throw new Error(
      "Ympäristömuuttuja VIARA_NAKYMA_SECRET puuttuu. " +
        "Aseta se ennen sovelluksen käynnistämistä."
    );
  }
  return secret;
}

function laskeHmac(nakyma: string, secret: string): string {
  return createHmac("sha256", secret).update(nakyma).digest("hex");
}

/** Luo allekirjoitetun evästeen arvon annetulle näkymälle. */
export function allekirjoitaNakyma(nakyma: AktiivinenNakyma): string {
  const secret = haeSecret();
  const hmac = laskeHmac(nakyma, secret);
  return `${nakyma}.${hmac}`;
}

/**
 * Tarkistaa evästeen arvon allekirjoituksen ja palauttaa näkymän.
 * Palauttaa null, jos arvo on virheellinen tai allekirjoitus ei täsmää.
 */
export function tarkistaNakymaCookie(
  cookieArvo: string | undefined
): AktiivinenNakyma | null {
  if (!cookieArvo) return null;

  const pisteSijanti = cookieArvo.lastIndexOf(".");
  if (pisteSijanti === -1) return null;

  const nakyma = cookieArvo.slice(0, pisteSijanti);
  const annettuHmac = cookieArvo.slice(pisteSijanti + 1);

  if (!SALLITUT_NAKYMAT.has(nakyma)) return null;

  let secret: string;
  try {
    secret = haeSecret();
  } catch {
    return null;
  }

  const odotettuHmac = laskeHmac(nakyma, secret);

  // Käytetään ajoitusturvallista vertailua sivukanavahyökkäyksiä vastaan.
  try {
    const a = Buffer.from(annettuHmac, "utf8");
    const b = Buffer.from(odotettuHmac, "utf8");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return nakyma as AktiivinenNakyma;
}
