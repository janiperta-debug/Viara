"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, TriangleAlert, Bell } from "lucide-react";

const ITEMS = [
  { href: "/asukas", label: "Oma hoitoalue", Icon: Home },
  { href: "/asukas/havainnot", label: "Havainnot", Icon: TriangleAlert },
] as const;

export function AsukasChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoitoalue = searchParams.get("hoitoalue");
  const query = hoitoalue ? `?hoitoalue=${encodeURIComponent(hoitoalue)}` : "";

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-5 pt-4 pb-2">
        <Link
          href={`/asukas${query}`}
          aria-label="Viara — etusivu"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Image
            src="/viara-logo.png"
            alt="Viara"
            width={420}
            height={135}
            priority
            className="logo-blend h-auto w-28"
          />
        </Link>
        <Link
          href={`/asukas/havainnot${query}`}
          aria-label="Havainnot"
          className="metal-card flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-28 pt-2">{children}</main>

      <nav
        aria-label="Asukasnavigaatio"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/90 backdrop-blur-md"
      >
        <ul className="mx-auto flex w-full max-w-md items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {ITEMS.map(({ href, label, Icon }) => {
            const aktiivinen =
              href === "/asukas"
                ? pathname === "/asukas"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={`${href}${query}`}
                  aria-current={aktiivinen ? "page" : undefined}
                  className={`relative flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    aktiivinen ? "bg-white text-primary shadow-sm" : "text-muted"
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={aktiivinen ? 2 : 1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
