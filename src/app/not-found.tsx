import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell max-w-2xl">
      <section className="glass-card rounded-[32px] p-8 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">That page does not exist.</h1>
        <p className="muted mt-3">
          Head back to the dashboard or browse page to keep exploring the catalog.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link className="btn-primary" href="/dashboard">
            Dashboard
          </Link>
          <Link className="btn-ghost" href="/browse">
            Browse
          </Link>
        </div>
      </section>
    </main>
  );
}
