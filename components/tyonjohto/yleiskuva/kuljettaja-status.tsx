export type KuljettajaStatus = {
  id: string;
  nimi: string;
  tyossa: boolean;
  nykyinenHoitoalue: string | null;
  aura: boolean | null;
  hiekoitin: boolean | null;
};

export function KuljettajaStatus({
  kuljettajat,
}: {
  kuljettajat: KuljettajaStatus[];
}) {
  return (
    <section className="metal-card flex flex-col rounded-2xl p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Kuljettajat
      </h2>

      {kuljettajat.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Organisaatiolle ei ole vielä lisätty kuljettajia.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {kuljettajat.map((k) => (
            <li
              key={k.id}
              className="border-b border-border/60 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-foreground">{k.nimi}</span>
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      k.tyossa ? "bg-green-600" : "bg-muted"
                    }`}
                    aria-hidden
                  />
                  <span className={k.tyossa ? "text-foreground" : "text-muted"}>
                    {k.tyossa ? "Työssä" : "Ei työssä"}
                  </span>
                </span>
              </div>

              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                {k.nykyinenHoitoalue && <span>{k.nykyinenHoitoalue}</span>}
                {k.aura === true && <span>Aura</span>}
                {k.hiekoitin === true && <span>Hiekoitin</span>}
              </div>

              {!k.nykyinenHoitoalue && k.aura !== true && k.hiekoitin !== true && (
                <p className="mt-1 text-xs text-muted">Ei aktiivista tilatietoa</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
