"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { kirjaudu } from "@/app/actions/kirjaudu";
import { LanguageToggle } from "@/components/language-toggle";

type KirjautumisTulos = {
  success: boolean;
  error?: string;
  rooli?: string;
};

const alkuTila: KirjautumisTulos = {
  success: false,
};

export default function KirjauduPage() {
  const router = useRouter();
  const navigoitu = useRef(false);
  const [tulos, formAction, pending] = useActionState(
    async (_previousState: KirjautumisTulos, formData: FormData) => {
      return kirjaudu(formData);
    },
    alkuTila
  );

  useEffect(() => {
    if (tulos.success && !navigoitu.current) {
      navigoitu.current = true;
      switch (tulos.rooli) {
        case "asiakas":
          router.push("/asiakas");
          break;
        case "tyonjohto":
        case "admin":
          router.push("/valitse");
          break;
        default:
          router.push("/tyo");
      }
    }
  }, [tulos.success, tulos.rooli, router]);

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 pb-8 text-center">
          <Image
            src="/viara-logo.png"
            alt="Viara"
            width={560}
            height={180}
            priority
            className="logo-blend h-auto w-72"
          />
          <LanguageToggle />
          <p className="text-sm font-medium tracking-wide text-muted">
            The work speaks for itself.
          </p>
        </div>

        <div className="metal-card rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">
              Kirjaudu sisään
            </h1>
            <p className="mt-1 text-sm text-muted">
              Syötä tunnuksesi jatkaaksesi.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Sähköposti
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-base text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="nimi@yritys.fi"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Salasana
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-base text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>

            {tulos.error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {tulos.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-primary flex h-12 w-full items-center justify-center rounded-full text-base font-semibold text-primary-foreground transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Kirjaudutaan…" : "Kirjaudu"}
            </button>
          </form>
        </div>

        {/* Lakitekstien linkit — kohteet ja sisältö toimitetaan myöhemmin. */}
        <nav
          aria-label="Lakitekstit"
          className="mt-6 flex items-center justify-center gap-3 text-xs font-medium text-muted"
        >
          <a href="#" className="hover:text-foreground hover:underline">
            Tietosuojaseloste
          </a>
          <span aria-hidden>·</span>
          <a href="#" className="hover:text-foreground hover:underline">
            Käyttöehdot
          </a>
          <span aria-hidden>·</span>
          <a href="#" className="hover:text-foreground hover:underline">
            Evästeet
          </a>
        </nav>

        <p className="mt-3 text-center text-xs text-muted">
          © {new Date().getFullYear()} Viara. Kaikki oikeudet pidätetään.
        </p>
      </div>
    </main>
  );
}
