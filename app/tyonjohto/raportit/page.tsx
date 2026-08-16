import { FileText, Download, CircleCheck } from "lucide-react";
import { RAPORTIT } from "@/lib/tyonjohto-mock";

export default function RaportitPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Raportit</h1>
        <p className="text-sm text-muted">Työ- ja urakkaraportit</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {RAPORTIT.map((r) => (
          <article
            key={r.id}
            className="metal-card flex flex-col gap-4 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <FileText className="h-6 w-6" strokeWidth={1.75} />
              </span>
              {r.tila === "valmis" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-600/10 px-2.5 py-1 text-xs font-medium text-green-700">
                  <CircleCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  Valmis
                </span>
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">
                {r.otsikko}
              </h2>
              <p className="text-sm text-muted">{r.konteksti}</p>
              <p className="mt-1 text-xs text-muted">{r.paiva}</p>
            </div>

            <button
              type="button"
              className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-border bg-white py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Avaa raportti
            </button>
          </article>
        ))}
      </div>

      <p className="text-xs text-muted">
        Raporttien luonti ja vienti rakennetaan myöhemmässä vaiheessa.
      </p>
    </div>
  );
}
