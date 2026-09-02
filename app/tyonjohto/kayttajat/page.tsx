import { AdmininOrganisaationLuonti, OrganisaationKayttajahallinta } from "@/components/tyonjohto/kayttajat/kayttajahallinta";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type KayttajaRivi = {
  id: string;
  nimi: string;
  rooli: string;
};

export default async function KayttajatPage() {
  const rooli = await vaadiRooli(["admin", "tyonjohto"]);

  if (rooli === "admin") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Käyttäjähallinta</h1>
          <p className="text-sm text-muted">Luo uusi organisaatio ja sen ensimmäinen työnjohto.</p>
        </div>
        <AdmininOrganisaationLuonti />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const [omaKayttajaTulos, kayttajatTulos] = await Promise.all([
    supabase.rpc("fn_oma_kayttaja").maybeSingle(),
    supabase.from("kayttajat").select("id, nimi, rooli").order("nimi"),
  ]);

  const kayttajat: KayttajaRivi[] = (kayttajatTulos.data ?? []).filter(
    (kayttaja): kayttaja is KayttajaRivi =>
      typeof kayttaja.id === "string" &&
      typeof kayttaja.nimi === "string" &&
      typeof kayttaja.rooli === "string"
  );
  const omaKayttaja = omaKayttajaTulos.data as Record<string, unknown> | null;
  const organisaatioId =
    omaKayttaja && typeof omaKayttaja.organisaatio_id === "string"
      ? omaKayttaja.organisaatio_id
      : null;
  const organisaatioTulos = organisaatioId
    ? await supabase.from("organisaatiot").select("nimi").eq("id", organisaatioId).maybeSingle()
    : { data: null };
  const organisaationNimi =
    typeof organisaatioTulos.data?.nimi === "string"
      ? organisaatioTulos.data.nimi
      : "Oma organisaatio";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Käyttäjähallinta</h1>
        <p className="text-sm text-muted">Hallitse organisaatiosi käyttäjiä ja rooleja.</p>
      </div>
      <OrganisaationKayttajahallinta
        organisaationNimi={organisaationNimi}
        kayttajat={kayttajat}
      />
    </div>
  );
}
