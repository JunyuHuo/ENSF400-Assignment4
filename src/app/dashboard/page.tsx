import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
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
    <AppShell user={session.user}>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="glass-card rounded-[32px] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Recommendation dashboard</p>
              <h1 className="section-title mt-3">Fresh picks for {session.user.name}</h1>
              <p className="muted mt-3 max-w-3xl">
                These recommendations reflect your onboarding profile, interaction history, and any manual adjustments you make. The current batch source is <strong>{latestBatch.explanationSource}</strong>.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="pill">At least 5 recommendations</span>
              <span className="pill">2-3 sentence explanations</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <StatusBanner message={params.success} />
            <StatusBanner kind="error" message={params.error} />
          </div>
          <div className="mt-8 grid gap-4">
            {latestBatch.items.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-[var(--line)] bg-white/80 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pill">#{item.rank}</span>
                      <span className="pill">{item.content.type}</span>
                      <span className="pill">{item.content.year}</span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold">{item.content.title}</h2>
                    <p className="muted mt-2 text-sm">
                      {formatGenres(item.content.genres)} • {item.content.pacing} pacing • Avg rating {item.content.averageRating.toFixed(1)}
                    </p>
                    <p className="mt-4 leading-7 text-[var(--muted)]">{item.explanation}</p>
                  </div>
                  <Link className="btn-ghost shrink-0" href={`/content/${item.content.slug}`}>
                    Open details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="space-y-6">
          <section className="glass-card rounded-[32px] p-6">
            <p className="eyebrow">Manual adjustment</p>
            <h2 className="mt-3 text-2xl font-semibold">Tune the next batch</h2>
            <p className="muted mt-3 text-sm leading-7">
              Choose genres to encourage or suppress, or list title keywords to include or exclude. This covers the manual recommendation change requirement from your Assignment 1 design.
            </p>
            <form action={generateRecommendationsAction} className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Ask in natural language</label>
                <textarea
                  name="naturalLanguagePrompt"
                  maxLength={300}
                  placeholder="Example: Give me a witty mystery series for a weeknight, not too dark."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Boost these genres</label>
                <MultiSelectGroup name="includeGenres" options={GENRES} selected={profile.includeGenres} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exclude these genres</label>
                <MultiSelectGroup name="excludeGenres" options={GENRES} selected={profile.excludeGenres} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Titles or keywords to include</label>
                <input
                  name="includeTitles"
                  defaultValue={profile.includeTitles.join(", ")}
                  placeholder="e.g. Spider, murder mystery, animated"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Titles or keywords to exclude</label>
                <input
                  name="excludeTitles"
                  defaultValue={profile.excludeTitles.join(", ")}
                  placeholder="e.g. horror, zombies"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Apply changes as</label>
                <select name="mode" defaultValue="one-time">
                  <option value="one-time">One-time override</option>
                  <option value="permanent">Permanent profile change</option>
                </select>
              </div>
              <SubmitButton>Generate new batch</SubmitButton>
            </form>
          </section>
          <section className="glass-card rounded-[32px] p-6">
            <p className="eyebrow">Interaction insights</p>
            <h2 className="mt-3 text-2xl font-semibold">Your feedback is shaping the engine</h2>
            <p className="muted mt-3 text-sm leading-7">
              {interactionInsights.summary || "Once you start rating, reviewing, and commenting, this panel will summarize what the engine is learning from you."}
            </p>
            <div className="mt-5 space-y-3">
              {interactionInsights.highlights.length ? (
                interactionInsights.highlights.map((line) => (
                  <div key={line} className="rounded-[20px] border border-[var(--line)] bg-white/75 p-3 text-sm">
                    {line}
                  </div>
                ))
              ) : (
                <p className="muted text-sm">No interaction history yet.</p>
              )}
            </div>
          </section>
          <section className="glass-card rounded-[32px] p-6">
            <p className="eyebrow">Profile summary</p>
            <p className="mt-3 leading-7 text-[var(--muted)]">
              {profile.recommendationSummary ??
                "Complete the onboarding form to create a profile summary."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              {profile.favoriteGenres.map((genre) => (
                <span key={genre} className="pill">
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {profile.favoriteMoods.map((mood) => (
                <span key={mood} className="pill">
                  {mood}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
