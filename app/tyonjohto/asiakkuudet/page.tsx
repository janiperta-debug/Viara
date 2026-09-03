import { AsiakkuudetHallinta } from "@/components/tyonjohto/asiakkuudet/asiakkuudet-hallinta";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type AsiakkuusRivi = { id: string; nimi: string };
type AsiakasKayttajaRivi = { id: string; nimi: string; email: string | null; asiakkuus_id: string };
type OmaKayttaja = { organisaatio_id?: unknown };

export default async function AsiakkuudetPage() {
  await vaadiRooli(["admin", "tyonjohto"]);

  const supabase = await createSupabaseServerClient();
  const { data: omaKayttaja } = await supabase.rpc("fn_oma_kayttaja").maybeSingle();
  const kayttaja = (omaKayttaja ?? {}) as OmaKayttaja;
  const organisaatioId = typeof kayttaja.organisaatio_id === "string" ? kayttaja.organisaatio_id : null;

  if (!organisaatioId) {
    return (
      <main className="flex min-h-[60vh] flex-1 items-start justify-center px-5 py-10 lg:px-8 lg:py-16">
        <div className="metal-card w-full max-w-2xl rounded-2xl p-6">
          <p className="text-sm font-medium text-primary">Asiakkuudet</p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">Organisaatiota ei ole määritetty</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Tällä käyttäjällä ei ole vielä organisaatiota, jonka asiakkuuksia voisi hallita.</p>
        </div>
      </main>
    );
  }

  const [asiakkuudetTulos, organisaatioTulos, kayttajatTulos] = await Promise.all([
    supabase.from("asiakkuudet").select("id, nimi").eq("organisaatio_id", organisaatioId).order("nimi"),
    supabase.from("organisaatiot").select("nimi").eq("id", organisaatioId).maybeSingle(),
    supabase.from("kayttajat").select("id, nimi, auth_user_id, asiakkuus_id").eq("organisaatio_id", organisaatioId).eq("rooli", "asiakas").order("nimi"),
  ]);

  const asiakkuudet: AsiakkuusRivi[] = (asiakkuudetTulos.data ?? []).filter(
    (rivi): rivi is AsiakkuusRivi => typeof rivi.id === "string" && typeof rivi.nimi === "string"
  );
  const asiakasKayttajat: AsiakasKayttajaRivi[] = (kayttajatTulos.data ?? []).filter(
    (rivi): rivi is { id: string; nimi: string; auth_user_id: string; asiakkuus_id: string } =>
      typeof rivi.id === "string" && typeof rivi.nimi === "string" &&
      typeof rivi.auth_user_id === "string" && typeof rivi.asiakkuus_id === "string"
  ).map((rivi) => ({ id: rivi.id, nimi: rivi.nimi, email: null, asiakkuus_id: rivi.asiakkuus_id }));

  const organisaationNimi = typeof organisaatioTulos.data?.nimi === "string" ? organisaatioTulos.data.nimi : "Oma organisaatio";

  return (
    <main className="flex min-h-screen flex-1 items-start justify-center px-5 py-10 lg:px-8 lg:py-16">
      <div className="w-full max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">Työnjohto</p>
          <h1 className="text-2xl font-semibold text-foreground">Asiakkuuksien hallinta</h1>
          <p className="mt-1 text-sm text-muted">Hallitse organisaation asiakkuuksia ja niiden asiakaskäyttäjiä.</p>
        </div>
        <AsiakkuudetHallinta
          organisaationNimi={organisaationNimi}
          asiakkuudet={asiakkuudet}
          asiakasKayttajat={asiakasKayttajat}
        />
      </div>
    </main>
  );
}
