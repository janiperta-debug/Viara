import { TopBar } from "@/components/dashboard/top-bar";
import { TyontekijanHavainnot } from "@/components/havainnot/tyontekijan-havainnot";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { haeOmaOrganisaatioId, haeTyonjohtoHavainnot } from "@/lib/tyonjohto-havainnot";

export default async function HavainnotPage() {
  const rooli = await vaadiRooli(["kuljettaja", "tyonjohto", "admin"]);
  const organisaatioId = await haeOmaOrganisaatioId();
  const havainnot = organisaatioId ? await haeTyonjohtoHavainnot(organisaatioId) : [];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar notifications={3} active="havainnot" rooli={rooli} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-6 pt-2 md:max-w-2xl md:gap-7 md:px-8 md:pt-4 lg:max-w-3xl lg:px-10 lg:pt-6">
        <TyontekijanHavainnot havainnot={havainnot} />
      </main>
    </div>
  );
}
