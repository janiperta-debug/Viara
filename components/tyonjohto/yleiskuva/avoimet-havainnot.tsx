import Link from "next/link";
import { TriangleAlert, ChevronRight } from "lucide-react";
import type { TyonjohtoHavainto } from "@/lib/tyonjohto-havainnot";

export function AvoimetHavainnot({ havainnot }: { havainnot: TyonjohtoHavainto[] }) {
  const avoimet = havainnot.filter((h) => h.tila === "avoin" || h.tila === "tyon_alla").slice(0, 3);

  return (
    <section className="metal-card flex flex-col rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Avoimet havainnot</h2>
        <Link href="/tyonjohto/havainnot" className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          Katso kaikki <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {avoimet.map((h) => (
          <li key={h.id}>
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-white/60 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"><TriangleAlert className="h-4 w-4" strokeWidth={2} /></span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{h.otsikko}</span>
                <p className="truncate text-xs text-muted">{h.hoitoalueNimi} · {h.aika}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {avoimet.length === 0 && <p className="mt-4 text-sm text-muted">Ei avoimia havaintoja.</p>}
    </section>
  );
}
