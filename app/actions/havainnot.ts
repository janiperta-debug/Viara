"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const TYYPIT = ["liukkaus", "auraus", "hiekoitus", "vaurio", "muu"] as const;
type HavaintoTyyppi = (typeof TYYPIT)[number];

type Tulos = { ok: true } | { ok: false; virhe: string };

export async function luoAsiakasHavainto(input: {
  hoitoalueId: string;
  tyyppi: string;
  kuvaus: string;
}): Promise<Tulos> {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, virhe: "Kirjautuminen on vanhentunut." };

  const { data: oma, error: omaError } = await supabase
    .rpc("fn_oma_kayttaja")
    .maybeSingle();
  if (omaError || !oma || typeof oma !== "object") {
    return { ok: false, virhe: "Käyttäjätietoja ei voitu tarkistaa." };
  }

  const kayttaja = oma as Record<string, unknown>;
  const kayttajaId = typeof kayttaja.id === "string" ? kayttaja.id : null;
  const rooli = typeof kayttaja.rooli === "string" ? kayttaja.rooli : null;
  const asiakkuusId = typeof kayttaja.asiakkuus_id === "string" ? kayttaja.asiakkuus_id : null;
  const organisaatioId = typeof kayttaja.organisaatio_id === "string" ? kayttaja.organisaatio_id : null;

  if (!kayttajaId || rooli !== "asiakas" || !asiakkuusId || !organisaatioId) {
    return { ok: false, virhe: "Sinulla ei ole oikeutta luoda havaintoa." };
  }

  const hoitoalueId = input.hoitoalueId.trim();
  const tyyppi = input.tyyppi.trim() as HavaintoTyyppi;
  const kuvaus = input.kuvaus.trim();

  if (!hoitoalueId) return { ok: false, virhe: "Valitse hoitoalue." };
  if (!TYYPIT.includes(tyyppi)) return { ok: false, virhe: "Valitse havainnon tyyppi." };
  if (!kuvaus) return { ok: false, virhe: "Kirjoita havaintoon kuvaus." };
  if (kuvaus.length > 2000) return { ok: false, virhe: "Kuvaus on liian pitkä." };

  const admin = createSupabaseAdminClient();
  const { data: alue, error: alueError } = await admin
    .from("hoitoalueet")
    .select("id, asiakkuus_id")
    .eq("id", hoitoalueId)
    .maybeSingle();

  if (alueError || !alue || alue.asiakkuus_id !== asiakkuusId) {
    return { ok: false, virhe: "Valittu hoitoalue ei kuulu asiakkuuteesi." };
  }

  const { data: havainto, error: havaintoError } = await admin
    .from("havainnot")
    .insert({
      hoitoalue_id: hoitoalueId,
      tyyppi,
      luoja_id: kayttajaId,
      tila: "avoin",
      lisatiedot: kuvaus,
    })
    .select("id")
    .single();

  if (havaintoError || !havainto) {
    return { ok: false, virhe: "Havaintoa ei voitu tallentaa." };
  }

  const { error: tapahtumaError } = await admin.from("tapahtumat").insert({
    hoitoalue_id: hoitoalueId,
    kayttaja_id: kayttajaId,
    havainto_id: havainto.id,
    tyyppi: "havainto_luotu",
    lisatiedot: { tyyppi, kuvaus },
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
