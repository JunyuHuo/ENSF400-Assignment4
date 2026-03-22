import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MultiSelectGroup } from "@/components/multi-select-group";
import { StatusBanner } from "@/components/status-banner";
import { SubmitButton } from "@/components/submit-button";
import { ERAS, GENRES, MOODS, PACING_OPTIONS, VIEWING_HABITS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { saveOnboardingAction } from "@/server/actions";

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
    <AppShell user={session.user}>
      <section className="glass-card rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">Onboarding questionnaire</p>
        <h1 className="section-title mt-3">Build your baseline taste profile</h1>
        <p className="muted mt-3 max-w-3xl">
          This form maps directly to the assignment requirements: favorite genres, mood preferences, viewing habits, era preferences, and pacing. You can revisit it later to refine your profile.
        </p>
        <div className="mt-6 space-y-3">
          <StatusBanner message={params.success} />
          <StatusBanner kind="error" message={params.error} />
        </div>
        <form action={saveOnboardingAction} className="mt-8 space-y-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Genres</h2>
            <p className="muted text-sm">Choose as many as you like.</p>
            <MultiSelectGroup name="favoriteGenres" options={GENRES} selected={profile.favoriteGenres} />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Moods</h2>
            <p className="muted text-sm">How should your picks feel?</p>
            <MultiSelectGroup name="favoriteMoods" options={MOODS} selected={profile.favoriteMoods} />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Viewing habits</h2>
            <MultiSelectGroup name="viewingHabits" options={VIEWING_HABITS} selected={profile.viewingHabits} />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Favorite eras</h2>
            <MultiSelectGroup name="favoriteEras" options={ERAS} selected={profile.favoriteEras} />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Pacing</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {PACING_OPTIONS.map((option) => (
                <label key={option} className="rounded-[20px] border border-[var(--line)] bg-white/75 p-4">
                  <input
                    className="mb-3 h-4 w-4"
                    type="radio"
                    name="pacingPreference"
                    value={option}
                    defaultChecked={profile.pacingPreference === option}
                  />
                  <div className="font-semibold">{option}</div>
                  <p className="muted mt-1 text-sm">
                    {option === "Slow"
                      ? "Patient, meditative stories."
                      : option === "Moderate"
                        ? "Balanced pace with room to breathe."
                        : "Quick hooks and fast progression."}
                  </p>
                </label>
              ))}
            </div>
          </div>
          <SubmitButton className="btn-primary">Save taste profile</SubmitButton>
        </form>
      </section>
    </AppShell>
  );
}
