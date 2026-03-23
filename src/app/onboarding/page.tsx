import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MultiSelectGroup } from "@/components/multi-select-group";
import { StatusBanner } from "@/components/status-banner";
import { SubmitButton } from "@/components/submit-button";
import { ERAS, GENRES, MOODS, PACING_OPTIONS, VIEWING_HABITS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { logoutAction, saveOnboardingAction } from "@/server/actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;
  const profile = session.user.profile;

  if (!profile) {
    redirect("/login?error=Your profile is missing. Please sign in again.");
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "0 24px 60px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Navigation header */}
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
            <form action={logoutAction} style={{ display: "inline" }}>
              <button type="submit" style={{ background: "#e50914", color: "#fff", borderRadius: 999, padding: "8px 20px", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
                Log out
              </button>
            </form>
          </nav>
        </header>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "28px 0" }} />

        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem", marginTop: 32 }}>
          <p style={{ color: "#e50914", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 8 }}>
            Onboarding questionnaire
          </p>
          <h1 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.75rem", margin: "0 0 10px", fontWeight: 700 }}>
            Build your baseline taste profile
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            This form maps directly to the assignment requirements: favorite genres, mood preferences, viewing habits, era preferences, and pacing.
          </p>
        </div>

        {/* Banners */}
        {params.success && <div style={{ marginTop: 16 }}><StatusBanner message={params.success} /></div>}
        {params.error && <div style={{ marginTop: 16 }}><StatusBanner kind="error" message={params.error} /></div>}

        <form action={saveOnboardingAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: 16 }}>
          {/* Genres */}
          <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem" }}>
            <p style={{ color: "#e50914", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Genres
            </p>
            <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 700 }}>
              What do you usually watch?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "1rem" }}>Choose as many as you like.</p>
            <MultiSelectGroup name="favoriteGenres" options={GENRES} selected={profile.favoriteGenres} />
          </section>

          {/* Moods */}
          <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem" }}>
            <p style={{ color: "#e50914", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Moods
            </p>
            <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 700 }}>
              How should your picks feel?
            </h2>
            <MultiSelectGroup name="favoriteMoods" options={MOODS} selected={profile.favoriteMoods} />
          </section>

          {/* Viewing Habits */}
          <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem" }}>
            <p style={{ color: "#e50914", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Viewing Habits
            </p>
            <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 700 }}>
              When do you watch?
            </h2>
            <MultiSelectGroup name="viewingHabits" options={VIEWING_HABITS} selected={profile.viewingHabits} />
          </section>

          {/* Favorite Eras */}
          <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem" }}>
            <p style={{ color: "#e50914", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Favorite Eras
            </p>
            <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 700 }}>
              What decade do you prefer?
            </h2>
            <MultiSelectGroup name="favoriteEras" options={ERAS} selected={profile.favoriteEras} />
          </section>

          {/* Pacing */}
          <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem" }}>
            <p style={{ color: "#e50914", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Pacing
            </p>
            <h2 style={{ fontFamily: "Georgia, serif", color: "#ffffff", fontSize: "1.25rem", marginBottom: "1rem", fontWeight: 700 }}>
              How fast do you like your stories to move?
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {PACING_OPTIONS.map((option) => {
                const isSelected = profile.pacingPreference === option;
                return (
                  <label
                    key={option}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: isSelected ? "1px solid #e50914" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: "1rem 1.25rem",
                      cursor: "pointer",
                      display: "block",
                    }}
                  >
                    <input
                      type="radio"
                      name="pacingPreference"
                      value={option}
                      defaultChecked={isSelected}
                      style={{ display: "none" }}
                    />
                    <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4, fontSize: "0.95rem" }}>
                      {option}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                      {option === "Slow"
                        ? "Patient, meditative stories."
                        : option === "Moderate"
                          ? "Balanced pace with room to breathe."
                          : "Quick hooks and fast progression."}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
            <SubmitButton>Save taste profile</SubmitButton>
          </div>
        </form>
      </div>

      <style>{`
        input[type="radio"]:checked + div {
          color: #e50914 !important;
        }
        label:has(input[type="radio"]:checked) {
          border-color: #e50914 !important;
        }
      `}</style>
    </div>
  );
}
