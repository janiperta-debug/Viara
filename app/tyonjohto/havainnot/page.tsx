import { HavainnotHallinta } from "@/components/tyonjohto/havainnot/havainnot-hallinta";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { haeOmaOrganisaatioId, haeTyonjohtoHavainnot } from "@/lib/tyonjohto-havainnot";

export default async function TyonjohtoHavainnotPage() {
  await vaadiRooli(["tyonjohto", "admin"]);
  const organisaatioId = await haeOmaOrganisaatioId();
  const havainnot = organisaatioId ? await haeTyonjohtoHavainnot(organisaatioId) : [];

  return <HavainnotHallinta havainnot={havainnot} />;
}
