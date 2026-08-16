import { KULJETTAJAT } from "@/lib/tyonjohto-mock";

export function KuljettajaStatus() {
  return (
    <section className="metal-card flex flex-col rounded-2xl p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Kuljettajat
      </h2>

      <ul className="mt-4 flex flex-col gap-4">
        {KULJETTAJAT.map((k) => {
          const tyossa = k.tila === "tyossa";
          return (
            <li
              key={k.id}
              className="border-b border-border/60 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{k.nimi}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      tyossa ? "bg-green-600" : "bg-muted"
                    }`}
                    aria-hidden
                  />
                  <span className={tyossa ? "text-foreground" : "text-muted"}>
                    {tyossa ? "Työssä" : "Ei työssä"}
                  </span>
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {k.hoitoalueet} hoitoaluetta
              </p>
              {tyossa && (
                <p className="mt-0.5 text-xs text-muted">
                  {k.valmis} valmis · {k.kaynnissa} käynnissä ·{" "}
                  {k.aloittamatta} aloittamatta
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
