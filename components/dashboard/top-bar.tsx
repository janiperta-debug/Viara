import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";

type Kohde = "havainnot" | "profiili";

export function TopBar({
  notifications = 3,
  active,
}: {
  notifications?: number;
  active?: Kohde;
}) {
  return (
    <header className="mx-auto flex w-full max-w-md items-center justify-between px-5 pt-4 pb-2 md:max-w-2xl md:px-8 md:pt-6 lg:max-w-5xl lg:px-10">
      <Link
        href="/tyo"
        aria-label="Viara — etusivu"
        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Image
          src="/viara-logo.png"
          alt="Viara"
          width={420}
          height={135}
          priority
          className="logo-blend h-auto w-32 md:w-36"
        />
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/havainnot"
          aria-label={`Havainnot, ${notifications} uutta`}
          aria-current={active === "havainnot" ? "page" : undefined}
          className={`metal-card relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            active === "havainnot" ? "text-primary" : "text-foreground"
          }`}
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          {notifications > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-white">
              {notifications}
            </span>
          )}
        </Link>
        <Link
          href="/profiili"
          aria-label="Profiili — käyttäjä JP"
          aria-current={active === "profiili" ? "page" : undefined}
          className={`metal-card flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            active === "profiili" ? "text-primary" : "text-foreground"
          }`}
        >
          JP
        </Link>
      </div>
    </header>
  );
}
