import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { haeAsiakasTiedot } from "@/lib/asiakas-data";

export default async function AsiakasYleiskuvaPage() {
  const tiedot = await haeAsiakasTiedot();

  if (!tiedot) {
    return <VirheNakyma />;
  }

  if (!tiedot.asiakkuusId) {
    return <EiAsiakkuutta />;
  }

  const alueet = tiedot.alueet;
  const valmis = alueet.filter((alue) => alue.tila === "valmis").length;
  const tyonAlla = alueet.filter((alue) => alue.tila === "tyon_alla").length;
  const valmisProsentti = alueet.length === 0 ? 0 : Math.round((valmis / alueet.length) * 100);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-sm text-muted">{tiedot.asiakkuusNimi}</p>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Oma kokonaisuus
        </h1>
        <p className="mt-1 text-base text-muted">
          Missä kunnossa kohteesi ovat juuri nyt?
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <section aria-labelledby="tilanne-otsikko" className="flex flex-col gap-4">
          <h2 id="tilanne-otsikko" className="text-xs font-semibold uppercase tracking-wider text-muted">
            Hoidon tilanne
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tilasto luku={alueet.length} teksti="Hoitoaluetta" />
            <Tilasto luku={`${valmisProsentti} %`} teksti="Valmis" vari="#16a34a" />
            <Tilasto luku={tyonAlla} teksti="Työn alla" vari="#d97706" />
            <Tilasto luku="–" teksti="Avointa havaintoa" vari="#c0392b" />
          </div>
        </section>

        <section aria-labelledby="edistyma-otsikko" className="metal-card rounded-3xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 id="edistyma-otsikko" className="text-xs font-semibold uppercase tracking-wider text-muted">
              Kokonaisuuden edistymä
            </h2>
            <span className="text-lg font-bold text-foreground">{valmisProsentti} % valmis</span>
          </div>
          <div className="mt-5 h-4 w-full overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full bg-green-600 transition-all"
              style={{ width: `${valmisProsentti}%` }}
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            Edistymä perustuu hoitoalueiden todellisiin työn aloitus- ja valmistumistapahtumiin.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted">
            <Selite vari="#16a34a" teksti="Valmis" />
            <Selite vari="#d97706" teksti="Työn alla" />
            <Selite vari="#dc2626" teksti="Aloittamatta" />
          </div>
        </section>
      </div>

      <section aria-labelledby="alueet-otsikko" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="alueet-otsikko" className="text-xs font-semibold uppercase tracking-wider text-muted">
            Hoitoalueet
          </h2>
          <Link href="/asiakas/hoitoalueet" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Näytä kaikki
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {alueet.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alueet.slice(0, 6).map((alue) => (
              <li key={alue.id}>
                <Link
                  href="/asiakas/hoitoalueet"
                  className="metal-card flex flex-col gap-2 rounded-2xl p-4 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{alue.nimi}</p>
                      <p className="truncate text-sm text-muted">{alue.osoite ?? "Ei osoitetta"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                      <span className={`h-2 w-2 rounded-full ${alue.tila === "valmis" ? "bg-green-600" : alue.tila === "tyon_alla" ? "bg-amber-600" : "bg-red-600"}`} aria-hidden />
                      {tilanimi(alue.tila)}
                    </span>
                    <span className="text-xs font-semibold text-foreground">{alue.edistyma} %</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="metal-card rounded-2xl p-5 text-sm text-muted">
            Asiakkuudelle ei ole vielä määritetty hoitoalueita.
          </p>
        )}
      </section>
    </div>
  );
}

function tilanimi(tila: "valmis" | "tyon_alla" | "aloittamatta") {
  if (tila === "valmis") return "Valmis";
  if (tila === "tyon_alla") return "Työn alla";
  return "Aloittamatta";
}

function Tilasto({ luku, teksti, vari }: { luku: string | number; teksti: string; vari?: string }) {
  return (
    <div className="metal-card flex flex-col gap-1 rounded-2xl p-4">
      <span className="text-2xl font-bold text-foreground md:text-3xl" style={vari ? { color: vari } : undefined}>{luku}</span>
      <span className="text-sm text-muted">{teksti}</span>
    </div>
  );
}

function Selite({ vari, teksti }: { vari: string; teksti: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: vari }} aria-hidden />
      {teksti}
    </span>
  );
}

function EiAsiakkuutta() {
  return (
    <div className="metal-card rounded-3xl p-6">
      <h1 className="text-xl font-bold text-foreground">Asiakasnäkymä</h1>
      <p className="mt-2 text-sm text-muted">
        Käyttäjälle ei ole vielä määritetty asiakkuutta. Pyydä organisaation työnjohtoa liittämään käyttäjä oikeaan asiakkuuteen.
      </p>
    </div>
  );
}

function VirheNakyma() {
  return (
    <div className="metal-card rounded-3xl p-6">
      <h1 className="text-xl font-bold text-foreground">Asiakasnäkymää ei voitu avata</h1>
      <p className="mt-2 text-sm text-muted">Oman käyttäjän tai asiakkuuden tietojen lukeminen epäonnistui.</p>
    </div>
  );
}
