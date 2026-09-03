import { TopBar } from "@/components/dashboard/top-bar";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { vaadiRooli } from "@/lib/reitti-suojaus";

type Tila = "valmis" | "kaynnissa" | "aloittamatta";

type Hoitoalue = {
  id: string;
};

type Tapahtuma = {
  hoitoalue_id: string | null;
  tyyppi: string;
  aikaleima: string;
};

async function haeTilanne(): Promise<Record<Tila, number>> {
  const supabase = await createSupabaseServerClient();
  const { data: omaKayttaja } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  const organisaatioId =
    omaKayttaja &&
    typeof (omaKayttaja as { organisaatio_id?: unknown }).organisaatio_id === "string"
      ? (omaKayttaja as { organisaatio_id: string }).organisaatio_id
      : null;

  if (!organisaatioId) {
    return { valmis: 0, kaynnissa: 0, aloittamatta: 0 };
  }

  const admin = createSupabaseAdminClient();
  const { data: hoitoalueet } = await admin
    .from("hoitoalueet")
    .select("id, asiakkuudet!inner(organisaatio_id)")
    .eq("asiakkuudet.organisaatio_id", organisaatioId);

  const alueet = (hoitoalueet ?? []) as unknown as Hoitoalue[];
  if (alueet.length === 0) {
    return { valmis: 0, kaynnissa: 0, aloittamatta: 0 };
  }

  const alueIdt = alueet.map((alue) => alue.id);
  const { data: tapahtumat } = await admin
    .from("tapahtumat")
    .select("hoitoalue_id, tyyppi, aikaleima")
    .in("hoitoalue_id", alueIdt)
    .in("tyyppi", ["tyo_aloitettu", "tyo_valmis"])
    .order("aikaleima", { ascending: false });

  const viimeisin = new Map<string, Tapahtuma>();
  for (const tapahtuma of (tapahtumat ?? []) as Tapahtuma[]) {
    if (tapahtuma.hoitoalue_id && !viimeisin.has(tapahtuma.hoitoalue_id)) {
      viimeisin.set(tapahtuma.hoitoalue_id, tapahtuma);
    }
  }

  const tulos: Record<Tila, number> = {
    valmis: 0,
    kaynnissa: 0,
    aloittamatta: 0,
  };

  for (const alue of alueet) {
    const tapahtuma = viimeisin.get(alue.id);
    if (tapahtuma?.tyyppi === "tyo_valmis") {
      tulos.valmis += 1;
    } else if (tapahtuma?.tyyppi === "tyo_aloitettu") {
      tulos.kaynnissa += 1;
    } else {
      tulos.aloittamatta += 1;
    }
  }

  return tulos;
}

export default async function KarttaPage() {
  const rooli = await vaadiRooli(["kuljettaja", "tyonjohto", "admin"]);
  const tila = await haeTilanne();
  const hoitoalueita = tila.valmis + tila.kaynnissa + tila.aloittamatta;
  const valmisProsentti =
    hoitoalueita > 0 ? Math.round((tila.valmis / hoitoalueita) * 100) : 0;

  const selite = [
    { vari: "#16a34a", label: "Valmis", maara: tila.valmis },
    { vari: "#d97706", label: "Käynnissä", maara: tila.kaynnissa },
    { vari: "#dc2626", label: "Aloittamatta", maara: tila.aloittamatta },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar notifications={3} rooli={rooli} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-6 pt-2 md:max-w-2xl md:gap-7 md:px-8 md:pt-4 lg:max-w-3xl lg:px-10 lg:pt-6">
        <section aria-labelledby="urakan-tilanne-otsikko">
          <p
            id="urakan-tilanne-otsikko"
            className="px-1 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Työn operatiivinen kartta
          </p>
          <div className="mt-1 flex items-baseline gap-2 px-1">
            <span className="text-4xl font-bold text-foreground md:text-5xl">
              {valmisProsentti} %
            </span>
            <span className="text-base font-medium text-muted">valmis</span>
          </div>

          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-black/10"
            role="progressbar"
            aria-valuenow={valmisProsentti}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Urakka ${valmisProsentti} % valmis`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${valmisProsentti}%` }}
            />
          </div>
        </section>

        <section aria-label="Selite" className="flex flex-wrap gap-2">
          {selite.map(({ vari, label, maara }) => (
            <div
              key={label}
              className="metal-card flex items-center gap-2 rounded-full px-3.5 py-2"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: vari }}
                aria-hidden
              />
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-sm font-semibold text-muted">{maara}</span>
            </div>
          ))}
        </section>

        <section aria-label="Työn operatiivinen kartta" className="metal-card rounded-3xl p-5 md:p-7">
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/images/tyon-operatiivinen-tilannekuva.webp"
              alt="Työn operatiivinen tilannekuva"
              width={768}
              height={768}
              className="h-auto w-full"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted text-balance">
            Tilannekuvan luvut perustuvat organisaation hoitoalueiden viimeisimpiin tapahtumiin.
          </p>
        </section>
      </main>
    </div>
  );
}
