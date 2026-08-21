import { createSupabaseServerClient } from "@/lib/supabase-server";

export type ProfiiliTiedot = {
  nimi: string;
  email: string;
  rooli: string;
  rooliLabel: string;
  initiaalit: string;
};

// Esitysdata varalta, jos backend ei vielä palauta kaikkia kenttiä.
// Ei uutta tietokantarakennetta — vain fallback UI:ta varten.
const MOCK: ProfiiliTiedot = {
  nimi: "Jani Perta",
  email: "nimi@yritys.fi",
  rooli: "kuljettaja",
  rooliLabel: "Kuljettaja",
  initiaalit: "JP",
};

const ROOLI_LABELIT: Record<string, string> = {
  kuljettaja: "Kuljettaja",
  esimies: "Esimies",
  yllapitaja: "Ylläpitäjä",
  admin: "Ylläpitäjä",
};

function initiaaleista(nimi: string): string {
  const osat = nimi.trim().split(/\s+/).filter(Boolean);
  if (osat.length === 0) return "?";
  if (osat.length === 1) return osat[0].slice(0, 2).toUpperCase();
  return (osat[0][0] + osat[osat.length - 1][0]).toUpperCase();
}

function roolinLabel(rooli: string): string {
  return ROOLI_LABELIT[rooli.toLowerCase()] ?? rooli;
}

/**
 * Selvittää kirjautuneen Viara-käyttäjän tiedot olemassa olevan
 * arkkitehtuurin kautta (Supabase Auth + fn_oma_kayttaja).
 * Palauttaa esitysdatan varalta, jos kenttiä ei ole saatavilla.
 */
export async function haeOmaKayttaja(): Promise<ProfiiliTiedot> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: rawKayttaja } = await supabase
      .rpc("fn_oma_kayttaja")
      .maybeSingle();

    // Luetaan kentät väljästi — vain id ja rooli ovat varmasti olemassa.
    const kayttaja = (rawKayttaja ?? {}) as Record<string, unknown>;

    const nimi =
      typeof kayttaja.nimi === "string" && kayttaja.nimi.trim()
        ? (kayttaja.nimi as string)
        : MOCK.nimi;

    const email =
      user?.email ??
      (typeof kayttaja.email === "string" ? (kayttaja.email as string) : null) ??
      MOCK.email;

    const rooli =
      typeof kayttaja.rooli === "string" && kayttaja.rooli.trim()
        ? (kayttaja.rooli as string)
        : MOCK.rooli;

    return {
      nimi,
      email,
      rooli,
      rooliLabel: roolinLabel(rooli),
      initiaalit: initiaaleista(nimi),
    };
  } catch {
    // Jos backend ei ole käytettävissä, näytetään esitysdata.
    return MOCK;
  }
}

export async function haeOmaKayttajaRooli(): Promise<string | null> {
  const tulos = await haeOmaKayttajaRooliTiukasti();
  return tulos.tila === "ok" ? tulos.rooli : null;
}

type OmaKayttajaRooliTulos =
  | { tila: "ok"; rooli: string }
  | { tila: "unauthenticated" }
  | { tila: "role_lookup_failed" };

export async function haeOmaKayttajaRooliTiukasti(): Promise<OmaKayttajaRooliTulos> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return { tila: "role_lookup_failed" };
    }

    if (!user) {
      return { tila: "unauthenticated" };
    }

    const { data: rawKayttaja, error: kayttajaError } = await supabase
      .rpc("fn_oma_kayttaja")
      .maybeSingle();

    if (kayttajaError) {
      return { tila: "role_lookup_failed" };
    }

    if (!rawKayttaja || typeof rawKayttaja !== "object") {
      return { tila: "role_lookup_failed" };
    }

    const kayttaja = rawKayttaja as Record<string, unknown>;
    if (typeof kayttaja.rooli !== "string" || !kayttaja.rooli.trim()) {
      return { tila: "role_lookup_failed" };
    }

    return { tila: "ok", rooli: kayttaja.rooli };
  } catch {
    return { tila: "role_lookup_failed" };
  }
}
