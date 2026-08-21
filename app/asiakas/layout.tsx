import type { ReactNode } from "react";
import { AsiakasChrome } from "@/components/asiakas/asiakas-chrome";
import { vaadiRooli } from "@/lib/reitti-suojaus";

export default async function AsiakasLayout({
  children,
}: {
  children: ReactNode;
}) {
  await vaadiRooli(["asiakas", "admin"]);

  return <AsiakasChrome>{children}</AsiakasChrome>;
}
