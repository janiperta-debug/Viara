import Image from "next/image";
import Link from "next/link";
import {
  CircleCheck,
  LoaderCircle,
  TriangleAlert,
  Snowflake,
  Bell,
} from "lucide-react";
import { YLAPALKKI } from "@/lib/tyonjohto-mock";
import { type ViaraRooli, voikoVaihtaaNakymaa } from "@/lib/nakymat";

function StatChip({ Icon, vari, luku, label }: { Icon: typeof CircleCheck; vari: string; luku: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${vari}1a`, color: vari }}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="leading-tight"><div className="text-lg font-semibold text-foreground">{luku}</div><div className="text-[11px] font-medium text-muted">{label}</div></div>
    </div>
  );
}

export function DesktopHeader({ rooli }: { rooli: ViaraRooli }) {
  const { valmis, tyonAlla, avoimetHavainnot, saa, paiva, kello } = YLAPALKKI;
  const naytaNakymaVaihto = voikoVaihtaaNakymaa(rooli);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center gap-6 px-5 lg:px-8">
        <Link href="/tyonjohto" aria-label="Viara — työnjohto" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <Image src="/viara-logo.png" alt="Viara" width={420} height={135} priority className="logo-blend h-auto w-28" />
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <StatChip Icon={CircleCheck} vari="#16a34a" luku={valmis} label="Valmiit" />
          <StatChip Icon={LoaderCircle} vari="#d97706" luku={tyonAlla} label="Työn alla" />
          <StatChip Icon={TriangleAlert} vari="#c0392b" luku={avoimetHavainnot} label="Avoimet havainnot" />
        </div>
        <div className="ml-auto flex items-center gap-5">
          {naytaNakymaVaihto && <Link href="/valitse" className="rounded-full border border-border/70 px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Vaihda näkymää</Link>}
          <div className="hidden items-center gap-2.5 lg:flex"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent"><Snowflake className="h-5 w-5" strokeWidth={2} /></span><div className="leading-tight"><div className="text-sm font-semibold text-foreground">{saa.lampotila}</div><div className="text-[11px] font-medium text-muted">{saa.kuvaus} · {saa.lumi}</div></div></div>
          <div className="hidden text-right leading-tight sm:block"><div className="text-sm font-semibold text-foreground">{kello}</div><div className="text-[11px] font-medium text-muted">{paiva}</div></div>
          <Link href="/tyonjohto/havainnot" aria-label="Havainnot" className="metal-card flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><Bell className="h-5 w-5" strokeWidth={1.75} /></Link>
          <Link href="/tyonjohto/asetukset" aria-label="Käyttäjä JP — asetukset" className="metal-card flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">JP</Link>
        </div>
      </div>
    </header>
  );
}
