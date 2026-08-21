import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-foreground">403</h1>
        <p className="mt-2 text-sm text-muted">Ei käyttöoikeutta tähän näkymään.</p>
        <Link
          href="/kirjaudu"
          className="btn-primary mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-primary-foreground"
        >
          Siirry kirjautumaan
        </Link>
      </div>
    </main>
  );
}
