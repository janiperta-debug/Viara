import { LogOut, ChevronRight, Globe, Bell } from "lucide-react";
import { TopBar } from "@/components/dashboard/top-bar";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { haeOmaKayttaja } from "@/lib/oma-kayttaja";
import { kirjauduUlos } from "@/app/actions/kirjaudu-ulos";

export default async function ProfiiliPage() {
  const kayttaja = await haeOmaKayttaja();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar notifications={3} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-6 pt-2 md:max-w-2xl md:gap-7 md:px-8 md:pt-4 lg:max-w-3xl lg:px-10 lg:pt-6">
        {/* Otsikko */}
        <section>
          <h1 className="px-1 text-3xl font-bold text-foreground md:text-4xl">
            Profiili
          </h1>
          <p className="mt-1 px-1 text-sm text-muted">
            Omat tiedot ja asetukset
          </p>
        </section>

        {/* Profiilikortti */}
        <section
          aria-label="Käyttäjä"
          className="metal-card flex items-center gap-4 rounded-2xl p-5"
        >
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
            aria-hidden
          >
            {kayttaja.initiaalit}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold text-foreground">
              {kayttaja.nimi}
            </p>
            <p className="mt-0.5 text-sm font-medium text-primary">
              {kayttaja.rooliLabel}
            </p>
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
                {kayttaja.email}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <span className="text-sm text-muted">Rooli</span>
              <span className="text-sm font-medium text-foreground">
                {kayttaja.rooliLabel}
              </span>
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

        {/* Lakitekstit (toissijaiset linkit) */}
        <section aria-labelledby="tiedot-otsikko">
          <h2
            id="tiedot-otsikko"
            className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Tietoa
          </h2>
          <div className="metal-card divide-y divide-border/60 rounded-2xl">
            {[
              { label: "Tietosuojaseloste", href: "#" },
              { label: "Käyttöehdot", href: "#" },
              { label: "Evästeet", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
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

        {/* Kirjaudu ulos */}
        <form action={kirjauduUlos}>
          <button
            type="submit"
            className="metal-card flex w-full items-center justify-center gap-2 rounded-2xl p-4 text-base font-semibold text-destructive transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
            Kirjaudu ulos
          </button>
        </form>
      </main>

      <BottomNav active="profiili" />
    </div>
  );
}
