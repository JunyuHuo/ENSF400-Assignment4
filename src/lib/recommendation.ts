import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";

type PreferenceProfile = {
  favoriteGenres: string[];
  favoriteMoods: string[];
  viewingHabits: string[];
  favoriteEras: string[];
  pacingPreference: string | null;
  includeGenres: string[];
  excludeGenres: string[];
  includeTitles: string[];
  excludeTitles: string[];
  recommendationSummary?: string | null;
};

type InteractionSignals = {
  watchedContentIds: Set<string>;
  likedGenres: Map<string, number>;
  dislikedGenres: Map<string, number>;
  likedMoods: Map<string, number>;
  dislikedMoods: Map<string, number>;
  summary: string;
  highlights: string[];
};

type RecommendationCandidate = {
  contentId: string;
  title: string;
  score: number;
  explanation: string;
};

export type OutsideRecommendation = {
  title: string;
  type: string;
  year: string;
  explanation: string;
};

type HybridRecommendationResult = {
  libraryRecommendations: RecommendationCandidate[];
  outsideRecommendations: OutsideRecommendation[];
};

function findBalancedJsonBlock(raw: string) {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (start === -1 && (char === "{" || char === "[")) {
      start = index;
      depth = 1;
      continue;
    }

    if (start !== -1 && (char === "{" || char === "[")) {
      depth += 1;
      continue;
    }

    if (start !== -1 && (char === "}" || char === "]")) {
      depth -= 1;

      if (depth === 0) {
        return raw.slice(start, index + 1);
      }
    }
  }

  return raw;
}

function extractJsonCandidate(raw: string) {
  let jsonCandidate = raw.trim();

  if (jsonCandidate.startsWith("```")) {
    jsonCandidate = jsonCandidate.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  if (!jsonCandidate.startsWith("{") && !jsonCandidate.startsWith("[")) {
    const firstBrace = jsonCandidate.indexOf("{");
    const firstBracket = jsonCandidate.indexOf("[");
    const startIndex = [firstBrace, firstBracket]
      .filter((value) => value >= 0)
      .sort((left, right) => left - right)[0];

    if (startIndex !== undefined) {
      jsonCandidate = jsonCandidate.slice(startIndex);
    }
  }

  jsonCandidate = findBalancedJsonBlock(jsonCandidate);

  return jsonCandidate
    .replace(/^\uFEFF/, "")
    .replace(/[\u201C\u201D]/g, "\"")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\.\.\./g, "")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
}

function buildOutsideRecommendationPrompt(params: {
  profile: PreferenceProfile;
  interactionSignals: InteractionSignals;
  naturalLanguagePrompt: string;
}) {
  return JSON.stringify({
    task: "Return exactly 5 outside-the-library personalized movie or TV recommendations.",
    hardRules: [
      "Return exactly 5 outside-the-library recommendations.",
      "Prefer well-known real titles that are not already in the local CineMatch library.",
      "Each explanation must be 1 to 2 short sentences, specific and natural.",
      "Do not use ellipses, comments, trailing notes, or placeholder text.",
      "Use double quotes for all JSON keys and string values.",
      "Do not wrap the JSON in markdown fences.",
      "Return no text outside the JSON object.",
    ],
    outputSchema: {
      outsideRecommendations: [
        {
          title: "real movie or show title",
          type: "Movie or TV Show",
          year: "release year",
          explanation: "short personalized reason",
        },
      ],
    },
    selectionGuidance: {
      prioritize: [
        "profile taste match",
        "interactionSignals",
        "naturalLanguagePrompt",
      ],
      avoid: [
        "duplicates",
        "titles already likely covered by the local CineMatch catalog",
      ],
    },
    profile: params.profile,
    interactionSignals: {
      summary: params.interactionSignals.summary,
      highlights: params.interactionSignals.highlights,
    },
    naturalLanguagePrompt: params.naturalLanguagePrompt,
  });
}

const positiveWords = [
  "love",
  "great",
  "amazing",
  "favorite",
  "excellent",
  "smart",
  "moving",
  "funny",
  "beautiful",
  "intense",
];

const negativeWords = [
  "boring",
  "bad",
  "hate",
  "slow",
  "confusing",
  "weak",
  "forgettable",
  "messy",
  "flat",
  "overrated",
];

function addToMap(target: Map<string, number>, values: string[], delta: number) {
  values.forEach((value) => {
    target.set(value, (target.get(value) ?? 0) + delta);
  });
}

function getTopEntries(map: Map<string, number>, minimumScore: number, limit = 3) {
  return [...map.entries()]
    .filter(([, score]) => score >= minimumScore)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function getSentimentScore(text: string) {
  const value = text.toLowerCase();
  const positiveHits = positiveWords.filter((word) => value.includes(word)).length;
  const negativeHits = negativeWords.filter((word) => value.includes(word)).length;

  return positiveHits - negativeHits;
}

function matchesAny(source: string[], target: string[]) {
  return target.some((value) => source.includes(value));
}

function getPromptBoost({
  prompt,
  item,
}: {
  prompt: string;
  item: Awaited<ReturnType<typeof prisma.content.findMany>>[number];
}) {
  if (!prompt.trim()) {
    return 0;
  }

  const normalizedPrompt = prompt.toLowerCase();
  let boost = 0;

  item.genres.forEach((genre) => {
    if (normalizedPrompt.includes(genre.toLowerCase())) {
      boost += 2;
    }
  });

  item.moods.forEach((mood) => {
    if (normalizedPrompt.includes(mood.toLowerCase())) {
      boost += 1.5;
    }
  });

  if (normalizedPrompt.includes(item.title.toLowerCase())) {
    boost += 3;
  }

  if (normalizedPrompt.includes(item.type.toLowerCase())) {
    boost += 0.5;
  }

  return boost;
}

async function buildInteractionSignals(userId: string): Promise<InteractionSignals> {
  const [ratings, reviews, comments] = await Promise.all([
    prisma.rating.findMany({
      where: { userId },
      include: { content: true },
    }),
    prisma.review.findMany({
      where: { userId },
      include: { content: true },
    }),
    prisma.comment.findMany({
      where: { userId },
      include: { content: true },
    }),
  ]);

  const watchedContentIds = new Set<string>();
  const likedGenres = new Map<string, number>();
  const dislikedGenres = new Map<string, number>();
  const likedMoods = new Map<string, number>();
  const dislikedMoods = new Map<string, number>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ratings.forEach((rating: any) => {
    watchedContentIds.add(rating.contentId);
    const delta = rating.score - 3;

    if (delta > 0) {
      addToMap(likedGenres, rating.content.genres, delta * 1.8);
      addToMap(likedMoods, rating.content.moods, delta * 1.2);
    }

    if (delta < 0) {
      addToMap(dislikedGenres, rating.content.genres, Math.abs(delta) * 2);
      addToMap(dislikedMoods, rating.content.moods, Math.abs(delta) * 1.4);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviews.forEach((review: any) => {
    watchedContentIds.add(review.contentId);
    const sentiment = getSentimentScore(review.body);

    if (sentiment >= 0) {
      addToMap(likedGenres, review.content.genres, Math.max(1, sentiment + 1));
      addToMap(likedMoods, review.content.moods, Math.max(0.8, sentiment + 0.5));
    } else {
      addToMap(dislikedGenres, review.content.genres, Math.abs(sentiment) + 1);
      addToMap(dislikedMoods, review.content.moods, Math.abs(sentiment) + 0.5);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comments.forEach((comment: any) => {
    watchedContentIds.add(comment.contentId);
    const sentiment = getSentimentScore(comment.body);

    if (sentiment > 0) {
      addToMap(likedGenres, comment.content.genres, 0.8 + sentiment * 0.5);
    }

    if (sentiment < 0) {
      addToMap(dislikedGenres, comment.content.genres, 0.8 + Math.abs(sentiment) * 0.5);
    }
  });

  const strongLikes = getTopEntries(likedGenres, 2);
  const strongDislikes = getTopEntries(dislikedGenres, 2);
  const highlights = [
    strongLikes.length ? `You consistently rate ${strongLikes.join(", ")} content well.` : "",
    strongDislikes.length ? `You tend to bounce off ${strongDislikes.join(", ")} picks.` : "",
    ratings.length ? `Ratings submitted: ${ratings.length}.` : "",
    reviews.length ? `Reviews written: ${reviews.length}.` : "",
    comments.length ? `Comments posted: ${comments.length}.` : "",
  ].filter(Boolean);

  return {
    watchedContentIds,
    likedGenres,
    dislikedGenres,
    likedMoods,
    dislikedMoods,
    summary: highlights.join(" "),
    highlights,
  };
}

function buildLibraryRecommendations(params: {
  content: Awaited<ReturnType<typeof prisma.content.findMany>>;
  profile: PreferenceProfile;
  interactionSignals: InteractionSignals;
  includeGenres: string[];
  excludeGenres: string[];
  includeTitles: string[];
  excludeTitles: string[];
  naturalLanguagePrompt: string;
}): RecommendationCandidate[] {
  const {
    content,
    profile,
    interactionSignals,
    includeGenres,
    excludeGenres,
    includeTitles,
    excludeTitles,
    naturalLanguagePrompt,
  } = params;

  const boostedGenres = [...profile.favoriteGenres, ...includeGenres];
  const blockedGenres = [...profile.excludeGenres, ...excludeGenres];
  const boostedTitles = [...profile.includeTitles, ...includeTitles].map((item) =>
    item.toLowerCase(),
  );
  const blockedTitles = [...profile.excludeTitles, ...excludeTitles].map((item) =>
    item.toLowerCase(),
  );

  return content
    .map((item) => {
      let score = 0;
      const interactionGenreBoost = item.genres.reduce((total, genre) => {
        return total + (interactionSignals.likedGenres.get(genre) ?? 0);
      }, 0);
      const interactionGenrePenalty = item.genres.reduce((total, genre) => {
        return total + (interactionSignals.dislikedGenres.get(genre) ?? 0);
      }, 0);
      const interactionMoodBoost = item.moods.reduce((total, mood) => {
        return total + (interactionSignals.likedMoods.get(mood) ?? 0);
      }, 0);
      const interactionMoodPenalty = item.moods.reduce((total, mood) => {
        return total + (interactionSignals.dislikedMoods.get(mood) ?? 0);
      }, 0);

      if (matchesAny(item.genres, profile.favoriteGenres)) {
        score += 3;
      }

      if (matchesAny(item.moods, profile.favoriteMoods)) {
        score += 2;
      }

      if (profile.pacingPreference === item.pacing) {
        score += 2;
      }

      if (matchesAny(item.genres, boostedGenres)) {
        score += 2;
      }

      if (matchesAny(item.genres, blockedGenres)) {
        score -= 6;
      }

      if (boostedTitles.some((title) => item.title.toLowerCase().includes(title))) {
        score += 4;
      }

      if (blockedTitles.some((title) => item.title.toLowerCase().includes(title))) {
        score -= 8;
      }

      score += interactionGenreBoost * 0.9;
      score += interactionMoodBoost * 0.7;
      score -= interactionGenrePenalty * 1.1;
      score -= interactionMoodPenalty * 0.8;
      score += getPromptBoost({
        prompt: naturalLanguagePrompt,
        item,
      });

      if (interactionSignals.watchedContentIds.has(item.id)) {
        score -= 4;
      }

      const explanationParts = [
        matchesAny(item.genres, profile.favoriteGenres)
          ? `It matches your interest in ${item.genres.filter((genre) => profile.favoriteGenres.includes(genre)).join(", ")}.`
          : "It stays close to the taste profile you built.",
        matchesAny(item.moods, profile.favoriteMoods)
          ? `Its ${item.moods.filter((mood) => profile.favoriteMoods.includes(mood)).join(", ").toLowerCase()} tone fits the mood you selected.`
          : `Its ${item.pacing.toLowerCase()} pacing keeps it compatible with your viewing preferences.`,
        item.explanationHint,
      ].filter(Boolean);

      return {
        contentId: item.id,
        title: item.title,
        score,
        explanation: explanationParts.join(" "),
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

async function buildOutsideRecommendations(params: {
  profile: PreferenceProfile;
  interactionSignals: InteractionSignals;
  naturalLanguagePrompt: string;
}): Promise<OutsideRecommendation[]> {
  const apiKey = process.env.OVH_AI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.OVH_AI_BASE_URL || "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1";
  const model = process.env.OVH_AI_MODEL || process.env.OPENAI_MODEL || "gpt-oss-120b";

  if (!apiKey) {
    return [];
  }

  const openai = new OpenAI({
    apiKey,
    baseURL,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  async function requestCompletion(attempt: number) {
    return openai.chat.completions.create(
      {
        model,
        temperature: 0.0,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              attempt === 0
                ? "You are a movie and TV recommendation engine. Output only valid JSON. Return exactly five outsideRecommendations and no other keys."
                : "Your previous answer was invalid. Output only minified valid JSON with double quotes. Return only an object with outsideRecommendations. No ellipses, no comments, no markdown, and no text outside the JSON object.",
          },
          {
            role: "user",
            content: buildOutsideRecommendationPrompt({
              profile: params.profile,
              interactionSignals: params.interactionSignals,
              naturalLanguagePrompt: params.naturalLanguagePrompt,
            }),
          },
        ],
      },
      { signal: controller.signal as RequestInit["signal"] },
    );
  }

  function parseOutsideResponse(raw: string) {
    const jsonCandidate = extractJsonCandidate(raw);
    const parsed = JSON.parse(jsonCandidate);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outsideRecs: any[] = parsed?.outsideRecommendations ?? parsed?.externalRecommendations ?? null;

    if (!outsideRecs?.length) {
      return [];
    }

    const normalizedOutsideRecommendations = outsideRecs
      .slice(0, 5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((recommendation: any) => {
        const title = String(recommendation.title ?? "").trim();
        const type = String(recommendation.type ?? recommendation.format ?? "").trim();
        const year = String(recommendation.year ?? recommendation.releaseYear ?? recommendation.era ?? "").trim();
        const explanation = String(recommendation.explanation ?? recommendation.reason ?? "").trim();

        if (!title || !type || !year || !explanation) {
          return null;
        }

        return {
          title,
          type,
          year,
          explanation,
        };
      })
      .filter((item): item is OutsideRecommendation => item !== null);

    const uniqueOutsideRecommendations = normalizedOutsideRecommendations.filter(
      (item, index, items) => items.findIndex((candidate) => candidate.title.toLowerCase() === item.title.toLowerCase()) === index,
    );

    if (uniqueOutsideRecommendations.length < 5) {
      console.error("AI outside recommendations returned invalid, duplicate, or incomplete items.");
      return [];
    }

    return uniqueOutsideRecommendations.slice(0, 5);
  }

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const completion = await requestCompletion(attempt);
      const message = completion.choices[0]?.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = message?.content || (message as any).reasoning_content;

      if (!raw) {
        continue;
      }

      try {
        const parsed = parseOutsideResponse(raw);
        if (parsed.length) {
          return parsed;
        }
      } catch (error) {
        console.error(`AI outside recommendation parsing error on attempt ${attempt + 1}:`, error);
      }
    }

    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function buildRecommendations(params: {
  content: Awaited<ReturnType<typeof prisma.content.findMany>>;
  profile: PreferenceProfile;
  interactionSignals: InteractionSignals;
  includeGenres: string[];
  excludeGenres: string[];
  includeTitles: string[];
  excludeTitles: string[];
  naturalLanguagePrompt: string;
}): Promise<HybridRecommendationResult> {
  const libraryRecommendations = buildLibraryRecommendations(params);
  let outsideRecommendations: OutsideRecommendation[] = [];

  try {
    outsideRecommendations = await buildOutsideRecommendations({
      profile: params.profile,
      interactionSignals: params.interactionSignals,
      naturalLanguagePrompt: params.naturalLanguagePrompt,
    });
  } catch (error) {
    console.error("AI outside recommendation request failed:", error);
  }

  return {
    libraryRecommendations,
    outsideRecommendations,
  };
}

export async function generateRecommendationBatch({
  userId,
  includeGenres = [],
  excludeGenres = [],
  includeTitles = [],
  excludeTitles = [],
  naturalLanguagePrompt = "",
  persistAdjustments = false,
}: {
  userId: string;
  includeGenres?: string[];
  excludeGenres?: string[];
  includeTitles?: string[];
  excludeTitles?: string[];
  naturalLanguagePrompt?: string;
  persistAdjustments?: boolean;
}) {
  const [profile, content, interactionSignals] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
    }),
    prisma.content.findMany({
      orderBy: { title: "asc" },
    }),
    buildInteractionSignals(userId),
  ]);

  if (!profile) {
    throw new Error("User profile is required to generate recommendations.");
  }

  if (persistAdjustments) {
    await prisma.userProfile.update({
      where: { userId },
      data: {
        includeGenres,
        excludeGenres,
        includeTitles,
        excludeTitles,
        recommendationSummary: profile.recommendationSummary,
      },
    });
  }

  const recommendations = await buildRecommendations({
    content,
    profile,
    interactionSignals,
    includeGenres,
    excludeGenres,
    includeTitles,
    excludeTitles,
    naturalLanguagePrompt,
  });

  if (!recommendations.libraryRecommendations.length) {
    throw new Error("Could not generate recommendations.");
  }

  const batch = await prisma.recommendationBatch.create({
    data: {
      userId,
      explanationSource: "ai",
      promptSnapshot: {
        profile,
        interactionSignals: {
          summary: interactionSignals.summary,
          highlights: interactionSignals.highlights,
        },
        includeGenres,
        excludeGenres,
        includeTitles,
        excludeTitles,
        naturalLanguagePrompt,
        outsideRecommendations: recommendations.outsideRecommendations,
      },
      items: {
        create: recommendations.libraryRecommendations.map((item, index) => ({
          contentId: item.contentId,
          rank: index + 1,
          explanation: item.explanation,
        })),
      },
    },
    include: {
      items: {
        orderBy: { rank: "asc" },
        include: {
          content: true,
        },
      },
    },
  });

  return batch;
}

export async function getLatestRecommendations(userId: string) {
  return prisma.recommendationBatch.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { rank: "asc" },
        include: {
          content: true,
        },
      },
    },
  });
}

export function getOutsideRecommendationsFromPromptSnapshot(promptSnapshot: unknown): OutsideRecommendation[] {
  if (!promptSnapshot || typeof promptSnapshot !== "object" || !("outsideRecommendations" in promptSnapshot)) {
    return [];
  }

  const rawRecommendations = (promptSnapshot as { outsideRecommendations?: unknown }).outsideRecommendations;

  if (!Array.isArray(rawRecommendations)) {
    return [];
  }

  return rawRecommendations
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const recommendation = item as Record<string, unknown>;
      const title = String(recommendation.title ?? "").trim();
      const type = String(recommendation.type ?? "").trim();
      const year = String(recommendation.year ?? "").trim();
      const explanation = String(recommendation.explanation ?? "").trim();

      if (!title || !type || !year || !explanation) {
        return null;
      }

      return {
        title,
        type,
        year,
        explanation,
      };
    })
    .filter((item): item is OutsideRecommendation => item !== null);
}

export async function getInteractionInsights(userId: string) {
  return buildInteractionSignals(userId);
}

export async function generateGuestRecommendations({
  favoriteGenres,
  favoriteMoods,
  pacingPreference,
  naturalLanguagePrompt = "",
}: {
  favoriteGenres: string[];
  favoriteMoods: string[];
  pacingPreference: string | null;
  naturalLanguagePrompt?: string;
}) {
  const content = await prisma.content.findMany({
    orderBy: { title: "asc" },
  });

  const guestProfile: PreferenceProfile = {
    favoriteGenres,
    favoriteMoods,
    viewingHabits: [],
    favoriteEras: [],
    pacingPreference,
    includeGenres: [],
    excludeGenres: [],
    includeTitles: [],
    excludeTitles: [],
    recommendationSummary: "Guest session profile",
  };

  const interactionSignals: InteractionSignals = {
    watchedContentIds: new Set<string>(),
    likedGenres: new Map<string, number>(),
    dislikedGenres: new Map<string, number>(),
    likedMoods: new Map<string, number>(),
    dislikedMoods: new Map<string, number>(),
    summary: "Guest mode uses questionnaire answers and optional natural-language prompting.",
    highlights: ["Guest mode does not persist ratings, reviews, or comments."],
  };

  const recommendations = await buildRecommendations({
    content,
    profile: guestProfile,
    interactionSignals,
    includeGenres: [],
    excludeGenres: [],
    includeTitles: [],
    excludeTitles: [],
    naturalLanguagePrompt,
  });

  if (!recommendations.libraryRecommendations.length) {
    throw new Error("Could not generate recommendations.");
  }

  return recommendations;
}
