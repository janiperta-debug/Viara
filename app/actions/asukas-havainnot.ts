"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const TYYPIT = ["liukkaus", "auraus", "hiekoitus", "vaurio", "muu"] as const;
type HavaintoTyyppi = (typeof TYYPIT)[number];
type Tulos = { ok: true } | { ok: false; virhe: string };

/**
 * Resident observations are anonymous by design: the QR code identifies the
 * service area, not a resident account. The server still validates that the
 * service area exists before writing anything.
 */
export async function luoAsukasHavainto(input: {
  hoitoalueId: string;
  tyyppi: string;
  kuvaus: string;
}): Promise<Tulos> {
  const hoitoalueId = input.hoitoalueId.trim();
  const tyyppi = input.tyyppi.trim() as HavaintoTyyppi;
  const kuvaus = input.kuvaus.trim();

  if (!hoitoalueId) return { ok: false, virhe: "Hoitoaluetta ei löytynyt." };
  if (!TYYPIT.includes(tyyppi)) return { ok: false, virhe: "Valitse havainnon tyyppi." };
  if (!kuvaus) return { ok: false, virhe: "Kirjoita havaintoon kuvaus." };
  if (kuvaus.length > 2000) return { ok: false, virhe: "Kuvaus on liian pitkä." };

  const admin = createSupabaseAdminClient();
  const { data: alue, error: alueError } = await admin
    .from("hoitoalueet")
    .select("id")
    .eq("id", hoitoalueId)
    .maybeSingle();

  if (alueError || !alue) {
    return { ok: false, virhe: "Hoitoaluetta ei löytynyt." };
  }

  const { data: havainto, error: havaintoError } = await admin
    .from("havainnot")
    .insert({
      hoitoalue_id: hoitoalueId,
      tyyppi,
      luoja_id: null,
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
    kayttaja_id: null,
    havainto_id: havainto.id,
    tyyppi: "havainto_luotu",
    lisatiedot: { tyyppi, kuvaus, lahde: "asukasnakyma" },
  });

  if (tapahtumaError) {
    await admin.from("havainnot").delete().eq("id", havainto.id);
    return { ok: false, virhe: "Havaintoa ei voitu viimeistellä." };
  }

  revalidatePath(`/asukas/${hoitoalueId}`);
  revalidatePath(`/asukas/${hoitoalueId}/havainnot`);
  revalidatePath("/tyonjohto");
  revalidatePath("/tyonjohto/havainnot");
  return { ok: true };
}
