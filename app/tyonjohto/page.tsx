import { UrakkaSummary } from "@/components/tyonjohto/yleiskuva/urakka-summary";
import {
  KuljettajaStatus,
  type KuljettajaStatus as KuljettajaStatusTila,
} from "@/components/tyonjohto/yleiskuva/kuljettaja-status";
import { OperatiivinenKartta } from "@/components/tyonjohto/yleiskuva/operatiivinen-kartta";
import { Tapahtumavirta, type TyonjohtoTapahtuma } from "@/components/tyonjohto/yleiskuva/tapahtumavirta";
import { AvoimetHavainnot } from "@/components/tyonjohto/yleiskuva/avoimet-havainnot";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type OmaKayttaja = { organisaatio_id: string | null };

type RawTapahtuma = {
  id: string;
  aikaleima: string;
  tyyppi: TyonjohtoTapahtuma["tyyppi"];
  kayttajat: { nimi: string; organisaatio_id: string | null } | null;
  hoitoalueet: { nimi: string } | null;
  tyovalinetyypit: { nimi: string } | null;
};

type RawKuljettaja = {
  id: string;
  nimi: string;
};

type RawKuljettajaTapahtuma = {
  kayttaja_id: string;
  tyyppi: string;
  hoitoalue_id: string | null;
  tyovalinetyyppi_id: string | null;
  hoitoalueet: { nimi: string } | null;
  tyovalinetyypit: { nimi: string } | null;
};

const TYYPPI_TEKSTIT: Record<TyonjohtoTapahtuma["tyyppi"], string> = {
  tyo_valmis: "Työ valmis",
  tyovaline: "Työväline",
  havainto_uusi: "Uusi havainto",
  havainto_vastaanotettu: "Havainto vastaanotettu",
  tyo_aloitettu: "Työ aloitettu",
  tyovuoro_alkoi: "Työvuoro aloitettu",
  tyovuoro_paattyi: "Työvuoro päättynyt",
  hoitoalue_saapui: "Saapui hoitoalueelle",
  hoitoalue_poistui: "Poistui hoitoalueelta",
  tyovaline_on: "Työväline kytketty",
  tyovaline_off: "Työväline irrotettu",
  havainto_luotu: "Uusi havainto",
  havainto_otettu_tyon_alle: "Havainto otettu työn alle",
  havainto_valmis: "Havainto valmis",
  havainto_suljettu: "Havainto suljettu",
};

function muotoileAika(aikaleima: string): string {
  return new Intl.DateTimeFormat("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(aikaleima));
}

function muunnaTapahtuma(tapahtuma: RawTapahtuma): TyonjohtoTapahtuma {
  const hoitoalue = tapahtuma.hoitoalueet?.nimi;
  const tyovaline = tapahtuma.tyovalinetyypit?.nimi;
  let konteksti = hoitoalue ?? "";

  if (tyovaline) {
    konteksti = hoitoalue ? `${hoitoalue} · ${tyovaline}` : tyovaline;
  }

  if (!konteksti) konteksti = "Ei kohdetta";

  return {
    id: tapahtuma.id,
    aika: muotoileAika(tapahtuma.aikaleima),
    otsikko: TYYPPI_TEKSTIT[tapahtuma.tyyppi] ?? "Tapahtuma",
    konteksti,
    tekija: tapahtuma.kayttajat?.nimi ?? "Tuntematon käyttäjä",
    tyyppi: tapahtuma.tyyppi,
  };
}

async function haeOrganisaatioId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  const kayttaja = data as OmaKayttaja | null;
  return kayttaja?.organisaatio_id ?? null;
}

async function haeTapahtumavirta(
  organisaatioId: string,
): Promise<TyonjohtoTapahtuma[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tapahtumat")
    .select(
      "id, aikaleima, tyyppi, kayttajat!inner(nimi, organisaatio_id), hoitoalueet(nimi), tyovalinetyypit(nimi)",
    )
    .eq("kayttajat.organisaatio_id", organisaatioId)
    .order("aikaleima", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return (data as unknown as RawTapahtuma[])
    .filter(
      (tapahtuma) =>
        typeof tapahtuma.id === "string" &&
        typeof tapahtuma.aikaleima === "string" &&
        typeof tapahtuma.tyyppi === "string",
    )
    .map(muunnaTapahtuma);
}

async function haeKuljettajaTilat(
  organisaatioId: string,
): Promise<KuljettajaStatusTila[]> {
  const admin = createSupabaseAdminClient();
  const { data: kuljettajat, error: kuljettajaError } = await admin
    .from("kayttajat")
    .select("id, nimi")
    .eq("organisaatio_id", organisaatioId)
    .eq("rooli", "kuljettaja")
    .order("nimi");

  if (kuljettajaError || !kuljettajat) return [];

  const kayttajat = kuljettajat as RawKuljettaja[];
  if (kayttajat.length === 0) return [];

  const { data: tapahtumat, error: tapahtumaError } = await admin
    .from("tapahtumat")
    .select(
      "kayttaja_id, tyyppi, hoitoalue_id, tyovalinetyyppi_id, aikaleima, hoitoalueet(nimi), tyovalinetyypit(nimi)",
    )
    .in(
      "kayttaja_id",
      kayttajat.map((kayttaja) => kayttaja.id),
    )
    .in("tyyppi", ["hoitoalue_saapui", "hoitoalue_poistui", "tyovaline_on", "tyovaline_off"])
    .order("aikaleima", { ascending: false })
    .limit(1000);

  if (tapahtumaError) return [];

  const viimeisinAlue = new Map<string, RawKuljettajaTapahtuma>();
  const viimeisinTyovaline = new Map<string, Map<string, RawKuljettajaTapahtuma>>();

  for (const tapahtuma of (tapahtumat ?? []) as unknown as RawKuljettajaTapahtuma[]) {
    if (tapahtuma.tyyppi === "hoitoalue_saapui" || tapahtuma.tyyppi === "hoitoalue_poistui") {
      if (!viimeisinAlue.has(tapahtuma.kayttaja_id)) {
        viimeisinAlue.set(tapahtuma.kayttaja_id, tapahtuma);
      }
      continue;
    }

    if (!tapahtuma.tyovalinetyyppi_id) continue;

    let kayttajanValineet = viimeisinTyovaline.get(tapahtuma.kayttaja_id);
    if (!kayttajanValineet) {
      kayttajanValineet = new Map();
      viimeisinTyovaline.set(tapahtuma.kayttaja_id, kayttajanValineet);
    }

    if (!kayttajanValineet.has(tapahtuma.tyovalinetyyppi_id)) {
      kayttajanValineet.set(tapahtuma.tyovalinetyyppi_id, tapahtuma);
    }
  }

  return kayttajat.map((kayttaja) => {
    const alueTapahtuma = viimeisinAlue.get(kayttaja.id);
    const valineet = viimeisinTyovaline.get(kayttaja.id);

    const auraTapahtuma = valineet
      ? [...valineet.values()].find((tapahtuma) => tapahtuma.tyovalinetyypit?.nimi === "Aura")
      : undefined;
    const hiekoitinTapahtuma = valineet
      ? [...valineet.values()].find((tapahtuma) => tapahtuma.tyovalinetyypit?.nimi === "Hiekoitin")
      : undefined;

    return {
      id: kayttaja.id,
      nimi: kayttaja.nimi,
      tyossa: alueTapahtuma?.tyyppi === "hoitoalue_saapui",
      nykyinenHoitoalue:
        alueTapahtuma?.tyyppi === "hoitoalue_saapui"
          ? alueTapahtuma.hoitoalueet?.nimi ?? null
          : null,
      aura: auraTapahtuma ? auraTapahtuma.tyyppi === "tyovaline_on" : null,
      hiekoitin: hiekoitinTapahtuma
        ? hiekoitinTapahtuma.tyyppi === "tyovaline_on"
        : null,
    };
  });
}

export default async function YleiskuvaPage() {
  await vaadiRooli(["tyonjohto", "admin"]);
  const organisaatioId = await haeOrganisaatioId();
  const [tapahtumat, kuljettajat] = organisaatioId
    ? await Promise.all([
        haeTapahtumavirta(organisaatioId),
        haeKuljettajaTilat(organisaatioId),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-6">
      {/* Ylärivi: yhteenveto + kuljettajat */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UrakkaSummary />
        </div>
        <div className="lg:col-span-1">
          <KuljettajaStatus kuljettajat={kuljettajat} />
        </div>
      </div>

      {/* Keskirivi: operatiivinen kartta + avoimet havainnot */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OperatiivinenKartta />
        </div>
        <div className="lg:col-span-1">
          <AvoimetHavainnot />
        </div>
      </div>

      {/* Alarivi: oikea tapahtumavirta organisaation tapahtumista */}
      <Tapahtumavirta tapahtumat={tapahtumat} />
    </div>
  );
}
