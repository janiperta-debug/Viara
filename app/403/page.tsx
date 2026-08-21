export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-foreground">403</h1>
        <p className="mt-2 text-sm text-muted">Ei käyttöoikeutta tähän näkymään.</p>
      </div>
    </main>
  );
}
