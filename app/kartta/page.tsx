import { TopBar } from "@/components/dashboard/top-bar";
import { TilanneVisualisointi } from "@/components/kartta/tilanne-visualisointi";
import { URAKAN_TILANNE } from "@/lib/urakka-mock";
import { vaadiRooli } from "@/lib/reitti-suojaus";

const SELITE = [
  { vari: "#16a34a", label: "Valmis", maara: URAKAN_TILANNE.valmis },
  { vari: "#d97706", label: "Käynnissä", maara: URAKAN_TILANNE.kaynnissa },
  { vari: "#dc2626", label: "Aloittamatta", maara: URAKAN_TILANNE.aloittamatta },
];

export default async function KarttaPage() {
  await vaadiRooli(["kuljettaja", "tyonjohto", "admin"]);

  const { valmisProsentti } = URAKAN_TILANNE;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar notifications={3} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-6 pt-2 md:max-w-2xl md:gap-7 md:px-8 md:pt-4 lg:max-w-3xl lg:px-10 lg:pt-6">
        {/* Yhteenveto */}
        <section aria-labelledby="urakan-tilanne-otsikko">
          <p
            id="urakan-tilanne-otsikko"
            className="px-1 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Urakan tilanne
          </p>
          <div className="mt-1 flex items-baseline gap-2 px-1">
            <span className="text-4xl font-bold text-foreground md:text-5xl">
              {valmisProsentti} %
            </span>
            <span className="text-base font-medium text-muted">valmis</span>
          </div>

          {/* Edistymäpalkki */}
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

        {/* Selite */}
        <section aria-label="Selite" className="flex flex-wrap gap-2">
          {SELITE.map(({ vari, label, maara }) => (
            <div
              key={label}
              className="metal-card flex items-center gap-2 rounded-full px-3.5 py-2"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: vari }}
                aria-hidden
              />
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
              <span className="text-sm font-semibold text-muted">{maara}</span>
            </div>
          ))}
        </section>

        {/* Abstrakti tilannekuva */}
        <section aria-label="Urakan tilannekuva" className="metal-card rounded-3xl p-5 md:p-7">
          <TilanneVisualisointi />
          <p className="mt-3 text-center text-xs text-muted text-balance">
            Kuvaaja esittää urakan edistymistä — ei todellista karttaa.
          </p>
        </section>
      </main>
    </div>
  );
}
