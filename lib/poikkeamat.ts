import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type Poikkeama = {
  id: string;
  hoitoalueId: string;
  hoitoalueNimi: string;
  hoitoalueOsoite: string | null;
  kuvaus: string;
  aikaleima: string;
  tekija: string;
  tekijaRooli: string;
};

type PoikkeamaTapahtuma = {
  id: string;
  hoitoalue_id: string;
  kayttaja_id: string | null;
  tyyppi: string;
  lisatiedot: unknown;
  aikaleima: string;
};

type Kayttaja = { id: string; nimi: string; rooli: string };

type Alue = {
  id: string;
  nimi: string;
  osoite: string | null;
  asiakkuudet: { organisaatio_id: string } | null;
};

function rooliLabel(rooli: string | null | undefined) {
  if (rooli === "kuljettaja") return "Kuljettaja";
  if (rooli === "tyonjohto") return "Työnjohto";
  if (rooli === "asiakas") return "Asiakas";
  if (rooli === "asukas") return "Asukas";
  if (rooli === "admin") return "Ylläpito";
  return "Käyttäjä";
}

function poimiKuvaus(lisatiedot: unknown) {
  if (typeof lisatiedot === "string" && lisatiedot.trim()) return lisatiedot.trim();
  if (lisatiedot && typeof lisatiedot === "object") {
    const kuvaus = (lisatiedot as Record<string, unknown>).kuvaus;
    if (typeof kuvaus === "string" && kuvaus.trim()) return kuvaus.trim();
  }
  return "Poikkeamasta ei ole kuvausta.";
}

function viimeisinPoikkeamaTapahtuma(tapahtumat: PoikkeamaTapahtuma[]) {
  const viimeiset = new Map<string, PoikkeamaTapahtuma>();
  for (const tapahtuma of tapahtumat) {
    if (!viimeiset.has(tapahtuma.hoitoalue_id)) viimeiset.set(tapahtuma.hoitoalue_id, tapahtuma);
  }
  return viimeiset;
}

export async function haeAktiivisetPoikkeamatOrganisaatiolle(
  organisaatioId: string,
): Promise<Poikkeama[]> {
  const admin = createSupabaseAdminClient();
  const { data: alueet, error: alueError } = await admin
    .from("hoitoalueet")
    .select("id, nimi, osoite, asiakkuudet!inner(organisaatio_id)")
    .eq("asiakkuudet.organisaatio_id", organisaatioId);

  if (alueError || !alueet || alueet.length === 0) return [];
  return haeAktiivisetPoikkeamatAlueilta(admin, alueet as unknown as Alue[]);
}

export async function haeAktiivisetPoikkeamatAsiakkuudelle(
  asiakkuusId: string,
): Promise<Poikkeama[]> {
  const admin = createSupabaseAdminClient();
  const { data: alueet, error } = await admin
    .from("hoitoalueet")
    .select("id, nimi, osoite, asiakkuudet!inner(organisaatio_id)")
    .eq("asiakkuus_id", asiakkuusId);

  if (error || !alueet || alueet.length === 0) return [];
  return haeAktiivisetPoikkeamatAlueilta(admin, alueet as unknown as Alue[]);
}

async function haeAktiivisetPoikkeamatAlueilta(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  alueet: Alue[],
): Promise<Poikkeama[]> {
  const alueIds = alueet.map((alue) => alue.id);
  const alueMap = new Map(alueet.map((alue) => [alue.id, alue]));

  const { data: tapahtumat, error } = await admin
    .from("tapahtumat")
    .select("id, hoitoalue_id, kayttaja_id, tyyppi, lisatiedot, aikaleima")
    .in("hoitoalue_id", alueIds)
    .in("tyyppi", ["poikkeama_luotu", "poikkeama_ratkaistu"])
    .order("aikaleima", { ascending: false });

  if (error || !tapahtumat) return [];

  const viimeiset = viimeisinPoikkeamaTapahtuma(tapahtumat as PoikkeamaTapahtuma[]);
  const aktiiviset = Array.from(viimeiset.values()).filter(
    (tapahtuma) => tapahtuma.tyyppi === "poikkeama_luotu",
  );
  if (aktiiviset.length === 0) return [];

  const kayttajaIds = Array.from(
    new Set(aktiiviset.map((tapahtuma) => tapahtuma.kayttaja_id).filter((id): id is string => Boolean(id))),
  );
  const kayttajaMap = new Map<string, Kayttaja>();

  if (kayttajaIds.length > 0) {
    const { data: kayttajat } = await admin
      .from("kayttajat")
      .select("id, nimi, rooli")
      .in("id", kayttajaIds);
    for (const kayttaja of kayttajat ?? []) kayttajaMap.set(kayttaja.id, kayttaja);
  }

  return aktiiviset
    .flatMap((tapahtuma) => {
      const alue = alueMap.get(tapahtuma.hoitoalue_id);
      if (!alue) return [];
      const tekija = tapahtuma.kayttaja_id ? kayttajaMap.get(tapahtuma.kayttaja_id) : undefined;
      return [{
        id: tapahtuma.id,
        hoitoalueId: tapahtuma.hoitoalue_id,
        hoitoalueNimi: alue.nimi,
        hoitoalueOsoite: alue.osoite,
        kuvaus: poimiKuvaus(tapahtuma.lisatiedot),
        aikaleima: tapahtuma.aikaleima,
        tekija: tekija?.nimi ?? "Tuntematon käyttäjä",
        tekijaRooli: rooliLabel(tekija?.rooli),
      }];
    })
    .sort((a, b) => new Date(b.aikaleima).getTime() - new Date(a.aikaleima).getTime());
}
