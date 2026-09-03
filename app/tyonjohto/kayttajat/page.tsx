import { OrganisaationKayttajahallinta } from "@/components/tyonjohto/kayttajat/kayttajahallinta";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type KayttajaRivi = {
  id: string;
  nimi: string;
  rooli: string;
};

export default async function KayttajatPage() {
  await vaadiRooli(["admin", "tyonjohto"]);

  const supabase = await createSupabaseServerClient();
  const { data: omaKayttaja } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  const organisaatioId =
    omaKayttaja && typeof omaKayttaja.organisaatio_id === "string"
      ? omaKayttaja.organisaatio_id
      : null;

  if (!organisaatioId) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Käyttäjähallinta</h1>
          <p className="text-sm text-muted">Organisaatiota ei ole määritetty tälle käyttäjälle.</p>
        </div>
      </div>
    );
  }

  const [kayttajatTulos, organisaatioTulos] = await Promise.all([
    supabase
      .from("kayttajat")
      .select("id, nimi, rooli")
      .eq("organisaatio_id", organisaatioId)
      .order("nimi"),
    supabase.from("organisaatiot").select("nimi").eq("id", organisaatioId).maybeSingle(),
  ]);

  const kayttajat: KayttajaRivi[] = (kayttajatTulos.data ?? []).filter(
    (kayttaja): kayttaja is KayttajaRivi =>
      typeof kayttaja.id === "string" &&
      typeof kayttaja.nimi === "string" &&
      typeof kayttaja.rooli === "string"
  );
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
