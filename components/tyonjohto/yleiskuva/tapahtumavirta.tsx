import {
  CircleCheck,
  Snowflake,
  TriangleAlert,
  Inbox,
  Play,
  LogOut,
  ChevronRight,
  MapPin,
} from "lucide-react";

export type TyonjohtoTapahtuma = {
  id: string;
  aika: string;
  otsikko: string;
  konteksti: string;
  tekija: string;
  tyyppi:
    | "tyo_valmis"
    | "tyovaline"
    | "havainto_uusi"
    | "havainto_vastaanotettu"
    | "tyo_aloitettu"
    | "tyovuoro_alkoi"
    | "tyovuoro_paattyi"
    | "hoitoalue_saapui"
    | "hoitoalue_poistui"
    | "tyovaline_on"
    | "tyovaline_off"
    | "havainto_luotu"
    | "havainto_otettu_tyon_alle"
    | "havainto_valmis"
    | "havainto_suljettu";
};

const TYYPPI_TYYLI: Record<
  TyonjohtoTapahtuma["tyyppi"],
  { Icon: typeof CircleCheck; vari: string }
> = {
  tyo_valmis: { Icon: CircleCheck, vari: "#16a34a" },
  tyovaline: { Icon: Snowflake, vari: "#2f6df6" },
  havainto_uusi: { Icon: TriangleAlert, vari: "#c0392b" },
  havainto_vastaanotettu: { Icon: Inbox, vari: "#2f6df6" },
  tyo_aloitettu: { Icon: Play, vari: "#d97706" },
  tyovuoro_alkoi: { Icon: Play, vari: "#16a34a" },
  tyovuoro_paattyi: { Icon: LogOut, vari: "#6b7480" },
  hoitoalue_saapui: { Icon: MapPin, vari: "#16a34a" },
  hoitoalue_poistui: { Icon: MapPin, vari: "#6b7480" },
  tyovaline_on: { Icon: Snowflake, vari: "#2f6df6" },
  tyovaline_off: { Icon: Snowflake, vari: "#6b7480" },
  havainto_luotu: { Icon: TriangleAlert, vari: "#c0392b" },
  havainto_otettu_tyon_alle: { Icon: Inbox, vari: "#2f6df6" },
  havainto_valmis: { Icon: CircleCheck, vari: "#16a34a" },
  havainto_suljettu: { Icon: CircleCheck, vari: "#6b7480" },
};

export function Tapahtumavirta({ tapahtumat }: { tapahtumat: TyonjohtoTapahtuma[] }) {
  return (
    <section className="metal-card flex flex-col rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Tapahtumavirta
        </h2>
        {tapahtumat.length > 0 && (
          <span className="text-xs text-muted">Viimeisimmät {tapahtumat.length}</span>
        )}
      </div>

      {tapahtumat.length === 0 ? (
        <div className="mt-4 rounded-xl border border-border/60 bg-white/50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Ei vielä tapahtumia</p>
          <p className="mt-1 text-xs text-muted">
            Organisaation tapahtumat näkyvät tässä, kun työ alkaa.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col">
          {tapahtumat.map((t) => {
            const { Icon, vari } = TYYPPI_TYYLI[t.tyyppi];
            return (
              <li key={t.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 border-b border-border/60 py-3 text-left last:border-0 hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="w-11 shrink-0 text-xs font-medium tabular-nums text-muted">
                    {t.aika}
                  </span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${vari}1a`, color: vari }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {t.otsikko}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {t.konteksti}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-xs font-medium text-muted sm:block">
                    {t.tekija}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
