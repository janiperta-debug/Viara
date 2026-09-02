"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { haeOmaKayttajaRooliTiukasti } from "@/lib/oma-kayttaja";

type HallintaRooli = "admin" | "tyonjohto";
type KayttajaRooli = "kuljettaja" | "tyonjohto";

export type KayttajaHallintaTulos =
  | { ok: true; kayttajaId: string; authUserId: string }
  | { ok: false; virhe: string };

async function haeOmaHallintaTiedot(): Promise<
  | { ok: true; rooli: HallintaRooli; kayttajaId: string; organisaatioId: string | null }
  | { ok: false; virhe: string }
> {
  const rooliTulos = await haeOmaKayttajaRooliTiukasti();
  if (rooliTulos.tila !== "ok") {
    return { ok: false, virhe: "Kirjautuminen ei ole voimassa." };
  }

  if (rooliTulos.rooli !== "admin" && rooliTulos.rooli !== "tyonjohto") {
    return { ok: false, virhe: "Sinulla ei ole oikeutta käyttäjähallintaan." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();

  if (error || !data || typeof data !== "object") {
    return { ok: false, virhe: "Oman käyttäjän tietoja ei voitu lukea." };
  }

  const kayttaja = data as Record<string, unknown>;
  if (typeof kayttaja.id !== "string") {
    return { ok: false, virhe: "Oman käyttäjän tunnistetta ei voitu lukea." };
  }

  const organisaatioId =
    typeof kayttaja.organisaatio_id === "string" ? kayttaja.organisaatio_id : null;

  if (rooliTulos.rooli === "tyonjohto" && !organisaatioId) {
    return { ok: false, virhe: "Käyttäjällä ei ole organisaatiota." };
  }

  return { ok: true, rooli: rooliTulos.rooli, kayttajaId: kayttaja.id, organisaatioId };
}

function validoiSahkoposti(email: string): string | null {
  const value = email.trim().toLowerCase();
  if (!value || !value.includes("@") || value.length > 320) return null;
  return value;
}

function validoiNimi(nimi: string): string | null {
  const value = nimi.trim();
  if (!value || value.length > 200) return null;
  return value;
}

function validoiSalasana(salasana: string): string | null {
  if (salasana.length < 8 || salasana.length > 200) return null;
  return salasana;
}

export async function luoOrganisaatioJaEnsimmainenTyonjohto(input: {
  organisaationNimi: string;
  nimi: string;
  email: string;
  salasana: string;
}): Promise<KayttajaHallintaTulos & { organisaatioId?: string }> {
  const hallinta = await haeOmaHallintaTiedot();
  if (!hallinta.ok || hallinta.rooli !== "admin") {
    return { ok: false, virhe: "Vain Viara-admin voi luoda organisaatioita." };
  }

  const organisaationNimi = input.organisaationNimi.trim();
  const nimi = validoiNimi(input.nimi);
  const email = validoiSahkoposti(input.email);
  const salasana = validoiSalasana(input.salasana);

  if (!organisaationNimi || organisaationNimi.length > 200) {
    return { ok: false, virhe: "Organisaation nimi ei kelpaa." };
  }
  if (!nimi) return { ok: false, virhe: "Nimi ei kelpaa." };
  if (!email) return { ok: false, virhe: "Sähköpostiosoite ei kelpaa." };
  if (!salasana) return { ok: false, virhe: "Salasanan tulee olla vähintään 8 merkkiä." };

  const admin = createSupabaseAdminClient();
  let organisaatioId: string | null = null;
  let authUserId: string | null = null;

  try {
    const { data: organisaatio, error: organisaatioError } = await admin
      .from("organisaatiot")
      .insert({ nimi: organisaationNimi })
      .select("id")
      .single();

    if (organisaatioError || !organisaatio) {
      return { ok: false, virhe: "Organisaation luonti epäonnistui." };
    }
    organisaatioId = organisaatio.id;

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: salasana,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      if (organisaatioId) {
        await admin.from("organisaatiot").delete().eq("id", organisaatioId);
      }
      return { ok: false, virhe: authError?.message ?? "Auth-käyttäjän luonti epäonnistui." };
    }
    authUserId = authData.user.id;

    const { data: kayttaja, error: kayttajaError } = await admin
      .from("kayttajat")
      .insert({
        auth_user_id: authUserId,
        nimi,
        rooli: "tyonjohto",
        organisaatio_id: organisaatioId,
      })
      .select("id")
      .single();

    if (kayttajaError || !kayttaja) {
      if (authUserId) await admin.auth.admin.deleteUser(authUserId);
      if (organisaatioId) {
        await admin.from("organisaatiot").delete().eq("id", organisaatioId);
      }
      return { ok: false, virhe: "Viara-käyttäjän luonti epäonnistui." };
    }

    return { ok: true, kayttajaId: kayttaja.id, authUserId, organisaatioId };
  } catch {
    if (authUserId) await admin.auth.admin.deleteUser(authUserId).catch(() => undefined);
    if (organisaatioId) await admin.from("organisaatiot").delete().eq("id", organisaatioId);
    return { ok: false, virhe: "Käyttäjän luonnissa tapahtui odottamaton virhe." };
  }
}

export async function luoOrganisaationKayttaja(input: {
  nimi: string;
  email: string;
  salasana: string;
  rooli: KayttajaRooli;
}): Promise<KayttajaHallintaTulos> {
  const hallinta = await haeOmaHallintaTiedot();
  if (!hallinta.ok || hallinta.rooli !== "tyonjohto" || !hallinta.organisaatioId) {
    return { ok: false, virhe: "Vain organisaation työnjohto voi lisätä käyttäjiä." };
  }

  if (input.rooli !== "kuljettaja" && input.rooli !== "tyonjohto") {
    return { ok: false, virhe: "Vain kuljettajan tai työnjohdon voi lisätä." };
  }

  const nimi = validoiNimi(input.nimi);
  const email = validoiSahkoposti(input.email);
  const salasana = validoiSalasana(input.salasana);
  if (!nimi) return { ok: false, virhe: "Nimi ei kelpaa." };
  if (!email) return { ok: false, virhe: "Sähköpostiosoite ei kelpaa." };
  if (!salasana) return { ok: false, virhe: "Salasanan tulee olla vähintään 8 merkkiä." };

  const admin = createSupabaseAdminClient();
  let authUserId: string | null = null;

  try {
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: salasana,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return { ok: false, virhe: authError?.message ?? "Auth-käyttäjän luonti epäonnistui." };
    }
    authUserId = authData.user.id;

    const { data: kayttaja, error: kayttajaError } = await admin
      .from("kayttajat")
      .insert({
        auth_user_id: authUserId,
        nimi,
        rooli: input.rooli,
        organisaatio_id: hallinta.organisaatioId,
      })
      .select("id")
      .single();

    if (kayttajaError || !kayttaja) {
      if (authUserId) await admin.auth.admin.deleteUser(authUserId);
      return { ok: false, virhe: "Viara-käyttäjän luonti epäonnistui." };
    }

    return { ok: true, kayttajaId: kayttaja.id, authUserId };
  } catch {
    if (authUserId) await admin.auth.admin.deleteUser(authUserId).catch(() => undefined);
    return { ok: false, virhe: "Käyttäjän luonnissa tapahtui odottamaton virhe." };
  }
}

export async function nostaKuljettajaTyonjohdoksi(
  kayttajaId: string
): Promise<{ ok: true } | { ok: false; virhe: string }> {
  const hallinta = await haeOmaHallintaTiedot();
  if (!hallinta.ok || hallinta.rooli !== "tyonjohto" || !hallinta.organisaatioId) {
    return { ok: false, virhe: "Vain organisaation työnjohto voi muuttaa rooleja." };
  }

  if (!kayttajaId || kayttajaId === hallinta.kayttajaId) {
    return { ok: false, virhe: "Käyttäjää ei voi muuttaa tällä toiminnolla." };
  }

  const admin = createSupabaseAdminClient();
  const { data: kohde, error: hakuError } = await admin
    .from("kayttajat")
    .select("id, rooli, organisaatio_id")
    .eq("id", kayttajaId)
    .maybeSingle();

  if (hakuError || !kohde) return { ok: false, virhe: "Käyttäjää ei löytynyt." };
  if (kohde.organisaatio_id !== hallinta.organisaatioId) {
    return { ok: false, virhe: "Käyttäjä ei kuulu omaan organisaatioosi." };
  }
  if (kohde.rooli !== "kuljettaja") {
    return { ok: false, virhe: "Vain kuljettajan voi nostaa työnjohdoksi." };
  }

  const { error } = await admin
    .from("kayttajat")
    .update({ rooli: "tyonjohto" })
    .eq("id", kayttajaId)
    .eq("organisaatio_id", hallinta.organisaatioId)
    .eq("rooli", "kuljettaja");

  if (error) return { ok: false, virhe: "Roolin muuttaminen epäonnistui." };
  return { ok: true };
}
