import type { ReactNode } from "react";
import { AsiakasChrome } from "@/components/asiakas/asiakas-chrome";
import { vaadiRooli } from "@/lib/reitti-suojaus";

export default async function AsiakasLayout({
  children,
}: {
  children: ReactNode;
}) {
  const rooli = await vaadiRooli(["asiakas", "tyonjohto", "admin"]);

  return <AsiakasChrome rooli={rooli}>{children}</AsiakasChrome>;
}
