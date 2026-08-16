import type { ReactNode } from "react";
import { AsukasChrome } from "@/components/asukas/asukas-chrome";

export default function AsukasLayout({ children }: { children: ReactNode }) {
  return <AsukasChrome>{children}</AsukasChrome>;
}
