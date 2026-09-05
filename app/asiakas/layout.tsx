import type { ReactNode } from "react";
import { AsiakasChrome } from "@/components/asiakas/asiakas-chrome";
import { vaadiRooli } from "@/lib/reitti-suojaus";
import { haeOmaKayttaja } from "@/lib/oma-kayttaja";

export default async function AsiakasLayout({ children }: { children: ReactNode }) {
  const rooli = await vaadiRooli(["asiakas", "tyonjohto", "admin"]);
  const kayttaja = await haeOmaKayttaja();

  return <AsiakasChrome rooli={rooli} kayttaja={kayttaja}>{children}</AsiakasChrome>;
}
