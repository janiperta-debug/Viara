import Image from "next/image";
import Link from "next/link";
import { Map, ChevronRight, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/dashboard/top-bar";
import { EquipmentPanel } from "@/components/dashboard/equipment-panel";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { haeNykyinenTyoTila } from "@/lib/tyo-tila";

export default async function TyoPage() {
  await vaadiRooli(["kuljettaja", "tyonjohto", "admin"]);
  const tyoTila = await haeNykyinenTyoTila();

  const tyoStatus =
    tyoTila.tyoKaynnissa === true
      ? "Työ käynnissä"
      : tyoTila.tyoKaynnissa === false
        ? "Työ ei käynnissä"
        : "Työn tila ei tiedossa";

  const statusVari =
    tyoTila.tyoKaynnissa === true
      ? "bg-green-600"
      : tyoTila.tyoKaynnissa === false
        ? "bg-destructive"
        : "bg-muted";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar notifications={3} />

      <main
        className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-6 pt-2 md:max-w-2xl md:gap-7 md:px-8 md:pt-4 lg:max-w-5xl lg:grid lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-8 lg:px-10 lg:pt-6"
        data-hoitoalue-id={tyoTila.nykyinenHoitoalue?.id ?? ""}
      >
        {/* Vasen palsta: tervehdys, seuraava kohde, kartta */}
        <div className="flex flex-col gap-6 md:gap-7 lg:gap-8">
          {/* Tervehdys + työvuoron tila */}
          <section className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg text-muted">Hyvää huomenta,</p>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                {tyoTila.kayttajaNimi}
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5" aria-hidden>
                  {tyoTila.tyoKaynnissa === true && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                  )}
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${statusVari}`}
                  />
                </span>
                <p className="text-sm font-medium text-foreground">
                  {tyoStatus}
                </p>
              </div>
            </div>
            <Image
              src="/images/plow-truck.png"
              alt="Auraava kuorma-auto"
              width={320}
              height={220}
              priority
              className="h-auto w-36 shrink-0 object-contain mix-blend-multiply md:w-44 lg:w-52"
            />
          </section>

          {/* Avaa operatiivinen kartta */}
          <Link
            href="/kartta"
            className="btn-primary flex h-16 w-full items-center justify-between rounded-2xl px-5 text-primary-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:h-[4.5rem]"
          >
            <span className="flex items-center gap-3">
              <Map className="h-6 w-6" strokeWidth={1.75} />
              <span className="text-base font-semibold md:text-lg">
                Avaa operatiivinen kartta
              </span>
            </span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Oikea palsta: työvälineet + poikkeamailmoitus */}
        <div className="flex flex-col gap-6 md:gap-7 lg:gap-8">
          {/* Aktiiviset työvälineet */}
          <EquipmentPanel initialState={tyoTila.tyovalineet} />

          {/* Ilmoita poikkeamasta */}
          <button
            type="button"
            className="metal-card flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-foreground shadow-sm">
              <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <span className="flex-1 text-base font-semibold text-foreground">
              Ilmoita poikkeamasta
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
          </button>
        </div>
      </main>
    </div>
  );
}
