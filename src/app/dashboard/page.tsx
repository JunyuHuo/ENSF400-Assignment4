import Link from "next/link";
import { redirect } from "next/navigation";
import { MultiSelectGroup } from "@/components/multi-select-group";
import { StatusBanner } from "@/components/status-banner";
import { SubmitButton } from "@/components/submit-button";
import { GENRES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { generateRecommendationBatch, getInteractionInsights, getLatestRecommendations } from "@/lib/recommendation";
import { generateRecommendationsAction } from "@/server/actions";
import { formatGenres } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;
  const profile = session.user.profile;

  if (!profile?.onboardingCompleted) {
    redirect("/onboarding?error=Complete your questionnaire first.");
  }

  const [initialBatch, interactionInsights] = await Promise.all([
    getLatestRecommendations(session.user.id),
    getInteractionInsights(session.user.id),
  ]);
  let latestBatch = initialBatch;

  if (!latestBatch) {
    latestBatch = await generateRecommendationBatch({
      userId: session.user.id,
    });
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "0 24px 60px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ padding: "40px 0 8px" }}>
          <p style={{ color: "#e50914", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 8 }}>
            Welcome back
          </p>
          <h1 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "2rem", margin: "0 0 4px", fontWeight: 700 }}>
            {session.user.name}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", margin: "4px 0 0" }}>
            {session.user.email} &bull; {session.user.role === "ADMIN" ? "Administrator" : "Member"}
          </p>

          {/* Navigation */}
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
            <Link href="/dashboard" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "8px 20px", color: "#fff", textDecoration: "none", fontSize: "0.875rem" }}>
              Dashboard
            </Link>
            <Link href="/browse" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "8px 20px", color: "#fff", textDecoration: "none", fontSize: "0.875rem" }}>
              Browse
            </Link>
            <Link href="/onboarding" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "8px 20px", color: "#fff", textDecoration: "none", fontSize: "0.875rem" }}>
              Taste Profile
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "8px 20px", color: "#fff", textDecoration: "none", fontSize: "0.875rem" }}>
                Admin
              </Link>
            )}
            <form action={`/api/auth/signout`} method="POST" style={{ display: "inline" }}>
              <button type="submit" style={{ background: "#e50914", color: "#fff", borderRadius: 999, padding: "8px 20px", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
                Log out
              </button>
            </form>
          </nav>
        </header>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "28px 0" }} />

        {/* Banners */}
        {params.success && <StatusBanner message={params.success} />}
        {params.error && <StatusBanner kind="error" message={params.error} />}

        {/* Recommendations card */}
        <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "#e50914", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 8 }}>
              Recommendation dashboard
            </p>
            <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.5rem", margin: "0 0 12px", fontWeight: 700 }}>
              Fresh picks for {session.user.name}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "36rem" }}>
              These recommendations reflect your onboarding profile, interaction history, and any manual adjustments you make. The current batch source is <strong style={{ color: "#fff" }}>{latestBatch.explanationSource}</strong>.
            </p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {latestBatch.items.map((item) => (
              <article key={item.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                      <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "0.75rem" }}>#{item.rank}</span>
                      <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "0.75rem" }}>{item.content.type}</span>
                      <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "0.75rem" }}>{item.content.year}</span>
                    </div>
                    <h3 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.2rem", margin: "0 0 6px", fontWeight: 700 }}>
                      {item.content.title}
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>
                      {formatGenres(item.content.genres)} &bull; {item.content.pacing} pacing &bull; Avg {item.content.averageRating.toFixed(1)} stars
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", lineHeight: 1.7, marginTop: 12 }}>
                      {item.explanation}
                    </p>
                  </div>
                  <Link href={`/content/${item.content.slug}`} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none", fontSize: "0.8rem", alignSelf: "flex-start" }}>
                    Open details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Manual adjustment card */}
        <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "#e50914", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 8 }}>
            Manual adjustment
          </p>
          <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.5rem", margin: "0 0 10px", fontWeight: 700 }}>
            Tune the next batch
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: 20 }}>
            Choose genres to encourage or suppress, or list title keywords to include or exclude.
          </p>

          <form action={generateRecommendationsAction} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
                Ask in natural language
              </label>
              <textarea
                name="naturalLanguagePrompt"
                maxLength={300}
                placeholder="Example: Give me a witty mystery series for a weeknight, not too dark."
                style={{ width: "100%", background: "#0d0d0d", color: "#fff", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", padding: "10px 14px", fontSize: "0.875rem", minHeight: 80, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
                Boost these genres
              </label>
              <MultiSelectGroup name="includeGenres" options={GENRES} selected={profile.includeGenres} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
                Exclude these genres
              </label>
              <MultiSelectGroup name="excludeGenres" options={GENRES} selected={profile.excludeGenres} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
                Titles or keywords to include
              </label>
              <input
                name="includeTitles"
                defaultValue={profile.includeTitles.join(", ")}
                placeholder="e.g. Spider, murder mystery, animated"
                style={{ width: "100%", background: "#0d0d0d", color: "#fff", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", padding: "10px 14px", fontSize: "0.875rem", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
                Titles or keywords to exclude
              </label>
              <input
                name="excludeTitles"
                defaultValue={profile.excludeTitles.join(", ")}
                placeholder="e.g. horror, zombies"
                style={{ width: "100%", background: "#0d0d0d", color: "#fff", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", padding: "10px 14px", fontSize: "0.875rem", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
                Apply changes as
              </label>
              <select
                name="mode"
                defaultValue="one-time"
                style={{ width: "100%", background: "#1a1a1a", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", fontSize: "0.875rem", colorScheme: "dark" }}
              >
                <option value="one-time">One-time override</option>
                <option value="permanent">Permanent profile change</option>
              </select>
            </div>
            <SubmitButton>Generate new batch</SubmitButton>
          </form>
        </section>

        {/* Interaction insights card */}
        <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "#e50914", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 8 }}>
            Interaction insights
          </p>
          <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.5rem", margin: "0 0 10px", fontWeight: 700 }}>
            Your feedback is shaping the engine
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: 20 }}>
            {interactionInsights.summary || "Once you start rating, reviewing, and commenting, this panel will summarize what the engine is learning from you."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {interactionInsights.highlights.length ? (
              interactionInsights.highlights.map((line) => (
                <div key={line} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", fontSize: "0.875rem", color: "rgba(255,255,255,0.8)" }}>
                  {line}
                </div>
              ))
            ) : (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>No interaction history yet.</p>
            )}
          </div>
        </section>

        {/* Profile summary card */}
        <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "#e50914", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 8 }}>
            Profile summary
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: 16 }}>
            {profile.recommendationSummary ?? "Complete the onboarding form to create a profile summary."}
          </p>
          {profile.favoriteGenres.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {profile.favoriteGenres.map((genre) => (
                <span key={genre} style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.5)", color: "rgba(255,255,255,0.85)", fontSize: "0.75rem" }}>
                  {genre}
                </span>
              ))}
            </div>
          )}
          {profile.favoriteMoods.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {profile.favoriteMoods.map((mood) => (
                <span key={mood} style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>
                  {mood}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
