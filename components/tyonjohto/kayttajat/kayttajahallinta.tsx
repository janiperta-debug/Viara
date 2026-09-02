"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronUp,
  LoaderCircle,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  luoOrganisaatioJaEnsimmainenTyonjohto,
  luoOrganisaationKayttaja,
  nostaKuljettajaTyonjohdoksi,
} from "@/app/actions/kayttajat";

type OrganisaationKayttaja = {
  id: string;
  nimi: string;
  rooli: "kuljettaja" | "tyonjohto" | string;
};

type Palaute = { tyyppi: "onnistui" | "virhe"; viesti: string } | null;

function Palauteviesti({ palaute }: { palaute: Palaute }) {
  if (!palaute) return null;

  return (
    <p
      role={palaute.tyyppi === "virhe" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        palaute.tyyppi === "onnistui"
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-destructive/25 bg-destructive/10 text-destructive"
      }`}
    >
      {palaute.viesti}
    </p>
  );
}

function Kentta({
  id,
  label,
  type = "text",
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function Tallennusnappi({ children, odottaa }: { children: React.ReactNode; odottaa: boolean }) {
  return (
    <button
      type="submit"
      disabled={odottaa}
      className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {odottaa && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function AdmininOrganisaationLuonti() {
  const [odottaa, startTransition] = useTransition();
  const [palaute, setPalaute] = useState<Palaute>(null);

  function kasitteleLomake(formData: FormData) {
    setPalaute(null);
    startTransition(async () => {
      const tulos = await luoOrganisaatioJaEnsimmainenTyonjohto({
        organisaationNimi: String(formData.get("organisaationNimi") ?? ""),
        nimi: String(formData.get("nimi") ?? ""),
        email: String(formData.get("email") ?? ""),
        salasana: String(formData.get("salasana") ?? ""),
      });

      setPalaute(
        tulos.ok
          ? { tyyppi: "onnistui", viesti: "Organisaatio ja ensimmäinen työnjohto luotiin." }
          : { tyyppi: "virhe", viesti: tulos.virhe }
      );
    });
  }

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.35fr]">
      <section className="metal-card rounded-2xl p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">Uusi organisaatio</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Luo organisaatio ja sille ensimmäinen työnjohdon käyttäjä samalla kertaa.
          Työnjohto voi tämän jälkeen hallita oman organisaationsa käyttäjiä.
        </p>
      </section>

      <form action={kasitteleLomake} className="metal-card space-y-4 rounded-2xl p-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Organisaation tiedot</h2>
          <p className="mt-1 text-sm text-muted">Ensimmäiselle työnjohdolle luodaan oma kirjautumistunnus.</p>
        </div>
        <Kentta id="organisaationNimi" label="Organisaation nimi" autoComplete="organization" />
        <Kentta id="nimi" label="Työnjohdon nimi" autoComplete="name" />
        <Kentta id="email" label="Sähköpostiosoite" type="email" autoComplete="email" />
        <Kentta id="salasana" label="Väliaikainen salasana" type="password" autoComplete="new-password" />
        <p className="text-xs text-muted">Salasanassa tulee olla vähintään 8 merkkiä.</p>
        <Palauteviesti palaute={palaute} />
        <Tallennusnappi odottaa={odottaa}>Luo organisaatio</Tallennusnappi>
      </form>
    </div>
  );
}

export function OrganisaationKayttajahallinta({
  organisaationNimi,
  kayttajat,
}: {
  organisaationNimi: string;
  kayttajat: OrganisaationKayttaja[];
}) {
  const router = useRouter();
  const [odottaa, startTransition] = useTransition();
  const [palaute, setPalaute] = useState<Palaute>(null);

  function lisaaKayttaja(formData: FormData) {
    setPalaute(null);
    startTransition(async () => {
      const rooli = String(formData.get("rooli") ?? "kuljettaja");
      const tulos = await luoOrganisaationKayttaja({
        nimi: String(formData.get("nimi") ?? ""),
        email: String(formData.get("email") ?? ""),
        salasana: String(formData.get("salasana") ?? ""),
        rooli: rooli === "tyonjohto" ? "tyonjohto" : "kuljettaja",
      });

      if (tulos.ok) {
        setPalaute({ tyyppi: "onnistui", viesti: "Käyttäjä luotiin organisaatioon." });
        router.refresh();
      } else {
        setPalaute({ tyyppi: "virhe", viesti: tulos.virhe });
      }
    });
  }

  function nostaTyonjohdoksi(kayttajaId: string, nimi: string) {
    setPalaute(null);
    startTransition(async () => {
      const tulos = await nostaKuljettajaTyonjohdoksi(kayttajaId);
      if (tulos.ok) {
        setPalaute({ tyyppi: "onnistui", viesti: `${nimi} nostettiin työnjohdoksi.` });
        router.refresh();
      } else {
        setPalaute({ tyyppi: "virhe", viesti: tulos.virhe });
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
      <section className="metal-card overflow-hidden rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-5">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" />
              <h2 className="text-base font-semibold text-foreground">Organisaation käyttäjät</h2>
            </div>
            <p className="mt-1 text-sm text-muted">{organisaationNimi}</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted shadow-sm">
            {kayttajat.length} käyttäjää
          </span>
        </div>

        {kayttajat.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">Organisaatiossa ei vielä ole käyttäjiä.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {kayttajat.map((kayttaja) => {
              const onTyonjohto = kayttaja.rooli === "tyonjohto";
              return (
                <li key={kayttaja.id} className="flex items-center gap-3 px-5 py-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${onTyonjohto ? "bg-primary/10 text-primary" : "bg-white text-muted"}`}>
                    {onTyonjohto ? <ShieldCheck className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{kayttaja.nimi}</p>
                    <p className="text-xs text-muted">{onTyonjohto ? "Työnjohto" : "Kuljettaja"}</p>
                  </div>
                  {!onTyonjohto && (
                    <button
                      type="button"
                      disabled={odottaa}
                      onClick={() => nostaTyonjohdoksi(kayttaja.id, kayttaja.nimi)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-primary/25 bg-white px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ChevronUp className="h-4 w-4" />
                      Nosta työnjohdoksi
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <form action={lisaaKayttaja} className="metal-card h-fit space-y-4 rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Lisää käyttäjä</h2>
        </div>
        <Kentta id="nimi" label="Nimi" autoComplete="name" />
        <Kentta id="email" label="Sähköpostiosoite" type="email" autoComplete="email" />
        <Kentta id="salasana" label="Väliaikainen salasana" type="password" autoComplete="new-password" />
        <label className="block" htmlFor="rooli">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Rooli</span>
          <select id="rooli" name="rooli" className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="kuljettaja">Kuljettaja</option>
            <option value="tyonjohto">Työnjohto</option>
          </select>
        </label>
        <Palauteviesti palaute={palaute} />
        <Tallennusnappi odottaa={odottaa}>Lisää käyttäjä</Tallennusnappi>
      </form>
    </div>
  );
}
