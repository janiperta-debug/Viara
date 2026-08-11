"use client";

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
    async (
      _previousState: KirjautumisTulos,
      formData: FormData
    ) => {
      return kirjaudu(formData);
    },
    alkuTila
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">
          Viara
        </h1>

        <p className="mt-2 text-gray-600">
          Kirjaudu sisään
        </p>

        <form
          action={formAction}
          className="mt-8 space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium"
            >
              Sähköposti
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium"
            >
              Salasana
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          {tulos.error && (
            <p className="text-sm text-red-600">
              {tulos.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-green-600 px-4 py-3 text-white disabled:opacity-50"
          >
            {pending ? "Kirjaudutaan..." : "Kirjaudu"}
          </button>
        </form>
      </div>
    </main>
  );
}