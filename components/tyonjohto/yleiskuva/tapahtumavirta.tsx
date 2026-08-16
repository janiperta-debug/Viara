import {
  CircleCheck,
  Snowflake,
  TriangleAlert,
  Inbox,
  Play,
  ChevronRight,
} from "lucide-react";
import { TAPAHTUMAVIRTA, type TapahtumaTyyppi } from "@/lib/tyonjohto-mock";

const TYYPPI_TYYLI: Record<
  TapahtumaTyyppi,
  { Icon: typeof CircleCheck; vari: string }
> = {
  tyo_valmis: { Icon: CircleCheck, vari: "#16a34a" },
  tyovaline: { Icon: Snowflake, vari: "#2f6df6" },
  havainto_uusi: { Icon: TriangleAlert, vari: "#c0392b" },
  havainto_vastaanotettu: { Icon: Inbox, vari: "#2f6df6" },
  tyo_aloitettu: { Icon: Play, vari: "#d97706" },
};

export function Tapahtumavirta() {
  return (
    <section className="metal-card flex flex-col rounded-2xl p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Tapahtumavirta
      </h2>

      <ul className="mt-4 flex flex-col">
        {TAPAHTUMAVIRTA.map((t) => {
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
    </section>
  );
}
