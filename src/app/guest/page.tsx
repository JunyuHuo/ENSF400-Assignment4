import { generateGuestRecommendations, OutsideRecommendation } from "@/lib/recommendation";
import { arrayFromSearchParam } from "@/lib/utils";
import GuestClient from "./GuestClient";

export default async function GuestPage({
  searchParams,
}: {
  searchParams: Promise<{
    favoriteGenres?: string | string[];
    favoriteMoods?: string | string[];
    favoriteEras?: string | string[];
    pacingPreference?: string | string[];
    naturalLanguagePrompt?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const favoriteGenres = arrayFromSearchParam(params.favoriteGenres);
  const favoriteMoods = arrayFromSearchParam(params.favoriteMoods);
  const favoriteEras = arrayFromSearchParam(params.favoriteEras);
  const pacingPreference = Array.isArray(params.pacingPreference)
    ? params.pacingPreference[0] ?? ""
    : params.pacingPreference ?? "";
  const naturalLanguagePrompt = Array.isArray(params.naturalLanguagePrompt)
    ? params.naturalLanguagePrompt[0] ?? ""
    : params.naturalLanguagePrompt ?? "";

  const hasInput =
    favoriteGenres.length > 0 ||
    favoriteMoods.length > 0 ||
    favoriteEras.length > 0 ||
    Boolean(pacingPreference) ||
    Boolean(naturalLanguagePrompt.trim());

  let recommendations: Awaited<ReturnType<typeof generateGuestRecommendations>>["libraryRecommendations"] = [];
  let outsideRecommendations: OutsideRecommendation[] = [];
  let error: string | null = null;

  if (hasInput) {
    try {
      const generated = await generateGuestRecommendations({
        favoriteGenres,
        favoriteMoods,
        pacingPreference: pacingPreference || null,
        naturalLanguagePrompt,
      });
      recommendations = generated.libraryRecommendations;
      outsideRecommendations = generated.outsideRecommendations;
    } catch (guestError) {
      error = guestError instanceof Error ? guestError.message : "Could not generate recommendations.";
    }
  }

  return (
    <main style={{ padding: 0 }}>
      <GuestClient
        favoriteGenres={favoriteGenres}
        favoriteMoods={favoriteMoods}
        favoriteEras={favoriteEras}
        pacingPreference={pacingPreference}
        naturalLanguagePrompt={naturalLanguagePrompt}
        recommendations={recommendations}
        outsideRecommendations={outsideRecommendations}
        error={error}
      />
    </main>
  );
}
