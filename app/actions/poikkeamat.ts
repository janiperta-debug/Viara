"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Tulos = { ok: true } | { ok: false; virhe: string };

export async function luoPoikkeama(input: { hoitoalueId: string; kuvaus: string }): Promise<Tulos> {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, virhe: "Kirjautuminen on vanhentunut." };

  const { data: oma, error: omaError } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  if (omaError || !oma || typeof oma !== "object") return { ok: false, virhe: "Käyttäjätietoja ei voitu tarkistaa." };
  const kayttaja = oma as Record<string, unknown>;
  const kayttajaId = typeof kayttaja.id === "string" ? kayttaja.id : null;
  const rooli = typeof kayttaja.rooli === "string" ? kayttaja.rooli : null;
  const organisaatioId = typeof kayttaja.organisaatio_id === "string" ? kayttaja.organisaatio_id : null;
  if (!kayttajaId || !organisaatioId || !["kuljettaja", "tyonjohto", "admin"].includes(rooli ?? "")) return { ok: false, virhe: "Sinulla ei ole oikeutta ilmoittaa poikkeamasta." };

  const hoitoalueId = input.hoitoalueId.trim();
  const kuvaus = input.kuvaus.trim();
  if (!hoitoalueId) return { ok: false, virhe: "Poikkeamalle ei ole valittu hoitoaluetta." };
  if (!kuvaus) return { ok: false, virhe: "Kirjoita poikkeamasta kuvaus." };
  if (kuvaus.length > 2000) return { ok: false, virhe: "Kuvaus on liian pitkä." };

  const admin = createSupabaseAdminClient();
  const { data: alue, error: alueError } = await admin.from("hoitoalueet").select("id, asiakkuudet!inner(organisaatio_id)").eq("id", hoitoalueId).maybeSingle();
  if (alueError || !alue) return { ok: false, virhe: "Hoitoaluetta ei löytynyt." };
  const asiakkuus = alue.asiakkuudet as unknown as { organisaatio_id: string };
  if (asiakkuus?.organisaatio_id !== organisaatioId) return { ok: false, virhe: "Hoitoalue ei kuulu organisaatioosi." };

  const { error } = await admin.from("tapahtumat").insert({
    hoitoalue_id: hoitoalueId,
    kayttaja_id: kayttajaId,
    tyyppi: "poikkeama_luotu",
    lisatiedot: { kuvaus },
  });
  if (error) return { ok: false, virhe: "Poikkeamaa ei voitu tallentaa." };

  revalidatePath("/tyo");
  revalidatePath("/tyonjohto");
  return { ok: true };
}
