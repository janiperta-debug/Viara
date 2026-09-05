import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { muotoileViaraAika } from "@/lib/viara-aika";

export type TyonjohtoRaportti = {
  id: string;
  tyyppi: "tyon_suoritus" | "poikkeamat" | "tapahtumat";
  otsikko: string;
  kuvaus: string;
  aika: string;
  tapahtumia: number;
  valmis: boolean;
};

type RawTapahtuma = {
  id: string;
  aikaleima: string;
  hoitoalue_id: string | null;
  kayttaja_id: string | null;
  tyyppi: string;
  hoitoalueet: { nimi: string } | null;
  kayttajat: { nimi: string } | null;
};

function ryhmittelePaivittain(tapahtumat: RawTapahtuma[]) {
  const ryhmat = new Map<string, RawTapahtuma[]>();
  for (const tapahtuma of tapahtumat) {
    const paiva = muotoileViaraAika(tapahtuma.aikaleima, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const nykyinen = ryhmat.get(paiva) ?? [];
    nykyinen.push(tapahtuma);
    ryhmat.set(paiva, nykyinen);
  }
  return ryhmat;
}

export async function haeTyonjohtoRaportit(organisaatioId: string): Promise<TyonjohtoRaportti[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tapahtumat")
    .select("id, aikaleima, hoitoalue_id, kayttaja_id, tyyppi, hoitoalueet(nimi), kayttajat(nimi, organisaatio_id)")
    .eq("kayttajat.organisaatio_id", organisaatioId)
    .order("aikaleima", { ascending: false })
    .limit(2000);

  if (error || !data) return [];

  const tapahtumat = data as unknown as RawTapahtuma[];
  const ryhmat = ryhmittelePaivittain(tapahtumat);
  const raportit: TyonjohtoRaportti[] = [];

  for (const [paiva, paivanTapahtumat] of ryhmat) {
    const tyot = paivanTapahtumat.filter((t) => t.tyyppi === "tyo_aloitettu" || t.tyyppi === "tyo_valmis");
    const poikkeamat = paivanTapahtumat.filter((t) => t.tyyppi === "poikkeama_luotu" || t.tyyppi === "poikkeama_ratkaistu");

    raportit.push({
      id: `tyon_suoritus-${paiva}`,
      tyyppi: "tyon_suoritus",
      otsikko: "Työn suoritus",
      kuvaus: `${new Set(tyot.map((t) => t.hoitoalue_id).filter(Boolean)).size} hoitoaluetta · ${tyot.length} työtapahtumaa`,
      aika: paiva,
      tapahtumia: tyot.length,
      valmis: tyot.length > 0,
    });

    if (poikkeamat.length > 0) {
      raportit.push({
        id: `poikkeamat-${paiva}`,
        tyyppi: "poikkeamat",
        otsikko: "Poikkeamat",
        kuvaus: `${new Set(poikkeamat.map((t) => t.hoitoalue_id).filter(Boolean)).size} hoitoaluetta · ${poikkeamat.length} tapahtumaa`,
        aika: paiva,
        tapahtumia: poikkeamat.length,
        valmis: true,
      });
    }

    raportit.push({
      id: `tapahtumat-${paiva}`,
      tyyppi: "tapahtumat",
      otsikko: "Tapahtumahistoria",
      kuvaus: `${paivanTapahtumat.length} tapahtumaa kaikista työn tapahtumista`,
      aika: paiva,
      tapahtumia: paivanTapahtumat.length,
      valmis: paivanTapahtumat.length > 0,
    });
  }

  return raportit.slice(0, 30);
}
