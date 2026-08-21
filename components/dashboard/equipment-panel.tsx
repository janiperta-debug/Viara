"use client";

import { useState, useTransition } from "react";
import { Truck, Snowflake } from "lucide-react";
import { asetaTyovaline } from "@/app/actions/aseta-tyovaline";
import { TYOVALINETYYPPI_ID } from "@/lib/tyovalinetyypit";

type TyovalineSlug = "aura" | "hiekoitin";

type Tyovaline = {
  slug: TyovalineSlug;
  uuid: string;
  nimi: string;
  Icon: typeof Truck;
};

const TYOVALINEET: Tyovaline[] = [
  { slug: "aura", uuid: TYOVALINETYYPPI_ID.aura, nimi: "Aura", Icon: Truck },
  { slug: "hiekoitin", uuid: TYOVALINETYYPPI_ID.hiekoitin, nimi: "Hiekoitin", Icon: Snowflake },
];

type TyovalineTilat = {
  aura: boolean | null;
  hiekoitin: boolean | null;
};

function ToggleCard({
  tyovaline,
  alkuTila,
}: {
  tyovaline: Tyovaline;
  alkuTila: boolean | null;
}) {
  const [aktiivinen, setAktiivinen] = useState<boolean | null>(alkuTila);
  const [, startTransition] = useTransition();
  const { Icon, nimi, uuid } = tyovaline;

  function toggle() {
    const seuraava = aktiivinen !== true;
    setAktiivinen(seuraava);

    // Yritetään kirjata tapahtuma taustalla; UI ei jää odottamaan.
    startTransition(async () => {
      const tulos = await asetaTyovaline({
        tyovalinetyyppiId: uuid,
        aktiivinen: seuraava,
      });
      if (!tulos.success) {
        console.log("[v0] Työvälineen tila ei tallentunut:", tulos.error);
      }
    });
  }

  return (
    <div className="metal-card flex flex-col gap-4 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-foreground shadow-sm">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">
            {nimi}
          </p>
          <p className="text-sm text-muted">
            {aktiivinen === true
              ? "Käytössä"
              : aktiivinen === false
                ? "Pois käytöstä"
                : "Tila ei tiedossa"}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={aktiivinen === true}
        aria-label={`${nimi}: ${
          aktiivinen === true
            ? "käytössä"
            : aktiivinen === false
              ? "pois käytöstä"
              : "tila ei tiedossa"
        }`}
        onClick={toggle}
        className={`relative flex h-10 w-full items-center rounded-full px-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          aktiivinen === true ? "btn-primary" : "bg-border"
        }`}
      >
        <span
          className={`text-xs font-bold tracking-wide ${
            aktiivinen === true
              ? "ml-3 text-primary-foreground"
              : "ml-auto mr-3 text-muted"
          }`}
        >
          {aktiivinen === true ? "ON" : aktiivinen === false ? "OFF" : "?"}
        </span>
        <span
          className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow-md transition-all duration-200 ${
            aktiivinen === true ? "right-1" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export function EquipmentPanel({
  initialState,
}: {
  initialState: TyovalineTilat;
}) {
  return (
    <section aria-labelledby="tyovalineet-otsikko">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2
          id="tyovalineet-otsikko"
          className="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Aktiiviset työvälineet
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          Muuta
          <span aria-hidden>›</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TYOVALINEET.map((t) => (
          <ToggleCard
            key={t.slug}
            tyovaline={t}
            alkuTila={initialState[t.slug] ?? null}
          />
        ))}
      </div>
    </section>
  );
}

