"use client";

import { useState } from "react";
import { Truck, Snowflake } from "lucide-react";

type Tyovaline = {
  id: string;
  nimi: string;
  Icon: typeof Truck;
};

// UI-vaihe: pelkkä paikallinen tila. Kytketään myöhemmin
// app/actions/aseta-tyovaline.ts -actioniin kun ulkoasu on hyväksytty.
const TYOVALINEET: Tyovaline[] = [
  { id: "aura", nimi: "Aura", Icon: Truck },
  { id: "hiekoitin", nimi: "Hiekoitin", Icon: Snowflake },
];

function ToggleCard({ tyovaline }: { tyovaline: Tyovaline }) {
  const [aktiivinen, setAktiivinen] = useState(true);
  const { Icon, nimi } = tyovaline;

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
            {aktiivinen ? "Käytössä" : "Pois käytöstä"}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={aktiivinen}
        aria-label={`${nimi}: ${aktiivinen ? "käytössä" : "pois käytöstä"}`}
        onClick={() => setAktiivinen((v) => !v)}
        className={`relative flex h-10 w-full items-center rounded-full px-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          aktiivinen ? "btn-primary" : "bg-border"
        }`}
      >
        <span
          className={`text-xs font-bold tracking-wide ${
            aktiivinen
              ? "ml-3 text-primary-foreground"
              : "ml-auto mr-3 text-muted"
          }`}
        >
          {aktiivinen ? "ON" : "OFF"}
        </span>
        <span
          className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow-md transition-all duration-200 ${
            aktiivinen ? "right-1" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export function EquipmentPanel() {
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
          <ToggleCard key={t.id} tyovaline={t} />
        ))}
      </div>
    </section>
  );
}
