import Link from "next/link";
import { LogOut, ChevronRight, Globe, Bell, Home } from "lucide-react";
import { ASUKAS, OMA_HOITOALUE } from "@/lib/asukas-mock";

export default function AsukasProfiiliPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-5">
      <header className="px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profiili
        </h1>
        <p className="mt-1 text-sm text-muted">Omat tiedot ja asetukset</p>
      </header>

      {/* Profiilikortti */}
      <section
        aria-label="Käyttäjä"
        className="metal-card flex items-center gap-4 rounded-2xl p-5"
      >
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
          aria-hidden
        >
          {ASUKAS.nimikirjaimet}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold text-foreground">
            {ASUKAS.nimi}
          </p>
          <p className="mt-0.5 text-sm font-medium text-primary">Asukas</p>
        </div>
      </section>

      {/* Oma hoitoalue */}
      <section aria-labelledby="oma-hoitoalue-otsikko">
        <h2
          id="oma-hoitoalue-otsikko"
          className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Oma hoitoalue
        </h2>
        <div className="metal-card flex items-center gap-4 rounded-2xl p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <Home className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {OMA_HOITOALUE.nimi}
            </p>
            <p className="truncate text-sm text-muted">
              {OMA_HOITOALUE.osoite}, {OMA_HOITOALUE.postitoimipaikka} · Huoneisto{" "}
              {ASUKAS.huoneisto}
            </p>
          </div>
        </div>
      </section>

      {/* Tilin tiedot */}
      <section aria-labelledby="tilin-tiedot-otsikko">
        <h2
          id="tilin-tiedot-otsikko"
          className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Tilin tiedot
        </h2>
        <div className="metal-card divide-y divide-border/60 rounded-2xl">
          <div className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm text-muted">Sähköposti</span>
            <span className="truncate text-sm font-medium text-foreground">
              {ASUKAS.sahkoposti}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm text-muted">Rooli</span>
            <span className="text-sm font-medium text-foreground">Asukas</span>
          </div>
        </div>
      </section>

      {/* Asetukset (esitystaso) */}
      <section aria-labelledby="asetukset-otsikko">
        <h2
          id="asetukset-otsikko"
          className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Asetukset
        </h2>
        <div className="metal-card divide-y divide-border/60 rounded-2xl">
          <div className="flex items-center justify-between gap-4 p-4">
            <span className="flex items-center gap-3 text-sm font-medium text-foreground">
              <Globe className="h-5 w-5 text-muted" strokeWidth={1.75} />
              Kieli
            </span>
            <span className="text-sm font-medium text-muted">FI</span>
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <span className="flex items-center gap-3 text-sm font-medium text-foreground">
              <Bell className="h-5 w-5 text-muted" strokeWidth={1.75} />
              Ilmoitukset
            </span>
            <span className="text-sm font-medium text-muted">Käytössä</span>
          </div>
        </div>
      </section>

      {/* Lakitekstit */}
      <section aria-labelledby="tiedot-otsikko">
        <h2
          id="tiedot-otsikko"
          className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Tietoa
        </h2>
        <div className="metal-card divide-y divide-border/60 rounded-2xl">
          {["Tietosuojaseloste", "Käyttöehdot", "Evästeet"].map((label) => (
            <a
              key={label}
              href="#"
              className="flex items-center justify-between gap-4 p-4 transition-colors active:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
            </a>
          ))}
        </div>
      </section>

      {/* Kirjaudu ulos — vie kirjautumissivulle (mock-vaihe, ei backend-toimintoa) */}
      <Link
        href="/kirjaudu"
        className="metal-card flex w-full items-center justify-center gap-2 rounded-2xl p-4 text-base font-semibold text-destructive transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
      >
        <LogOut className="h-5 w-5" strokeWidth={1.75} />
        Kirjaudu ulos
      </Link>
    </div>
  );
}
