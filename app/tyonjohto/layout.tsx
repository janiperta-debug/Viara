import type { ReactNode } from "react";
import { DesktopHeader } from "@/components/tyonjohto/desktop-header";
import { DesktopNav } from "@/components/tyonjohto/desktop-nav";
import { vaadiRooli } from "@/lib/reitti-suojaus";

export default async function TyonjohtoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const rooli = await vaadiRooli(["tyonjohto", "admin"]);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DesktopHeader rooli={rooli} />
      <main className="mx-auto w-full max-w-[1920px] flex-1 px-5 py-6 lg:px-8">
        {children}
      </main>
      <DesktopNav />
    </div>
  );
}
