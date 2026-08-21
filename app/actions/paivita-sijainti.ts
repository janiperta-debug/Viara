"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { etsiHoitoalue } from "@/app/actions/etsi-hoitoalue";
import { kirjaaTapahtuma } from "@/lib/events";

type PaivitaSijaintiInput = {
  lat: number;
  lng: number;
};

type ViaraKayttaja = {
  id: string;
};

export async function paivitaSijainti({
  lat,
  lng,
}: PaivitaSijaintiInput) {
  const kelvollinenLat =
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90;
  const kelvollinenLng =
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180;

  if (!kelvollinenLat || !kelvollinenLng) {
    return {
      success: false,
      error: "Virheelliset koordinaatit.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Käyttäjä ei ole kirjautunut.",
    };
  }

  // Selvitetään Viaran käyttäjä
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
      error: "Viaran käyttäjää ei löytynyt.",
    };
  }

  // Selvitetään nykyinen hoitoalue GPS-sijainnin perusteella
  const alueTulos = await etsiHoitoalue({
    lat,
    lng,
  });

  if (!alueTulos.success) {
    return alueTulos;
  }

  const nykyinenHoitoalueId =
    alueTulos.hoitoalue?.id ?? null;

  // Haetaan viimeisin hoitoalueeseen liittyvä tapahtuma
  const { data: viimeisin, error: viimeisinError } =
    await supabase
      .from("tapahtumat")
      .select("tyyppi, hoitoalue_id, aikaleima")
      .eq("kayttaja_id", kayttaja.id)
      .in("tyyppi", [
        "hoitoalue_saapui",
        "hoitoalue_poistui",
      ])
      .order("aikaleima", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (viimeisinError) {
    console.error(
      "Viimeisimmän hoitoaluetapahtuman hakeminen epäonnistui:",
      viimeisinError
    );

    return {
      success: false,
      error: viimeisinError.message,
    };
  }

  const viimeisinHoitoalueId =
    viimeisin?.tyyppi === "hoitoalue_saapui"
      ? viimeisin.hoitoalue_id
      : null;

  // Ei muutosta sijainnissa.
  // Esimerkiksi GPS antaa uuden sijainnin minuutin välein,
  // mutta käyttäjä on edelleen samalla hoitoalueella.
  if (
    nykyinenHoitoalueId &&
    nykyinenHoitoalueId === viimeisinHoitoalueId
  ) {
    return {
      success: true,
      muutos: false,
      hoitoalue: alueTulos.hoitoalue,
    };
  }

  // Käyttäjä oli alueella ja on nyt poistunut sieltä.
  if (
    !nykyinenHoitoalueId &&
    viimeisinHoitoalueId
  ) {
    const poistuminen = await kirjaaTapahtuma({
      tyyppi: "hoitoalue_poistui",
      hoitoalueId: viimeisinHoitoalueId,
      gps: {
        lat,
        lng,
      },
    });

    if (!poistuminen.success) {
      return poistuminen;
    }

    return {
      success: true,
      muutos: true,
      tapahtuma: poistuminen.tapahtuma,
      hoitoalue: null,
    };
  }

  // Käyttäjä siirtyi suoraan alueelta toiselle.
  // Ensin kirjataan vanhalta alueelta poistuminen.
  if (
    nykyinenHoitoalueId &&
    viimeisinHoitoalueId &&
    nykyinenHoitoalueId !== viimeisinHoitoalueId
  ) {
    const poistuminen = await kirjaaTapahtuma({
      tyyppi: "hoitoalue_poistui",
      hoitoalueId: viimeisinHoitoalueId,
      gps: {
        lat,
        lng,
      },
    });

    if (!poistuminen.success) {
      return poistuminen;
    }
  }

  // Käyttäjä saapui uudelle alueelle.
  if (nykyinenHoitoalueId) {
    const saapuminen = await kirjaaTapahtuma({
      tyyppi: "hoitoalue_saapui",
      hoitoalueId: nykyinenHoitoalueId,
      gps: {
        lat,
        lng,
      },
    });

    if (!saapuminen.success) {
      return saapuminen;
    }

    return {
      success: true,
      muutos: true,
      tapahtuma: saapuminen.tapahtuma,
      hoitoalue: alueTulos.hoitoalue,
    };
  }

  return {
    success: true,
    muutos: false,
    hoitoalue: null,
  };
}