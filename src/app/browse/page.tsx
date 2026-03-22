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
    <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "0 24px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Card wrapper */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem", marginTop: 32 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "#e50914", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 8 }}>
              Content browsing
            </p>
            <h1 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.75rem", margin: "0 0 10px", fontWeight: 700 }}>
              Filter the catalog
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: "40rem" }}>
              Browse by genre, release year, and minimum rating.
            </p>
          </div>

          {/* Filters */}
          <form style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <select
              name="genre"
              defaultValue={genre ?? ""}
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", width: "100%", colorScheme: "dark", fontSize: "0.875rem" }}
            >
              <option value="">All genres</option>
              {GENRES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              name="year"
              defaultValue={year ? String(year) : ""}
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", width: "100%", colorScheme: "dark", fontSize: "0.875rem" }}
            >
              <option value="">All years</option>
              {years.map((item) => (
                <option key={item.year} value={item.year}>
                  {item.year}
                </option>
              ))}
            </select>
            <select
              name="rating"
              defaultValue={rating ? String(rating) : ""}
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", width: "100%", colorScheme: "dark", fontSize: "0.875rem" }}
            >
              <option value="">Any rating</option>
              {[4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}+ stars
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{ gridColumn: "1 / -1", background: "#e50914", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
            >
              Apply filters
            </button>
          </form>

          {/* Banners */}
          {params.success && <StatusBanner message={params.success} />}
          {params.error && <StatusBanner kind="error" message={params.error} />}

          {/* Results */}
          <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
            {content.map((item) => (
              <article key={item.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "0.75rem" }}>{item.type}</span>
                  <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "0.75rem" }}>{item.year}</span>
                  <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(229,9,20,0.12)", color: "#ff6b6b", fontSize: "0.75rem" }}>{item.averageRating.toFixed(1)} stars</span>
                </div>
                <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.2rem", margin: "0 0 6px", fontWeight: 700 }}>
                  {item.title}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: "0 0 10px" }}>
                  {formatGenres(item.genres)} &bull; {item.pacing} pacing
                </p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 14 }}>
                  {item.summary}
                </p>
                <Link
                  href={`/content/${item.slug}`}
                  style={{ display: "inline-block", padding: "8px 18px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}
                >
                  View details
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
