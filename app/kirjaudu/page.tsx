"use client";

import Image from "next/image";
import { useActionState } from "react";
import { kirjaudu } from "@/app/actions/kirjaudu";

type KirjautumisTulos = {
  success: boolean;
  error?: string;
  rooli?: string;
};

const alkuTila: KirjautumisTulos = {
  success: false,
};

export default function KirjauduPage() {
  const [tulos, formAction, pending] = useActionState(
    async (_previousState: KirjautumisTulos, formData: FormData) => {
      return kirjaudu(formData);
    },
    alkuTila
  );

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 pb-8 text-center">
          <Image
            src="/viara-logo.png"
            alt="Viara logo"
            width={280}
            height={90}
            priority
            className="h-auto w-40"
          />
          <p className="text-sm font-medium text-slate-500">
            Operational Maintenance Platform
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">
              Kirjaudu sisään
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Syötä tunnuksesi jatkaaksesi.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Sähköposti
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                placeholder="nimi@yritys.fi"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Salasana
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                placeholder="••••••••"
              />
            </div>

            {tulos.error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {tulos.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Kirjaudutaan…" : "Kirjaudu"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Viara. Kaikki oikeudet pidätetään.
        </p>
      </div>
    </main>
  );
}
