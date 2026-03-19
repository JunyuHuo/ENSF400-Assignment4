import Link from "next/link";
import { MultiSelectGroup } from "@/components/multi-select-group";
import { ERAS, GENRES, MOODS, PACING_OPTIONS } from "@/lib/constants";
import { generateGuestRecommendations } from "@/lib/recommendation";
import { arrayFromSearchParam, formatGenres } from "@/lib/utils";

export default async function GuestPage({
  searchParams,
}: {
  searchParams: Promise<{
    favoriteGenres?: string | string[];
    favoriteMoods?: string | string[];
    favoriteEras?: string | string[];
    pacingPreference?: string;
    naturalLanguagePrompt?: string;
  }>;
}) {
  const params = await searchParams;
  const favoriteGenres = arrayFromSearchParam(params.favoriteGenres);
  const favoriteMoods = arrayFromSearchParam(params.favoriteMoods);
  const favoriteEras = arrayFromSearchParam(params.favoriteEras);
  const pacingPreference = params.pacingPreference ?? "";
  const naturalLanguagePrompt = params.naturalLanguagePrompt ?? "";
  const hasInput = favoriteGenres.length > 0 || favoriteMoods.length > 0 || Boolean(pacingPreference) || Boolean(naturalLanguagePrompt.trim());

  const recommendations = hasInput
    ? await generateGuestRecommendations({
        favoriteGenres,
        favoriteMoods,
        pacingPreference: pacingPreference || null,
        naturalLanguagePrompt,
      })
    : [];

  return (
    <main style={{ padding: 0 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px", display: "block" }}>
        <section style={{ background: "#070707", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Guest mode</p>
          <h1 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: 28, margin: 0, fontWeight: 700 }}>Try recommendations without creating an account</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
            This guest flow gives you a taste of CineMatch recommendations. Nothing on this page is stored.
          </p>

          <form style={{ marginTop: 20, display: "block", gap: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Favorite genres</label>
              <MultiSelectGroup name="favoriteGenres" options={GENRES} selected={favoriteGenres} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Moods</label>
              <MultiSelectGroup name="favoriteMoods" options={MOODS} selected={favoriteMoods} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Favorite eras</label>
              <MultiSelectGroup name="favoriteEras" options={ERAS} selected={favoriteEras} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Pacing</label>
              <select name="pacingPreference" defaultValue={pacingPreference} style={{ width: "100%", background: "#0a0a0a", color: "#fff", borderRadius: 8, border: "1px solid #222", padding: "8px 10px" }}>
                <option value="" style={{ background: "#0a0a0a", color: "#fff" }}>Any pacing</option>
                {PACING_OPTIONS.map((option) => (
                  <option key={option} value={option} style={{ background: "#0a0a0a", color: "#fff" }}>{option}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Natural-language request</label>
              <textarea name="naturalLanguagePrompt" defaultValue={naturalLanguagePrompt} placeholder="Example: I want a clever sci-fi movie with emotional payoff but not something too dark." style={{ width: "100%", background: "#0a0a0a", color: "#fff", borderRadius: 8, border: "1px solid #222", padding: "12px", minHeight: 120, fontSize: 14 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
              <button type="submit" style={{ background: "#e50914", color: "#fff", borderRadius: 999, padding: "12px 28px", border: "none", boxShadow: "0 12px 30px rgba(229,9,20,0.28)", maxWidth: 360, width: "100%", fontWeight: 700, cursor: "pointer" }}>Get guest recommendations</button>
            </div>
          </form>

          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/register" style={{ color: "#ddd", padding: "8px 14px", borderRadius: 999, background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }}>Create full account</Link>
            <Link href="/" style={{ color: "#ddd", padding: "8px 14px", borderRadius: 999, background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }}>Back home</Link>
          </div>
        </section>

        <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "22px 0" }} />

        <section style={{ background: "#070707", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Results</p>
          <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: 20, margin: 0, fontWeight: 700 }}>Guest recommendation preview</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>Guest mode uses the same content pool and recommendation engine style, without persistent profile history.</p>

          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            {recommendations.length ? (
              recommendations.map((item, index) => (
                <article key={item.contentId} style={{ borderRadius: 8, background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.04)", padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 12 }}>#{index + 1}</span>
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 12 }}>{item.title}</span>
                    </div>
                    <div style={{ color: "#ff7b7b", fontWeight: 700 }}>★ {(item.score ?? 0).toFixed(1)}</div>
                  </div>
                  <p style={{ marginTop: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{item.explanation}</p>
                </article>
              ))
            ) : (
              <div style={{ borderRadius: 8, border: "1px dashed rgba(255,255,255,0.04)", background: "#0f0f0f", padding: 16 }}>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Pick a few genres or moods and optionally add a freeform prompt to generate recommendations.</p>
              </div>
            )}
          </div>

          {hasInput ? (
            <div style={{ marginTop: 16, borderRadius: 8, background: "rgba(255,255,255,0.03)", padding: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Current guest profile</p>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8 }}>{favoriteGenres.length ? formatGenres(favoriteGenres) : "No genres selected"} • {favoriteMoods.length ? favoriteMoods.join(", ") : "No moods selected"} • {pacingPreference || "Any pacing"}</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
