"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type ViaraKayttaja = {
  rooli: string;
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

  return {
    success: true,
    rooli: kayttaja.rooli,
  };
}