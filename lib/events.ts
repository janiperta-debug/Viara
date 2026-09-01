import { createSupabaseServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { tarkistaNakymaCookie, NAKYMA_COOKIE } from "@/lib/nakyma-cookie";

type KirjaaTapahtumaInput = {
  tyyppi: string;
  hoitoalueId?: string;
  kalustoId?: string;
  tyovalinetyyppiId?: string;
  havaintoId?: string;
  lisatiedot?: Record<string, unknown>;
  gps?: {
    lat: number;
    lng: number;
  };
};

type ViaraKayttaja = {
  id: string;
};

type Tapahtuma = {
  id: string;
  aikaleima: string;
  hoitoalue_id: string | null;
  kayttaja_id: string;
  kalusto_id: string | null;
  tyovalinetyyppi_id: string | null;
  havainto_id: string | null;
  tyyppi: string;
  lisatiedot: Record<string, unknown>;
  gps_lat: number | null;
  gps_lng: number | null;
  luotu: string;
};

export async function kirjaaTapahtuma({
  tyyppi,
  hoitoalueId,
  kalustoId,
  tyovalinetyyppiId,
  havaintoId,
  lisatiedot,
  gps,
}: KirjaaTapahtumaInput) {
  // Tarkistetaan allekirjoitettu näkymäeväste ennen mitään tietokantaoperaatiota.
  // Tapahtumat saa kirjata vain, kun aktiivinen näkymä on "tyo".
  const cookieStore = await cookies();
  const nakyma = tarkistaNakymaCookie(cookieStore.get(NAKYMA_COOKIE)?.value);
  if (nakyma !== "tyo") {
    return {
      success: false,
      error:
        "Työskentelytapahtumia voi kirjata vain Työ-näkymässä (aktiivinen näkymä ei ole 'tyo').",
    };
  }

  const supabase = await createSupabaseServerClient();

  // Selvitetään kirjautunut käyttäjä Supabase Authista
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Kirjautunutta käyttäjää ei löytynyt:",
      userError
    );

    return {
      success: false,
      error: "Käyttäjä ei ole kirjautunut.",
    };
  }

  // Selvitetään kirjautunutta Auth-käyttäjää vastaava Viara-käyttäjä
  const { data: rawKayttaja, error: kayttajaError } = await supabase
    .rpc("fn_oma_kayttaja")
    .maybeSingle();

  const kayttaja = rawKayttaja as ViaraKayttaja | null;

  if (kayttajaError || !kayttaja) {
    console.error(
      "Viaran käyttäjää ei löytynyt:",
      kayttajaError
    );

    return {
      success: false,
      error: "Viara-käyttäjää ei löytynyt.",
    };
  }

  const { data: rawData, error } = await supabase
    .from("tapahtumat")
    .insert({
      tyyppi,
      kayttaja_id: kayttaja.id,
      hoitoalue_id: hoitoalueId ?? null,
      kalusto_id: kalustoId ?? null,
      tyovalinetyyppi_id: tyovalinetyyppiId ?? null,
      havainto_id: havaintoId ?? null,
      lisatiedot: lisatiedot ?? {},
      gps_lat: gps?.lat ?? null,
      gps_lng: gps?.lng ?? null,
    })
    .select()
    .single();

  const data = rawData as Tapahtuma | null;

  if (error) {
    console.error(
      "Tapahtuman kirjaaminen epäonnistui:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    tapahtuma: data,
  };
}