import Link from "next/link";
import { ChevronRight, TriangleAlert } from "lucide-react";
import type { TyonjohtoHavainto } from "@/lib/tyonjohto-havainnot";

const TILAT: Record<TyonjohtoHavainto["tila"], string> = {
  avoin: "Avoin",
  tyon_alla: "Työn alla",
  valmis: "Valmis",
  suljettu: "Suljettu",
};

export function ViimeisimmatHavainnot({ havainnot }: { havainnot: TyonjohtoHavainto[] }) {
  const viimeisimmat = havainnot.slice(0, 3);
  if (viimeisimmat.length === 0) return null;

  return (
    <section className="metal-card rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-base font-semibold text-foreground">Viimeisimmät havainnot</h2><p className="mt-0.5 text-xs text-muted">Nopea pääsy kentällä kirjattuihin havaintoihin</p></div>
        <Link href="/havainnot" className="text-sm font-medium text-primary">Kaikki</Link>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {viimeisimmat.map((havainto) => (
          <Link key={havainto.id} href="/havainnot" className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-3 text-left shadow-sm transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm"><TriangleAlert className="h-5 w-5" strokeWidth={1.75} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground">{havainto.otsikko}</span><span className="mt-0.5 block truncate text-xs text-muted">{havainto.hoitoalueNimi} · {TILAT[havainto.tila]}</span></span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
          </Link>
        ))}
      </div>
    </section>
  );
}
