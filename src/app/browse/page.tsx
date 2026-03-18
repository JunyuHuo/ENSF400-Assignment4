import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBanner } from "@/components/status-banner";
import { GENRES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGenres } from "@/lib/utils";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    success?: string;
    genre?: string;
    year?: string;
    rating?: string;
  }>;
}) {
  const session = await requireUser();
  const params = await searchParams;

  const genre = params.genre;
  const year = params.year ? Number(params.year) : undefined;
  const rating = params.rating ? Number(params.rating) : undefined;

  const content = await prisma.content.findMany({
    where: {
      ...(genre ? { genres: { has: genre } } : {}),
      ...(year ? { year } : {}),
      ...(rating ? { averageRating: { gte: rating } } : {}),
    },
    orderBy: [{ averageRating: "desc" }, { title: "asc" }],
  });

  const years = await prisma.content.findMany({
    distinct: ["year"],
    select: { year: true },
    orderBy: { year: "desc" },
  });

  return (
    <AppShell user={session.user}>
      <section className="glass-card rounded-[32px] p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Content browsing</p>
            <h1 className="section-title mt-3">Filter the catalog</h1>
            <p className="muted mt-3 max-w-2xl">
              Browse by genre, release year, and minimum rating. This page directly covers the content filtering requirement in your earlier assignments.
            </p>
          </div>
          <form className="grid gap-3 sm:grid-cols-3">
            <select name="genre" defaultValue={genre ?? ""}>
              <option value="">All genres</option>
              {GENRES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select name="year" defaultValue={year ? String(year) : ""}>
              <option value="">All years</option>
              {years.map((item) => (
                <option key={item.year} value={item.year}>
                  {item.year}
                </option>
              ))}
            </select>
            <select name="rating" defaultValue={rating ? String(rating) : ""}>
              <option value="">Any rating</option>
              {[4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}+ stars
                </option>
              ))}
            </select>
            <button className="btn-primary sm:col-span-3" type="submit">
              Apply filters
            </button>
          </form>
        </div>
        <div className="mt-6 space-y-3">
          <StatusBanner message={params.success} />
          <StatusBanner kind="error" message={params.error} />
        </div>
        <div className="mt-8 grid-auto">
          {content.map((item) => (
            <article key={item.id} className="rounded-[28px] border border-[var(--line)] bg-white/82 p-5">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="pill">{item.type}</span>
                <span className="pill">{item.year}</span>
                <span className="pill">{item.averageRating.toFixed(1)} stars</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{item.title}</h2>
              <p className="muted mt-2 text-sm">{formatGenres(item.genres)} • {item.pacing} pacing</p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.summary}</p>
              <Link className="btn-ghost mt-5" href={`/content/${item.slug}`}>
                View details
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
