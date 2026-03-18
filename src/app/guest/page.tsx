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
    <main className="page-shell">
      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="glass-card rounded-[32px] p-6 md:p-8">
          <p className="eyebrow">Guest mode</p>
          <h1 className="section-title mt-3">Try recommendations without creating an account</h1>
          <p className="muted mt-3 text-sm leading-7">
            This guest flow covers the SRS idea of getting an initial recommendation session from the questionnaire alone. Nothing on this page is stored.
          </p>
          <form className="mt-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Favorite genres</label>
              <MultiSelectGroup name="favoriteGenres" options={GENRES} selected={favoriteGenres} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">Moods</label>
              <MultiSelectGroup name="favoriteMoods" options={MOODS} selected={favoriteMoods} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">Favorite eras</label>
              <MultiSelectGroup name="favoriteEras" options={ERAS} selected={favoriteEras} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Pacing</label>
              <select name="pacingPreference" defaultValue={pacingPreference}>
                <option value="">Any pacing</option>
                {PACING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Natural-language request</label>
              <textarea
                name="naturalLanguagePrompt"
                defaultValue={naturalLanguagePrompt}
                placeholder="Example: I want a clever sci-fi movie with emotional payoff but not something too dark."
              />
            </div>
            <button className="btn-primary w-full" type="submit">
              Get guest recommendations
            </button>
          </form>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn-ghost" href="/register">
              Create full account
            </Link>
            <Link className="btn-ghost" href="/">
              Back home
            </Link>
          </div>
        </section>
        <section className="glass-card rounded-[32px] p-6 md:p-8">
          <p className="eyebrow">Results</p>
          <h2 className="section-title mt-3">Guest recommendation preview</h2>
          <p className="muted mt-3 text-sm leading-7">
            Guest mode uses the same content pool and recommendation engine style, but without persistent profile history.
          </p>
          <div className="mt-6 grid gap-4">
            {recommendations.length ? (
              recommendations.map((item, index) => (
                <article key={item.contentId} className="rounded-[28px] border border-[var(--line)] bg-white/80 p-5">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="pill">#{index + 1}</span>
                    <span className="pill">{item.title}</span>
                  </div>
                  <p className="mt-4 leading-7 text-[var(--muted)]">{item.explanation}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--line)] bg-white/70 p-6">
                <p className="muted text-sm">
                  Pick a few genres or moods and optionally add a freeform prompt to generate recommendations.
                </p>
              </div>
            )}
          </div>
          {hasInput ? (
            <div className="mt-6 rounded-[24px] bg-[var(--accent-soft)] p-5">
              <p className="text-sm font-semibold">Current guest profile</p>
              <p className="muted mt-2 text-sm">
                {favoriteGenres.length ? formatGenres(favoriteGenres) : "No genres selected"} • {favoriteMoods.length ? favoriteMoods.join(", ") : "No moods selected"} • {pacingPreference || "Any pacing"}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
