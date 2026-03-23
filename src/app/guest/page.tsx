"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MultiSelectGroup } from "@/components/multi-select-group";
import { ERAS, GENRES, MOODS, PACING_OPTIONS } from "@/lib/constants";
import { arrayFromSearchParam, formatGenres } from "@/lib/utils";

export default function GuestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const favoriteGenres = arrayFromSearchParam(searchParams.get("favoriteGenres") ?? undefined);
  const favoriteMoods = arrayFromSearchParam(searchParams.get("favoriteMoods") ?? undefined);
  const favoriteEras = arrayFromSearchParam(searchParams.get("favoriteEras") ?? undefined);
  const pacingPreference = searchParams.get("pacingPreference") ?? "";
  const naturalLanguagePrompt = searchParams.get("naturalLanguagePrompt") ?? "";
  const errorMsg = searchParams.get("error") ?? undefined;

  const hasInput =
    favoriteGenres.length > 0 ||
    favoriteMoods.length > 0 ||
    Boolean(pacingPreference) ||
    Boolean(naturalLanguagePrompt.trim());

  function buildUrl(formData: FormData): string {
    const params = new URLSearchParams();
    const genres = formData.getAll("favoriteGenres");
    const moods = formData.getAll("favoriteMoods");
    const eras = formData.getAll("favoriteEras");
    if (genres.length) params.set("favoriteGenres", genres.join(","));
    if (moods.length) params.set("favoriteMoods", moods.join(","));
    if (eras.length) params.set("favoriteEras", eras.join(","));
    const pacing = formData.get("pacingPreference") as string;
    if (pacing) params.set("pacingPreference", pacing);
    const prompt = formData.get("naturalLanguagePrompt") as string;
    if (prompt.trim()) params.set("naturalLanguagePrompt", prompt.trim());
    return `/guest${params.toString() ? "?" + params.toString() : ""}`;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const url = buildUrl(formData);
    router.push(url);
  }

  return (
    <main style={{ padding: 0 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        <section style={{ background: "#070707", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Guest mode</p>
          <h1 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: 28, margin: 0, fontWeight: 700 }}>Try recommendations without creating an account</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
            This guest flow gives you a taste of CineMatch recommendations. Nothing on this page is stored.
          </p>

          {errorMsg ? (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.4)", borderRadius: 8 }}>
              <p style={{ color: "#ff6b6b", fontSize: 14, margin: 0 }}>AI recommendation failed: {decodeURIComponent(errorMsg)}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Favorite genres</label>
              <MultiSelectGroup name="favoriteGenres" options={GENRES} selected={favoriteGenres} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Moods</label>
              <MultiSelectGroup name="favoriteMoods" options={MOODS} selected={favoriteMoods} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Favorite eras</label>
              <MultiSelectGroup name="favoriteEras" options={ERAS} selected={favoriteEras} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Pacing</label>
              <select name="pacingPreference" defaultValue={pacingPreference} style={{ width: "100%", background: "#0a0a0a", color: "#fff", borderRadius: 8, border: "1px solid #222", padding: "8px 10px", fontSize: 14 }}>
                <option value="">Any pacing</option>
                {PACING_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Natural-language request</label>
              <textarea name="naturalLanguagePrompt" defaultValue={naturalLanguagePrompt} placeholder="Example: I want a clever sci-fi movie with emotional payoff but not something too dark." style={{ width: "100%", background: "#0a0a0a", color: "#fff", borderRadius: 8, border: "1px solid #222", padding: "12px", minHeight: 120, fontSize: 14, boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? "#8b0000" : "#e50914",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "12px 28px",
                  border: "none",
                  boxShadow: "0 12px 30px rgba(229,9,20,0.28)",
                  maxWidth: 360,
                  width: "100%",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {loading ? "Getting recommendations..." : "Get guest recommendations"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/register" style={{ color: "#ddd", padding: "8px 14px", borderRadius: 999, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", textDecoration: "none", fontSize: "0.875rem" }}>Create full account</Link>
            <Link href="/" style={{ color: "#ddd", padding: "8px 14px", borderRadius: 999, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", textDecoration: "none", fontSize: "0.875rem" }}>Back home</Link>
          </div>
        </section>

        <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "22px 0" }} />

        <section style={{ background: "#070707", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Results</p>
          <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: 20, margin: 0, fontWeight: 700 }}>Guest recommendation preview</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
            {hasInput
              ? "Here are the results based on your selections. The AI is generating personalized recommendations from our content pool."
              : "Pick a few genres or moods and optionally add a freeform prompt to generate recommendations."}
          </p>

          {hasInput ? (
            <div style={{ marginTop: 16, borderRadius: 8, background: "rgba(255,255,255,0.03)", padding: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Current guest profile</p>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8 }}>
                {favoriteGenres.length ? formatGenres(favoriteGenres) : "No genres selected"}
                &nbsp;&bull;&nbsp;
                {favoriteMoods.length ? favoriteMoods.join(", ") : "No moods selected"}
                &nbsp;&bull;&nbsp;
                {pacingPreference || "Any pacing"}
              </p>
            </div>
          ) : (
            <div style={{ marginTop: 18, borderRadius: 8, border: "1px dashed rgba(255,255,255,0.04)", background: "#0f0f0f", padding: 40, textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Select some genres or moods above to see AI recommendations appear here.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
