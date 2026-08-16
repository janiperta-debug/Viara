import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TilanneVisualisointi } from "@/components/kartta/tilanne-visualisointi";
import {
  ASIAKAS,
  YHTEENVETO,
  HOITOALUEET,
  TILA_MAARITTEET,
  avoimetHavainnotAlueelle,
} from "@/lib/asiakas-mock";

export default function AsiakasYleiskuvaPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Otsikko */}
      <header>
        <p className="text-sm text-muted">{ASIAKAS.organisaatio}</p>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Oma kokonaisuus
        </h1>
        <p className="mt-1 text-base text-muted">
          Missä kunnossa kohteesi ovat juuri nyt?
        </p>
      </header>

      {/* Hoidon tilanne + edistymä */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <section aria-labelledby="tilanne-otsikko" className="flex flex-col gap-4">
          <h2
            id="tilanne-otsikko"
            className="text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Hoidon tilanne
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tilasto luku={YHTEENVETO.hoitoalueet} teksti="Hoitoaluetta" />
            <Tilasto
              luku={`${YHTEENVETO.valmisProsentti} %`}
              teksti="Valmis"
              vari="#16a34a"
            />
            <Tilasto
              luku={YHTEENVETO.tyonAlla}
              teksti="Työn alla"
              vari="#d97706"
            />
            <Tilasto
              luku={YHTEENVETO.avoimetHavainnot}
              teksti="Avointa havaintoa"
              vari="#c0392b"
            />
          </div>
        </section>

        {/* Abstrakti edistymä */}
        <section
          aria-labelledby="edistyma-otsikko"
          className="metal-card rounded-3xl p-5"
        >
          <div className="flex items-baseline justify-between">
            <h2
              id="edistyma-otsikko"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Kokonaisuuden edistymä
            </h2>
            <span className="text-lg font-bold text-foreground">
              {YHTEENVETO.valmisProsentti} % valmis
            </span>
          </div>
          <div className="mx-auto mt-3 max-w-[240px]">
            <TilanneVisualisointi />
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Kuvaaja esittää oman kokonaisuutesi edistymää — ei todellista
            karttaa.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted">
            <Selite vari="#16a34a" teksti="Valmis" />
            <Selite vari="#d97706" teksti="Käynnissä" />
            <Selite vari="#dc2626" teksti="Aloittamatta" />
          </div>
        </section>
      </div>

      {/* Hoitoalueiden esikatselu */}
      <section aria-labelledby="alueet-otsikko" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2
            id="alueet-otsikko"
            className="text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Hoitoalueet
          </h2>
          <Link
            href="/asiakas/hoitoalueet"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Näytä kaikki
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HOITOALUEET.slice(0, 6).map((alue) => {
            const { label, vari } = TILA_MAARITTEET[alue.tila];
            const avoimet = avoimetHavainnotAlueelle(alue.id);
            return (
              <li key={alue.id}>
                <Link
                  href="/asiakas/hoitoalueet"
                  className="metal-card flex flex-col gap-2 rounded-2xl p-4 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">
                        {alue.nimi}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {alue.osoite}
                      </p>
                    </div>
                    {avoimet > 0 && (
                      <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                        {avoimet} havainto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: vari }}
                        aria-hidden
                      />
                      {label}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {alue.edistyma} %
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Tilasto({
  luku,
  teksti,
  vari,
}: {
  luku: string | number;
  teksti: string;
  vari?: string;
}) {
  return (
    <div className="metal-card flex flex-col gap-1 rounded-2xl p-4">
      <span
        className="text-2xl font-bold text-foreground md:text-3xl"
        style={vari ? { color: vari } : undefined}
      >
        {luku}
      </span>
      <span className="text-sm text-muted">{teksti}</span>
    </div>
  );
}

function Selite({ vari, teksti }: { vari: string; teksti: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: vari }}
        aria-hidden
      />
      {teksti}
    </span>
  );
}
