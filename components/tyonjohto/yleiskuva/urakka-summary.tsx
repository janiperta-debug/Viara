function LegendaKohta({ vari, label, luku }: { vari: string; label: string; luku: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: vari }} aria-hidden />
      <span className="text-sm text-muted">
        {label} <span className="font-semibold text-foreground">{luku}</span>
      </span>
    </div>
  );
}

export function UrakkaSummary({ nimi, valmisProsentti, valmis, kaynnissa, aloittamatta }: { nimi: string; valmisProsentti: number; valmis: number; kaynnissa: number; aloittamatta: number }) {
  return (
    <section className="metal-card rounded-2xl p-6">
      <p className="text-sm text-muted">Hyvää huomenta,</p>
      <h1 className="text-2xl font-semibold text-foreground">{nimi}</h1>
      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Urakan tilanne</h2>
          <span className="text-lg font-semibold text-foreground">{valmisProsentti} % valmis</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={valmisProsentti} aria-valuemin={0} aria-valuemax={100} aria-label="Urakan edistymä">
          <div className="h-full rounded-full bg-primary" style={{ width: `${valmisProsentti}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <LegendaKohta vari="#16a34a" label="Valmis" luku={valmis} />
          <LegendaKohta vari="#d97706" label="Käynnissä" luku={kaynnissa} />
          <LegendaKohta vari="#dc2626" label="Aloittamatta" luku={aloittamatta} />
        </div>
      </div>
    </section>
  );
}
