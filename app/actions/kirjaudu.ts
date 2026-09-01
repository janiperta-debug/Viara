"use server";

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  allekirjoitaNakyma,
  NAKYMA_COOKIE,
  type AktiivinenNakyma,
} from "@/lib/nakyma-cookie";

type ViaraKayttaja = {
  rooli: string;
};

/** Roolit, joille näkymä määräytyy suoraan kirjautumisessa (ei /valitse-sivua). */
const ROOLI_NAKYMA: Partial<Record<string, AktiivinenNakyma>> = {
  kuljettaja: "tyo",
  asiakas: "asiakas",
};

export async function kirjaudu(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      success: false,
      error: "Sähköposti ja salasana vaaditaan.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Kirjautuminen epäonnistui:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  // Selvitetään kirjautunutta Auth-käyttäjää vastaava Viara-käyttäjä
  const { data: rawKayttaja, error: kayttajaError } = await supabase
    .rpc("fn_oma_kayttaja")
    .maybeSingle();

  const kayttaja = rawKayttaja as ViaraKayttaja | null;

  if (kayttajaError || !kayttaja) {
    console.error(
      "Kirjautuneen käyttäjän Viara-tietoja ei löytynyt:",
      kayttajaError
    );

    return {
      success: false,
      error: "Käyttäjän Viara-tietoja ei löytynyt.",
    };
  }

  // Asetetaan allekirjoitettu näkymäeväste roolille, joka menee suoraan
  // näkymään ilman /valitse-sivua (kuljettaja → tyo, asiakas → asiakas).
  // tyonjohto ja admin valitsevat näkymän itse /valitse-sivulla.
  const suoraNakyma = ROOLI_NAKYMA[kayttaja.rooli];
  if (suoraNakyma) {
    try {
      const cookieStore = await cookies();
      cookieStore.set(NAKYMA_COOKIE, allekirjoitaNakyma(suoraNakyma), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    } catch {
      // VIARA_NAKYMA_SECRET puuttuu kehitysympäristössä; ei estetä kirjautumista.
      console.error(
        "Näkymäevästeen asetus epäonnistui – tarkista VIARA_NAKYMA_SECRET."
      );
    }
  }

  return {
    success: true,
    rooli: kayttaja.rooli,
  };
}