"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const TYYPIT = ["liukkaus", "auraus", "hiekoitus", "vaurio", "muu"] as const;
type HavaintoTyyppi = (typeof TYYPIT)[number];
type HavaintoTila = "avoin" | "tyon_alla" | "valmis" | "suljettu";
type Tulos = { ok: true } | { ok: false; virhe: string };

async function haeNykyinenKayttaja() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: oma, error } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  if (error || !oma || typeof oma !== "object") return null;
  const kayttaja = oma as Record<string, unknown>;
  const id = typeof kayttaja.id === "string" ? kayttaja.id : null;
  const rooli = typeof kayttaja.rooli === "string" ? kayttaja.rooli : null;
  const organisaatioId = typeof kayttaja.organisaatio_id === "string" ? kayttaja.organisaatio_id : null;
  return id && rooli && organisaatioId ? { id, rooli, organisaatioId } : null;
}

export async function luoAsiakasHavainto(input: { hoitoalueId: string; tyyppi: string; kuvaus: string }): Promise<Tulos> {
  const supabase = await createSupabaseServerClient();
  const kayttaja = await haeNykyinenKayttaja();
  if (!kayttaja) return { ok: false, virhe: "Kirjautuminen on vanhentunut." };

  const { data: oma } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  const asiakkuusId = oma && typeof oma === "object" && typeof (oma as Record<string, unknown>).asiakkuus_id === "string"
    ? (oma as Record<string, string>).asiakkuus_id
    : null;
  if (kayttaja.rooli !== "asiakas" || !asiakkuusId) return { ok: false, virhe: "Sinulla ei ole oikeutta luoda havaintoa." };

  const hoitoalueId = input.hoitoalueId.trim();
  const tyyppi = input.tyyppi.trim() as HavaintoTyyppi;
  const kuvaus = input.kuvaus.trim();
  if (!hoitoalueId) return { ok: false, virhe: "Valitse hoitoalue." };
  if (!TYYPIT.includes(tyyppi)) return { ok: false, virhe: "Valitse havainnon tyyppi." };
  if (!kuvaus) return { ok: false, virhe: "Kirjoita havaintoon kuvaus." };
  if (kuvaus.length > 2000) return { ok: false, virhe: "Kuvaus on liian pitkä." };

  const admin = createSupabaseAdminClient();
  const { data: alue, error: alueError } = await admin.from("hoitoalueet").select("id, asiakkuus_id").eq("id", hoitoalueId).maybeSingle();
  if (alueError || !alue || alue.asiakkuus_id !== asiakkuusId) return { ok: false, virhe: "Valittu hoitoalue ei kuulu asiakkuuteesi." };

  const { data: havainto, error: havaintoError } = await admin.from("havainnot").insert({
    hoitoalue_id: hoitoalueId, tyyppi, luoja_id: kayttaja.id, tila: "avoin", lisatiedot: kuvaus,
  }).select("id").single();
  if (havaintoError || !havainto) return { ok: false, virhe: "Havaintoa ei voitu tallentaa." };

  const { error: tapahtumaError } = await admin.from("tapahtumat").insert({
    hoitoalue_id: hoitoalueId, kayttaja_id: kayttaja.id, havainto_id: havainto.id, tyyppi: "havainto_luotu", lisatiedot: { tyyppi, kuvaus },
  });
  if (tapahtumaError) {
    await admin.from("havainnot").delete().eq("id", havainto.id);
    return { ok: false, virhe: "Havaintoa ei voitu viimeistellä." };
  }

  revalidatePath("/asiakas/havainnot");
  revalidatePath("/tyonjohto");
  revalidatePath("/tyonjohto/havainnot");
  revalidatePath("/havainnot");
  return { ok: true };
}

export async function paivitaHavaintoTila(input: { havaintoId: string; tila: HavaintoTila }): Promise<Tulos> {
  const kayttaja = await haeNykyinenKayttaja();
  if (!kayttaja || !["kuljettaja", "tyonjohto", "admin"].includes(kayttaja.rooli)) {
    return { ok: false, virhe: "Sinulla ei ole oikeutta käsitellä havaintoja." };
  }

  const havaintoId = input.havaintoId.trim();
  const uusiTila = input.tila;
  if (!havaintoId || !["avoin", "tyon_alla", "valmis", "suljettu"].includes(uusiTila)) {
    return { ok: false, virhe: "Virheellinen havainto tai tila." };
  }

  const admin = createSupabaseAdminClient();
  const { data: havainto, error } = await admin.from("havainnot").select(
    "id, hoitoalue_id, tila, hoitoalueet!inner(asiakkuudet!inner(organisaatio_id))",
  ).eq("id", havaintoId).maybeSingle();
  if (error || !havainto) return { ok: false, virhe: "Havaintoa ei löytynyt." };

  const alueData = havainto.hoitoalueet as unknown as { asiakkuudet: { organisaatio_id: string } };
  if (alueData.asiakkuudet?.organisaatio_id !== kayttaja.organisaatioId) {
    return { ok: false, virhe: "Havainto ei kuulu organisaatioosi." };
  }

  const nykyinenTila = havainto.tila as HavaintoTila;
  const seuraavat: Record<HavaintoTila, HavaintoTila[]> = {
    avoin: ["tyon_alla"],
    tyon_alla: ["valmis"],
    valmis: ["suljettu"],
    suljettu: [],
  };
  if (!seuraavat[nykyinenTila].includes(uusiTila)) {
    return { ok: false, virhe: "Havaintoa ei voi siirtää tähän tilaan." };
  }
  if (uusiTila === "suljettu" && kayttaja.rooli !== "tyonjohto" && kayttaja.rooli !== "admin") {
    return { ok: false, virhe: "Vain työnjohto voi sulkea havainnon." };
  }

  const update = uusiTila === "tyon_alla"
    ? { tila: uusiTila, vastuuhenkilo_id: kayttaja.id }
    : { tila: uusiTila };

  const { data: paivitetty, error: paivitysError } = await admin.from("havainnot")
    .update(update)
    .eq("id", havaintoId)
    .eq("tila", nykyinenTila)
    .select("id")
    .maybeSingle();
  if (paivitysError || !paivitetty) return { ok: false, virhe: "Havainto muuttui juuri toisessa käsittelyssä. Päivitä näkymä." };

  const tapahtumaTyyppi = {
    tyon_alla: "havainto_otettu_tyon_alle",
    valmis: "havainto_valmis",
    suljettu: "havainto_suljettu",
  }[uusiTila] as "havainto_otettu_tyon_alle" | "havainto_valmis" | "havainto_suljettu";

  const { error: tapahtumaError } = await admin.from("tapahtumat").insert({
    hoitoalue_id: havainto.hoitoalue_id,
    kayttaja_id: kayttaja.id,
    havainto_id: havaintoId,
    tyyppi: tapahtumaTyyppi,
    lisatiedot: { edellinen_tila: nykyinenTila, uusi_tila: uusiTila },
  });
  if (tapahtumaError) return { ok: false, virhe: "Tila muuttui, mutta tapahtumaa ei voitu kirjata." };

  revalidatePath("/asiakas/havainnot");
  revalidatePath("/tyonjohto/havainnot");
  revalidatePath("/tyonjohto");
  revalidatePath("/havainnot");
  return { ok: true };
}
