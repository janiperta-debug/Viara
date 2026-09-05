import { haeOmaKayttaja } from "@/lib/oma-kayttaja";
import { haeOmaOrganisaatioId, haeTyonjohtoHavainnot } from "@/lib/tyonjohto-havainnot";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { muotoileViaraKellonaika, muotoileViaraPaivamaara } from "@/lib/viara-aika";

export type TyonjohtoYlapalkki = {
  valmis: number;
  tyonAlla: number;
  avoimetHavainnot: number;
  nimi: string;
  initiaalit: string;
  kello: string;
  paiva: string;
};

type RawAlue = { id: string };

async function haeUrakkaTilanne(organisaatioId: string) {
  const admin = createSupabaseAdminClient();
  const { data: alueet } = await admin
    .from("hoitoalueet")
    .select("id, asiakkuudet!inner(organisaatio_id)")
    .eq("asiakkuudet.organisaatio_id", organisaatioId);

  const ids = (alueet ?? []).map((alue) => (alue as RawAlue).id);
  if (ids.length === 0) {
    return { valmis: 0, tyonAlla: 0 };
  }

  const { data: tapahtumat } = await admin
    .from("tapahtumat")
    .select("hoitoalue_id, tyyppi, aikaleima")
    .in("hoitoalue_id", ids)
    .in("tyyppi", ["tyo_aloitettu", "tyo_valmis"])
    .order("aikaleima", { ascending: false });

  const viimeiset = new Map<string, string>();
  for (const tapahtuma of tapahtumat ?? []) {
    if (tapahtuma.hoitoalue_id && !viimeiset.has(tapahtuma.hoitoalue_id)) {
      viimeiset.set(tapahtuma.hoitoalue_id, tapahtuma.tyyppi);
    }
  }

  let valmis = 0;
  let tyonAlla = 0;
  for (const id of ids) {
    const tila = viimeiset.get(id);
    if (tila === "tyo_valmis") valmis++;
    else if (tila === "tyo_aloitettu") tyonAlla++;
  }

  return { valmis, tyonAlla };
}

export async function haeTyonjohtoYlapalkki(): Promise<TyonjohtoYlapalkki> {
  const [kayttaja, organisaatioId] = await Promise.all([
    haeOmaKayttaja(),
    haeOmaOrganisaatioId(),
  ]);

  if (!organisaatioId) {
    return {
      valmis: 0,
      tyonAlla: 0,
      avoimetHavainnot: 0,
      nimi: kayttaja.nimi,
      initiaalit: kayttaja.initiaalit,
      kello: muotoileViaraKellonaika(new Date()),
      paiva: muotoileViaraPaivamaara(new Date()),
    };
  }

  const [urakka, havainnot] = await Promise.all([
    haeUrakkaTilanne(organisaatioId),
    haeTyonjohtoHavainnot(organisaatioId),
  ]);

  const avoimetHavainnot = havainnot.filter(
    (havainto) => havainto.tila === "avoin" || havainto.tila === "tyon_alla",
  ).length;

  const nyt = new Date();
  return {
    valmis: urakka.valmis,
    tyonAlla: urakka.tyonAlla,
    avoimetHavainnot,
    nimi: kayttaja.nimi,
    initiaalit: kayttaja.initiaalit,
    kello: muotoileViaraKellonaika(nyt),
    paiva: muotoileViaraPaivamaara(nyt),
  };
}
