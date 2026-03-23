"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MultiSelectGroup } from "@/components/multi-select-group";
import { ERAS, GENRES, MOODS, PACING_OPTIONS } from "@/lib/constants";
import type { OutsideRecommendation } from "@/lib/recommendation";
import { formatGenres } from "@/lib/utils";

type GuestRecommendation = {
  contentId: string;
  title: string;
  explanation: string;
};

export default function GuestClient({
  favoriteGenres,
  favoriteMoods,
  favoriteEras,
  pacingPreference,
  naturalLanguagePrompt,
  recommendations,
  outsideRecommendations,
  error,
}: {
  favoriteGenres: string[];
  favoriteMoods: string[];
  favoriteEras: string[];
  pacingPreference: string;
  naturalLanguagePrompt: string;
  recommendations: GuestRecommendation[];
  outsideRecommendations: OutsideRecommendation[];
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const hasInput =
    favoriteGenres.length > 0 ||
    favoriteMoods.length > 0 ||
    favoriteEras.length > 0 ||
    Boolean(pacingPreference) ||
    Boolean(naturalLanguagePrompt.trim());

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    formData.getAll("favoriteGenres").forEach((value) => params.append("favoriteGenres", String(value)));
    formData.getAll("favoriteMoods").forEach((value) => params.append("favoriteMoods", String(value)));
    formData.getAll("favoriteEras").forEach((value) => params.append("favoriteEras", String(value)));

    const pacing = String(formData.get("pacingPreference") ?? "").trim();
    if (pacing) {
      params.set("pacingPreference", pacing);
    }

    const prompt = String(formData.get("naturalLanguagePrompt") ?? "").trim();
    if (prompt) {
      params.set("naturalLanguagePrompt", prompt);
    }

    startTransition(() => {
      router.push(`/guest${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }

  const showLoading = isPending;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 16px 56px" }}>
      <section style={{ background: "linear-gradient(180deg, rgba(18,18,18,0.98), rgba(9,9,9,0.98))", borderRadius: 22, padding: "28px 20px", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 28px 90px rgba(0,0,0,0.35)" }}>
        <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Guest mode</p>
        <div style={{ display: "grid", gap: 18, alignItems: "start", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: 32, lineHeight: 1.1, margin: 0, fontWeight: 700 }}>Try recommendations without creating an account</h1>
            <p style={{ color: "rgba(255,255,255,0.78)", marginTop: 10, fontSize: 14, lineHeight: 1.7, maxWidth: 560 }}>
              Build a quick taste profile, then compare titles from the CineMatch catalog with outside recommendations imagined by the model.
            </p>
          </div>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
            <div style={{ borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px" }}>
              <p style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: 14 }}>Left Column</p>
              <p style={{ color: "rgba(255,255,255,0.58)", margin: "6px 0 0", fontSize: 13 }}>Local database matches</p>
            </div>
            <div style={{ borderRadius: 16, background: "rgba(138,209,255,0.08)", border: "1px solid rgba(138,209,255,0.16)", padding: "14px 16px" }}>
              <p style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: 14 }}>Right Column</p>
              <p style={{ color: "rgba(255,255,255,0.58)", margin: "6px 0 0", fontSize: 13 }}>Open-world AI ideas</p>
            </div>
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.4)", borderRadius: 8 }}>
            <p style={{ color: "#ff6b6b", fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ marginTop: 24, display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Favorite genres</label>
            <MultiSelectGroup name="favoriteGenres" options={GENRES} selected={favoriteGenres} />
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Moods</label>
            <MultiSelectGroup name="favoriteMoods" options={MOODS} selected={favoriteMoods} />
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Favorite eras</label>
            <MultiSelectGroup name="favoriteEras" options={ERAS} selected={favoriteEras} />
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Pacing</label>
            <select name="pacingPreference" defaultValue={pacingPreference} style={{ width: "100%", background: "#0a0a0a", color: "#fff", borderRadius: 8, border: "1px solid #222", padding: "8px 10px", fontSize: 14 }}>
              <option value="">Any pacing</option>
              {PACING_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <label style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Natural-language request</label>
            <textarea name="naturalLanguagePrompt" defaultValue={naturalLanguagePrompt} placeholder="Example: I want a clever sci-fi movie with emotional payoff but not something too dark." style={{ width: "100%", background: "#0a0a0a", color: "#fff", borderRadius: 8, border: "1px solid #222", padding: "12px", minHeight: 120, fontSize: 14, boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 420, display: "grid", gap: showLoading ? 10 : 0 }}>
              <button
                type="submit"
                disabled={showLoading}
                style={{
                  background: showLoading ? "#8b0000" : "#e50914",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "12px 28px",
                  border: "none",
                  boxShadow: "0 12px 30px rgba(229,9,20,0.28)",
                  width: "100%",
                  fontWeight: 700,
                  cursor: showLoading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {showLoading ? "Generating real AI recommendations..." : "Get guest recommendations"}
              </button>
              {showLoading ? (
                <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 14px" }}>
                  <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>
                    Building your guest recommendation pair...
                  </p>
                  <div style={{ height: 8, marginTop: 10, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ width: "48%", height: "100%", background: "linear-gradient(90deg, #e50914, #ff6b6b)", animation: "guest-button-progress 1.15s ease-in-out infinite alternate" }} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </form>

        <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/register" style={{ color: "#ddd", padding: "8px 14px", borderRadius: 999, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", textDecoration: "none", fontSize: "0.875rem" }}>Create full account</Link>
          <Link href="/" style={{ color: "#ddd", padding: "8px 14px", borderRadius: 999, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", textDecoration: "none", fontSize: "0.875rem" }}>Back home</Link>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "22px 0 18px" }} />

      <section style={{ background: "linear-gradient(180deg, rgba(14,14,14,0.98), rgba(8,8,8,0.98))", borderRadius: 22, padding: "24px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#e50914", marginBottom: 8 }}>Results</p>
        <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: 20, margin: 0, fontWeight: 700 }}>Guest recommendation preview</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
          {hasInput
            ? "Here are the results based on your selections. Real AI generation may take 10 to 60 seconds depending on provider latency."
            : "Pick a few genres or moods and optionally add a freeform prompt to generate recommendations."}
        </p>

        {hasInput ? (
          <>
            <div style={{ marginTop: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Current guest profile</p>
              <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8 }}>
                {favoriteGenres.length ? formatGenres(favoriteGenres) : "No genres selected"}
                &nbsp;&bull;&nbsp;
                {favoriteMoods.length ? favoriteMoods.join(", ") : "No moods selected"}
                &nbsp;&bull;&nbsp;
                {favoriteEras.length ? favoriteEras.join(", ") : "Any era"}
                &nbsp;&bull;&nbsp;
                {pacingPreference || "Any pacing"}
              </p>
            </div>

            {showLoading ? (
              <div style={{ marginTop: 18, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: 24 }}>
                <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>Searching with real AI...</p>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.7, margin: "8px 0 0" }}>
                  We&apos;re asking for 5 library picks on the left and 5 open-world AI ideas on the right.
                </p>
                <div style={{ height: 8, marginTop: 16, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                  <div style={{ width: "45%", height: "100%", background: "linear-gradient(90deg, #e50914, #ff6b6b)", animation: "guest-loading 1.2s ease-in-out infinite alternate" }} />
                </div>
              </div>
            ) : recommendations.length || outsideRecommendations.length ? (
              <div style={{ display: "grid", gap: 18, marginTop: 18, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "start" }}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#ff6b6b", marginBottom: 6 }}>From our library</p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>These titles exist in CineMatch and can be opened, rated, and reviewed.</p>
                  </div>
                  {recommendations.map((item, index) => (
                    <article key={`${item.contentId}-${index}`} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.1rem", boxShadow: "0 18px 40px rgba(0,0,0,0.18)" }}>
                      <div style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "0.75rem", marginBottom: 10 }}>
                        #{index + 1}
                      </div>
                      <h3 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.15rem", margin: "0 0 8px", fontWeight: 700 }}>
                        {item.title}
                      </h3>
                      <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
                        {item.explanation}
                      </p>
                    </article>
                  ))}
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "#8ad1ff", marginBottom: 6 }}>AI open-world picks</p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>These are model-suggested ideas and may not exist in the local CineMatch catalog.</p>
                  </div>
                  {outsideRecommendations.map((item, index) => (
                    <article key={`${item.title}-${index}`} style={{ background: "rgba(138,209,255,0.07)", border: "1px solid rgba(138,209,255,0.18)", borderRadius: 16, padding: "1.1rem", boxShadow: "0 18px 40px rgba(0,0,0,0.18)" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(138,209,255,0.12)", color: "#dff4ff", fontSize: "0.75rem" }}>#{index + 1}</span>
                        <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(138,209,255,0.12)", color: "#dff4ff", fontSize: "0.75rem" }}>{item.type}</span>
                        <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(138,209,255,0.12)", color: "#dff4ff", fontSize: "0.75rem" }}>{item.year}</span>
                      </div>
                      <h3 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.15rem", margin: "0 0 8px", fontWeight: 700 }}>
                        {item.title}
                      </h3>
                      <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
                        {item.explanation}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 18, borderRadius: 8, border: "1px dashed rgba(255,255,255,0.04)", background: "#0f0f0f", padding: 24, textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>No AI recommendations are available for this request yet.</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ marginTop: 18, borderRadius: 8, border: "1px dashed rgba(255,255,255,0.04)", background: "#0f0f0f", padding: 40, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Select some genres or moods above to see AI recommendations appear here.</p>
          </div>
        )}

        <style jsx>{`
          @keyframes guest-loading {
            from {
              transform: translateX(-15%);
            }
            to {
              transform: translateX(95%);
            }
          }

          @keyframes guest-button-progress {
            from {
              transform: translateX(-18%);
            }
            to {
              transform: translateX(102%);
            }
          }

          @media (max-width: 640px) {
            section {
              border-radius: 18px;
            }
          }
        `}</style>
      </section>
    </div>
  );
}
