import Image from "next/image";
import { MapPin, Map, ChevronRight, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/dashboard/top-bar";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { EquipmentPanel } from "@/components/dashboard/equipment-panel";

export default function TyoPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      <TopBar notifications={3} />

      <main className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-2">
        {/* Tervehdys + työvuoron tila */}
        <section className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg text-muted">Hyvää huomenta,</p>
            <h1 className="text-3xl font-bold text-foreground">Ville</h1>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full bg-primary"
                aria-hidden
              />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  Työvuoro käynnissä
                </p>
                <p className="text-muted">06:00 – 14:00</p>
              </div>
            </div>
          </div>
          <Image
            src="/images/plow-truck.png"
            alt="Auraava kuorma-auto"
            width={320}
            height={220}
            priority
            className="h-auto w-36 shrink-0 object-contain mix-blend-multiply"
          />
        </section>

        {/* Seuraava kohde */}
        <section aria-labelledby="seuraava-kohde-otsikko">
          <h2
            id="seuraava-kohde-otsikko"
            className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Seuraava kohde
          </h2>
          <button
            type="button"
            className="metal-card flex w-full items-center gap-4 rounded-2xl p-4 text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
              <MapPin className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-foreground">
                As Oy Mäntyrinne
              </span>
              <span className="block truncate text-sm text-muted">
                Keskuskatu 12, 05800 Hyvinkää
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-muted">
              180 m
              <ChevronRight className="h-5 w-5" />
            </span>
          </button>
        </section>

        {/* Avaa operatiivinen kartta */}
        <button
          type="button"
          className="btn-primary flex h-16 w-full items-center justify-between rounded-2xl px-5 text-primary-foreground"
        >
          <span className="flex items-center gap-3">
            <Map className="h-6 w-6" strokeWidth={1.75} />
            <span className="text-base font-semibold">
              Avaa operatiivinen kartta
            </span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Aktiiviset työvälineet */}
        <EquipmentPanel />

        {/* Ilmoita poikkeamasta */}
        <button
          type="button"
          className="metal-card flex w-full items-center gap-4 rounded-2xl p-4 text-left"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-foreground shadow-sm">
            <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="flex-1 text-base font-semibold text-foreground">
            Ilmoita poikkeamasta
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
        </button>
      </main>

      <BottomNav active="tyo" />
    </div>
  );
}
