import {
  Users,
  ShieldCheck,
  Building,
  Bell,
  Globe,
  ChevronRight,
} from "lucide-react";

const OSIOT = [
  {
    Icon: Users,
    otsikko: "Käyttäjät",
    kuvaus: "Hallitse organisaation käyttäjiä ja kuljettajia.",
  },
  {
    Icon: ShieldCheck,
    otsikko: "Roolit",
    kuvaus: "Työnjohto, kuljettaja, asiakas ja asukas.",
  },
  {
    Icon: Building,
    otsikko: "Organisaatio",
    kuvaus: "Organisaation perustiedot ja urakat.",
  },
  {
    Icon: Bell,
    otsikko: "Ilmoitukset",
    kuvaus: "Ilmoitusten ja hälytysten asetukset.",
  },
  {
    Icon: Globe,
    otsikko: "Kieli",
    kuvaus: "Sovelluksen kieli.",
    arvo: "FI",
  },
];

const ROOLIT = [
  { nimi: "Työnjohto", kuvaus: "Hallitsee koko operaatiota." },
  { nimi: "Kuljettaja", kuvaus: "Tekee työn kentällä." },
  { nimi: "Asiakas", kuvaus: "Seuraa omia hoitoalueitaan." },
  { nimi: "Asukas", kuvaus: "Näkee oman hoitoalueensa." },
];

export default function AsetuksetPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Asetukset</h1>
        <p className="text-sm text-muted">
          Organisaation ja sovelluksen hallinta
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Asetusosiot */}
        <div className="lg:col-span-2">
          <ul className="metal-card divide-y divide-border/60 overflow-hidden rounded-2xl">
            {OSIOT.map(({ Icon, otsikko, kuvaus, arvo }) => (
              <li key={otsikko}>
                <button
                  type="button"
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {otsikko}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {kuvaus}
                    </span>
                  </span>
                  {arvo && (
                    <span className="shrink-0 text-sm font-medium text-muted">
                      {arvo}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Roolimalli */}
        <aside className="metal-card rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Roolimalli
          </h2>
          <ul className="mt-4 space-y-3">
            {ROOLIT.map((r) => (
              <li
                key={r.nimi}
                className="border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm font-semibold text-foreground">
                  {r.nimi}
                </p>
                <p className="text-xs text-muted">{r.kuvaus}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Roolipohjaiset käyttöoikeudet rakennetaan myöhemmässä vaiheessa.
          </p>
        </aside>
      </div>
    </div>
  );
}
