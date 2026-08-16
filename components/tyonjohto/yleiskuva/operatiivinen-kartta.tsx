import { TilanneVisualisointi } from "@/components/kartta/tilanne-visualisointi";

function Selite({ vari, label }: { vari: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: vari }}
        aria-hidden
      />
      {label}
    </span>
  );
}

export function OperatiivinenKartta() {
  return (
    <section className="metal-card flex h-full flex-col rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Operatiivinen tilannekuva
        </h2>
        <div className="flex items-center gap-4">
          <Selite vari="#16a34a" label="Valmis" />
          <Selite vari="#d97706" label="Käynnissä" />
          <Selite vari="#dc2626" label="Aloittamatta" />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center py-4">
        <div className="w-full max-w-md">
          <TilanneVisualisointi />
        </div>
      </div>

      <p className="text-center text-xs text-muted">
        Kuvaaja esittää urakan edistymistä — ei todellista karttaa.
      </p>
    </section>
  );
}
