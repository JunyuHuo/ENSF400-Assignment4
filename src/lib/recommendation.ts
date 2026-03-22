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

function matchesAny(source: string[], target: string[]) {
  return target.some((value) => source.includes(value));
}

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

  item.genres.forEach((genre: string) => {
    if (normalizedPrompt.includes(genre.toLowerCase())) {
      boost += 2;
    }
  });

  item.moods.forEach((mood: string) => {
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

function buildFallbackRecommendations(params: {
  content: Awaited<ReturnType<typeof prisma.content.findMany>>;
  profile: PreferenceProfile;
  interactionSignals: InteractionSignals;
  includeGenres: string[];
  excludeGenres: string[];
  includeTitles: string[];
  excludeTitles: string[];
  naturalLanguagePrompt: string;
}) {
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
  const boostedTitles = [...profile.includeTitles, ...includeTitles].map((item: string) =>
    item.toLowerCase(),
  );
  const blockedTitles = [...profile.excludeTitles, ...excludeTitles].map((item: string) =>
    item.toLowerCase(),
  );

  const ranked: RecommendationCandidate[] = content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => {
      let score = 0;
      const interactionGenreBoost = item.genres.reduce((total: number, genre: string) => {
        return total + (interactionSignals.likedGenres.get(genre) ?? 0);
      }, 0);
      const interactionGenrePenalty = item.genres.reduce((total: number, genre: string) => {
        return total + (interactionSignals.dislikedGenres.get(genre) ?? 0);
      }, 0);
      const interactionMoodBoost = item.moods.reduce((total: number, mood: string) => {
        return total + (interactionSignals.likedMoods.get(mood) ?? 0);
      }, 0);
      const interactionMoodPenalty = item.moods.reduce((total: number, mood: string) => {
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
          ? `It lines up with your ${item.genres.filter((genre: string) => profile.favoriteGenres.includes(genre)).join(", ")} interests.`
          : "It broadens your library without drifting far from your baseline taste.",
        interactionGenreBoost > interactionGenrePenalty
          ? `Your ratings and write-ups suggest you respond well to similar ${item.genres.join(", ").toLowerCase()} material.`
          : interactionGenrePenalty > 0
            ? `It survives despite some weaker overlap with genres you usually score lower.`
            : `It remains compatible with the interaction patterns you've built so far.`,
        matchesAny(item.moods, profile.favoriteMoods)
          ? `The ${item.moods.filter((mood: string) => profile.favoriteMoods.includes(mood)).join(", ").toLowerCase()} tone matches the moods you selected.`
          : `Its ${item.pacing.toLowerCase()} pacing keeps it close to the viewing rhythm you prefer.`,
        naturalLanguagePrompt
          ? `It also reflects your latest request: "${naturalLanguagePrompt}".`
          : "",
        item.explanationHint,
      ];

      return {
        contentId: item.id,
        title: item.title,
        score,
        explanation: explanationParts.join(" "),
      };
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((left: any, right: any) => right.score - left.score)
    .slice(0, 5);

  return ranked;
}

async function buildAiRecommendations(params: {
  content: Awaited<ReturnType<typeof prisma.content.findMany>>;
  profile: PreferenceProfile;
  interactionSignals: InteractionSignals;
  includeGenres: string[];
  excludeGenres: string[];
  includeTitles: string[];
  excludeTitles: string[];
  naturalLanguagePrompt: string;
}) {
  const apiKey = process.env.OVH_AI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.OVH_AI_BASE_URL || "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1";
  const model = process.env.OVH_AI_MODEL || process.env.OPENAI_MODEL || "gpt-oss-120b";

  if (!apiKey) {
    return null;
  }

  const openai = new OpenAI({
    apiKey,
    baseURL,
  });

  const contentPool = params.content.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    year: item.year,
    genres: item.genres,
    moods: item.moods,
    pacing: item.pacing,
    summary: item.summary,
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  let completion;
  try {
    completion = await openai.chat.completions.create(
      {
        model,
        temperature: 0.8,
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content:
              "You are a recommendation engine for a movie and TV platform. Return valid JSON only.",
          },
          {
            role: "user",
            content: JSON.stringify({
              profile: params.profile,
              oneTimeAdjustments: {
                includeGenres: params.includeGenres,
                excludeGenres: params.excludeGenres,
                includeTitles: params.includeTitles,
                excludeTitles: params.excludeTitles,
              },
              interactionSignals: {
                summary: params.interactionSignals.summary,
                highlights: params.interactionSignals.highlights,
              },
              naturalLanguagePrompt: params.naturalLanguagePrompt,
              contentPool,
              instructions:
                "Choose exactly 5 items from the content pool. Return JSON in the shape { recommendations: [{ contentId, explanation }] }. Each explanation must be 2 concise sentences.",
            }),
          },
        ],
      },
      { signal: controller.signal as RequestInit["signal"] },
    );
  } finally {
    clearTimeout(timeout);
  }

  const message = completion.choices[0]?.message;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let raw = message?.content || (message as any).reasoning_content;

  if (!raw) {
    return null;
  }

  try {
    // Robust JSON extraction
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      raw = jsonMatch[0];
    }

    const parsed = JSON.parse(raw) as {
      recommendations?: Array<{ contentId: string; explanation: string }>;
    };

    if (!parsed.recommendations?.length) {
      return null;
    }

    return parsed.recommendations
      .slice(0, 5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((recommendation: any, index: number) => ({
        contentId: recommendation.contentId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: contentPool.find((item: any) => item.id === recommendation.contentId)?.title ?? `Pick ${index + 1}`,
        score: 100 - index,
        explanation: recommendation.explanation,
      }));
  } catch (error) {
    console.error("AI recommendation parsing error:", error);
    return null;
  }
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

  let recommendations: RecommendationCandidate[] | null = null;
  let explanationSource = "openai";

  try {
    recommendations = await buildAiRecommendations({
      content,
      profile,
      interactionSignals,
      includeGenres,
      excludeGenres,
      includeTitles,
      excludeTitles,
      naturalLanguagePrompt,
    });
  } catch {
    recommendations = null;
  }

  if (!recommendations?.length) {
    throw new Error(
      "AI recommendation failed. Please check your OVH_AI_API_KEY / OPENAI_API_KEY environment variable."
    );
  }

  const batch = await prisma.recommendationBatch.create({
    data: {
      userId,
      explanationSource,
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
      },
      items: {
        create: recommendations.map((item, index) => ({
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

  const recommendations = await buildAiRecommendations({
    content,
    profile: guestProfile,
    interactionSignals,
    includeGenres: [],
    excludeGenres: [],
    includeTitles: [],
    excludeTitles: [],
    naturalLanguagePrompt,
  });

  if (!recommendations?.length) {
    throw new Error(
      "AI recommendation failed. Please check your OVH_AI_API_KEY / OPENAI_API_KEY environment variable."
    );
  }

  return recommendations;
}
