import type { ReactNode } from "react";
import { AsiakasChrome } from "@/components/asiakas/asiakas-chrome";

export default function AsiakasLayout({ children }: { children: ReactNode }) {
  return <AsiakasChrome>{children}</AsiakasChrome>;
}
