"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Building2, TriangleAlert, User, Bell } from "lucide-react";
import { ASIAKAS, YHTEENVETO } from "@/lib/asiakas-mock";

const ITEMS = [
  { href: "/asiakas", label: "Yleiskuva", Icon: LayoutGrid },
  { href: "/asiakas/hoitoalueet", label: "Hoitoalueet", Icon: Building2 },
  { href: "/asiakas/havainnot", label: "Havainnot", Icon: TriangleAlert },
  { href: "/asiakas/profiili", label: "Profiili", Icon: User },
] as const;

function onAktiivinen(pathname: string, href: string) {
  return href === "/asiakas"
    ? pathname === "/asiakas"
    : pathname.startsWith(href);
}

export function AsiakasChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const avoimet = YHTEENVETO.avoimetHavainnot;

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      {/* Ylätunniste */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Link
            href="/asiakas"
            aria-label="Viara — asiakasportaali"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Image
              src="/viara-logo.png"
              alt="Viara"
              width={420}
              height={135}
              priority
              className="logo-blend h-auto w-28 md:w-32"
            />
          </Link>

          {/* Työpöydän vaakanavigaatio */}
          <nav
            aria-label="Asiakasnavigaatio"
            className="hidden items-center gap-1 md:flex"
          >
            {ITEMS.map(({ href, label, Icon }) => {
              const aktiivinen = onAktiivinen(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={aktiivinen ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    aktiivinen
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={aktiivinen ? 2 : 1.75}
                  />
                  {label}
                  {href === "/asiakas/havainnot" && avoimet > 0 && (
                    <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                      {avoimet}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label={`Ilmoitukset, ${avoimet} avointa`}
              className="metal-card relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Bell className="h-5 w-5" strokeWidth={1.75} />
              {avoimet > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-white">
                  {avoimet}
                </span>
              )}
            </button>
            <Link
              href="/asiakas/profiili"
              aria-label={`Profiili — ${ASIAKAS.nimi}`}
              className="metal-card flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-foreground transition-transform duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {ASIAKAS.nimikirjaimet}
            </Link>
          </div>
        </div>
      </header>

      {/* Sisältö */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-6 md:pb-10 lg:px-8">
        {children}
      </main>

      {/* Mobiilin alanavigaatio */}
      <nav
        aria-label="Asiakasnavigaatio"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/90 backdrop-blur-md md:hidden"
      >
        <ul className="flex items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {ITEMS.map(({ href, label, Icon }) => {
            const aktiivinen = onAktiivinen(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={aktiivinen ? "page" : undefined}
                  className={`relative flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    aktiivinen
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted"
                  }`}
                >
                  <span className="relative">
                    <Icon
                      className="h-6 w-6"
                      strokeWidth={aktiivinen ? 2 : 1.75}
                    />
                    {href === "/asiakas/havainnot" && avoimet > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                        {avoimet}
                      </span>
                    )}
                  </span>
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
