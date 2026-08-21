import { createSupabaseServerClient } from "@/lib/supabase-server";
import { haeOmaKayttaja } from "@/lib/oma-kayttaja";

type ViaraKayttaja = {
  id: string;
};

type TapahtumaRivi = {
  tyyppi: string;
  hoitoalue_id: string | null;
  tyovalinetyyppi_id: string | null;
  aikaleima: string;
};

type Hoitoalue = {
  id: string;
  nimi: string;
};

export type TyoTila = {
  kayttajaNimi: string;
  tyoKaynnissa: boolean | null;
  tyovalineet: {
    aura: boolean | null;
    hiekoitin: boolean | null;
  };
  nykyinenHoitoalue: Hoitoalue | null;
};

export async function haeNykyinenTyoTila(): Promise<TyoTila> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Käyttäjä ei ole kirjautunut.");
  }

  const { data: rawKayttaja, error: kayttajaError } = await supabase
    .rpc("fn_oma_kayttaja")
    .maybeSingle();

  const kayttaja = rawKayttaja as ViaraKayttaja | null;

  if (kayttajaError || !kayttaja) {
    throw new Error("Viara-käyttäjää ei löytynyt.");
  }

  const [profiili, tyovalineTapahtumat, hoitoalueTapahtuma, tyoTapahtuma] =
    await Promise.all([
      haeOmaKayttaja(),
      supabase
        .from("tapahtumat")
        .select("tyyppi, tyovalinetyyppi_id, aikaleima")
        .eq("kayttaja_id", kayttaja.id)
        .in("tyyppi", ["tyovaline_on", "tyovaline_off"])
        .in("tyovalinetyyppi_id", ["aura", "hiekoitin"])
        .order("aikaleima", { ascending: false }),
      supabase
        .from("tapahtumat")
        .select("tyyppi, hoitoalue_id, aikaleima")
        .eq("kayttaja_id", kayttaja.id)
        .in("tyyppi", ["hoitoalue_saapui", "hoitoalue_poistui"])
        .order("aikaleima", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("tapahtumat")
        .select("tyyppi, aikaleima")
        .eq("kayttaja_id", kayttaja.id)
        .in("tyyppi", ["tyo_aloitettu", "tyo_lopetettu"])
        .order("aikaleima", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (tyovalineTapahtumat.error) {
    throw new Error(tyovalineTapahtumat.error.message);
  }
  if (hoitoalueTapahtuma.error) {
    throw new Error(hoitoalueTapahtuma.error.message);
  }
  if (tyoTapahtuma.error) {
    throw new Error(tyoTapahtuma.error.message);
  }

  const tyovalineRows = (tyovalineTapahtumat.data ?? []) as Pick<
    TapahtumaRivi,
    "tyyppi" | "tyovalinetyyppi_id" | "aikaleima"
  >[];
  const viimeisinAura = tyovalineRows.find((r) => r.tyovalinetyyppi_id === "aura");
  const viimeisinHiekoitin = tyovalineRows.find(
    (r) => r.tyovalinetyyppi_id === "hiekoitin"
  );

  const aura = viimeisinAura
    ? viimeisinAura.tyyppi === "tyovaline_on"
    : null;
  const hiekoitin = viimeisinHiekoitin
    ? viimeisinHiekoitin.tyyppi === "tyovaline_on"
    : null;

  const tyoKaynnissa =
    tyoTapahtuma.data?.tyyppi === "tyo_aloitettu"
      ? true
      : tyoTapahtuma.data?.tyyppi === "tyo_lopetettu"
        ? false
        : null;

  let nykyinenHoitoalue: Hoitoalue | null = null;

  if (
    hoitoalueTapahtuma.data?.tyyppi === "hoitoalue_saapui" &&
    hoitoalueTapahtuma.data.hoitoalue_id
  ) {
    const { data: hoitoalue, error: hoitoalueError } = await supabase
      .from("hoitoalueet")
      .select("id, nimi")
      .eq("id", hoitoalueTapahtuma.data.hoitoalue_id)
      .maybeSingle();

    if (hoitoalueError) {
      throw new Error(hoitoalueError.message);
    }

    if (hoitoalue) {
      nykyinenHoitoalue = hoitoalue as Hoitoalue;
    }
  }

  return {
    kayttajaNimi: profiili.nimi,
    tyoKaynnissa,
    tyovalineet: {
      aura,
      hiekoitin,
    },
    nykyinenHoitoalue,
  };
}
