import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

function Selite({ vari, label, maara }: { vari: string; label: string; maara: number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: vari }}
        aria-hidden
      />
      {label}
      <span className="font-semibold text-foreground">{maara}</span>
    </span>
  );
}

type Tila = "valmis" | "kaynnissa" | "aloittamatta";

type Hoitoalue = {
  id: string;
};

type Tapahtuma = {
  hoitoalue_id: string | null;
  tyyppi: string;
  aikaleima: string;
};

async function haeTilanne(): Promise<Record<Tila, number>> {
  const supabase = await createSupabaseServerClient();
  const { data: omaKayttaja } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  const organisaatioId =
    omaKayttaja && typeof (omaKayttaja as { organisaatio_id?: unknown }).organisaatio_id === "string"
      ? (omaKayttaja as { organisaatio_id: string }).organisaatio_id
      : null;

  if (!organisaatioId) {
    return { valmis: 0, kaynnissa: 0, aloittamatta: 0 };
  }

  const admin = createSupabaseAdminClient();
  const { data: hoitoalueet } = await admin
    .from("hoitoalueet")
    .select("id, asiakkuudet!inner(organisaatio_id)")
    .eq("asiakkuudet.organisaatio_id", organisaatioId);

  const alueet = (hoitoalueet ?? []) as unknown as Hoitoalue[];
  if (alueet.length === 0) {
    return { valmis: 0, kaynnissa: 0, aloittamatta: 0 };
  }

  const alueIdt = alueet.map((alue) => alue.id);
  const { data: tapahtumat } = await admin
    .from("tapahtumat")
    .select("hoitoalue_id, tyyppi, aikaleima")
    .in("hoitoalue_id", alueIdt)
    .in("tyyppi", ["tyo_aloitettu", "tyo_valmis"])
    .order("aikaleima", { ascending: false });

  const viimeisin = new Map<string, Tapahtuma>();
  for (const tapahtuma of (tapahtumat ?? []) as Tapahtuma[]) {
    if (tapahtuma.hoitoalue_id && !viimeisin.has(tapahtuma.hoitoalue_id)) {
      viimeisin.set(tapahtuma.hoitoalue_id, tapahtuma);
    }
  }

  const tulos: Record<Tila, number> = {
    valmis: 0,
    kaynnissa: 0,
    aloittamatta: 0,
  };

  for (const alue of alueet) {
    const tapahtuma = viimeisin.get(alue.id);
    if (tapahtuma?.tyyppi === "tyo_valmis") {
      tulos.valmis += 1;
    } else if (tapahtuma?.tyyppi === "tyo_aloitettu") {
      tulos.kaynnissa += 1;
    } else {
      tulos.aloittamatta += 1;
    }
  }

  return tulos;
}

export async function OperatiivinenKartta() {
  const tila = await haeTilanne();

  return (
    <section className="metal-card flex h-full flex-col rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Operatiivinen tilannekuva
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Selite vari="#16a34a" label="Valmis" maara={tila.valmis} />
          <Selite vari="#d97706" label="Käynnissä" maara={tila.kaynnissa} />
          <Selite vari="#dc2626" label="Aloittamatta" maara={tila.aloittamatta} />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center py-4">
        <div className="w-full max-w-md overflow-hidden rounded-xl">
          <Image
            src="/images/operatiivinen-kartta.webp"
            alt="Talvikunnossapidon operatiivinen tilannekuva"
            width={320}
            height={320}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>

      <p className="text-center text-xs text-muted">
        Tilannekuvan luvut perustuvat organisaation hoitoalueiden viimeisimpiin tapahtumiin.
      </p>
    </section>
  );
}
