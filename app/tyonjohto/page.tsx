import { UrakkaSummary } from "@/components/tyonjohto/yleiskuva/urakka-summary";
import { OperatiivinenKartta } from "@/components/tyonjohto/yleiskuva/operatiivinen-kartta";
import { KuljettajaStatus } from "@/components/tyonjohto/yleiskuva/kuljettaja-status";
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

async function haeTapahtumavirta(): Promise<TyonjohtoTapahtuma[]> {
  const supabase = await createSupabaseServerClient();
  const { data: omaKayttaja } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  const kayttaja = omaKayttaja as OmaKayttaja | null;
  const organisaatioId = kayttaja?.organisaatio_id ?? null;

  if (!organisaatioId) return [];

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tapahtumat")
    .select(
      "id, aikaleima, tyyppi, kayttajat!inner(nimi, organisaatio_id), hoitoalueet(nimi), tyovalinetyypit(nimi)"
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
        typeof tapahtuma.tyyppi === "string"
    )
    .map(muunnaTapahtuma);
}

export default async function YleiskuvaPage() {
  await vaadiRooli(["tyonjohto", "admin"]);
  const tapahtumat = await haeTapahtumavirta();

  return (
    <div className="flex flex-col gap-6">
      {/* Ylärivi: yhteenveto + kuljettajat */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UrakkaSummary />
        </div>
        <div className="lg:col-span-1">
          <KuljettajaStatus />
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
