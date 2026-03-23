"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession, hashPassword, requireAdmin, requireUser, verifyPassword } from "@/lib/auth";
import { generateRecommendationBatch, generateGuestRecommendations } from "@/lib/recommendation";
import {
  commentSchema,
  loginSchema,
  onboardingSchema,
  ratingSchema,
  recommendationAdjustmentSchema,
  registerSchema,
  reportSchema,
  reviewSchema,
} from "@/lib/validation";
import { average, parseListInput } from "@/lib/utils";

function redirectWithMessage(path: string, key: "error" | "success", message: string): never {
  const params = new URLSearchParams({
    [key]: message,
  });

  redirect(`${path}?${params.toString()}`);
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return redirectWithMessage("/register", "error", parsed.error.issues[0]?.message ?? "Invalid registration details.");
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return redirectWithMessage("/register", "error", "That email is already registered.");
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      profile: {
        create: {
          favoriteGenres: [],
          favoriteMoods: [],
          viewingHabits: [],
          favoriteEras: [],
          includeGenres: [],
          excludeGenres: [],
          includeTitles: [],
          excludeTitles: [],
        },
      },
    },
  });

  await createSession(user.id);
  redirect("/onboarding?success=Account created. Welcome aboard!");
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return redirectWithMessage("/login", "error", parsed.error.issues[0]?.message ?? "Invalid sign-in details.");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    return redirectWithMessage("/login", "error", "No account found for that email.");
  }

  const isValid = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!isValid) {
    return redirectWithMessage("/login", "error", "Incorrect password.");
  }

  await createSession(user.id);
  redirect("/dashboard?success=Welcome back.");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function saveOnboardingAction(formData: FormData) {
  const session = await requireUser();
  const parsed = onboardingSchema.safeParse({
    favoriteGenres: formData.getAll("favoriteGenres"),
    favoriteMoods: formData.getAll("favoriteMoods"),
    viewingHabits: formData.getAll("viewingHabits"),
    favoriteEras: formData.getAll("favoriteEras"),
    pacingPreference: formData.get("pacingPreference"),
  });

  if (!parsed.success) {
    return redirectWithMessage("/onboarding", "error", parsed.error.issues[0]?.message ?? "Please complete the onboarding form.");
  }

  await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: {
      favoriteGenres: parsed.data.favoriteGenres,
      favoriteMoods: parsed.data.favoriteMoods,
      viewingHabits: parsed.data.viewingHabits,
      favoriteEras: parsed.data.favoriteEras,
      pacingPreference: parsed.data.pacingPreference,
      onboardingCompleted: true,
      recommendationSummary: `Prefers ${parsed.data.favoriteGenres.join(", ")} stories with ${parsed.data.favoriteMoods.join(", ").toLowerCase()} energy and ${parsed.data.pacingPreference.toLowerCase()} pacing.`,
    },
  });

  await generateRecommendationBatch({
    userId: session.user.id,
  });

  redirect("/dashboard?success=Your taste profile is ready.");
}

export async function generateRecommendationsAction(formData: FormData) {
  const session = await requireUser();
  const parsed = recommendationAdjustmentSchema.safeParse({
    includeGenres: formData.getAll("includeGenres"),
    excludeGenres: formData.getAll("excludeGenres"),
    includeTitles: parseListInput(String(formData.get("includeTitles") ?? "")),
    excludeTitles: parseListInput(String(formData.get("excludeTitles") ?? "")),
    naturalLanguagePrompt: String(formData.get("naturalLanguagePrompt") ?? ""),
    mode: formData.get("mode"),
  });

  if (!parsed.success) {
    return redirectWithMessage("/dashboard", "error", "Could not process the recommendation filters.");
  }

  await generateRecommendationBatch({
    userId: session.user.id,
    includeGenres: parsed.data.includeGenres,
    excludeGenres: parsed.data.excludeGenres,
    includeTitles: parsed.data.includeTitles,
    excludeTitles: parsed.data.excludeTitles,
    naturalLanguagePrompt: parsed.data.naturalLanguagePrompt ?? "",
    persistAdjustments: parsed.data.mode === "permanent",
  });

  revalidatePath("/dashboard");
  redirect("/dashboard?success=Recommendations refreshed.");
}

export async function submitRatingAction(formData: FormData) {
  const session = await requireUser();
  const parsed = ratingSchema.safeParse({
    contentId: formData.get("contentId"),
    score: formData.get("score"),
  });

  if (!parsed.success) {
    return redirectWithMessage("/browse", "error", "Invalid rating submission.");
  }

  await prisma.rating.upsert({
    where: {
      userId_contentId: {
        userId: session.user.id,
        contentId: parsed.data.contentId,
      },
    },
    update: {
      score: parsed.data.score,
    },
    create: {
      userId: session.user.id,
      contentId: parsed.data.contentId,
      score: parsed.data.score,
    },
  });

  const contentRatings = await prisma.rating.findMany({
    where: { contentId: parsed.data.contentId },
    select: { score: true },
  });

  await prisma.content.update({
    where: { id: parsed.data.contentId },
    data: {
      averageRating: average(contentRatings.map((item) => item.score)),
    },
  });

  await generateRecommendationBatch({
    userId: session.user.id,
  });

  revalidatePath("/browse");
  revalidatePath("/dashboard");
  redirect(`/content/${formData.get("slug")}?success=Rating saved.`);
}

export async function submitReviewAction(formData: FormData) {
  const session = await requireUser();
  const parsed = reviewSchema.safeParse({
    contentId: formData.get("contentId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    redirect(`/content/${formData.get("slug")}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Review is invalid.")}`);
  }

  await prisma.review.upsert({
    where: {
      userId_contentId: {
        userId: session.user.id,
        contentId: parsed.data.contentId,
      },
    },
    update: {
      body: parsed.data.body,
    },
    create: {
      userId: session.user.id,
      contentId: parsed.data.contentId,
      body: parsed.data.body,
    },
  });

  await generateRecommendationBatch({
    userId: session.user.id,
  });

  revalidatePath(`/content/${formData.get("slug")}`);
  revalidatePath("/dashboard");
  redirect(`/content/${formData.get("slug")}?success=Review saved.`);
}

export async function submitCommentAction(formData: FormData) {
  const session = await requireUser();
  const parsed = commentSchema.safeParse({
    contentId: formData.get("contentId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    redirect(`/content/${formData.get("slug")}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Comment is invalid.")}`);
  }

  await prisma.comment.create({
    data: {
      userId: session.user.id,
      contentId: parsed.data.contentId,
      body: parsed.data.body,
    },
  });

  await generateRecommendationBatch({
    userId: session.user.id,
  });

  revalidatePath(`/content/${formData.get("slug")}`);
  revalidatePath("/dashboard");
  redirect(`/content/${formData.get("slug")}?success=Comment posted.`);
}

export async function submitReportAction(formData: FormData) {
  const session = await requireUser();
  const parsed = reportSchema.safeParse({
    contentId: formData.get("contentId"),
    reviewId: formData.get("reviewId") || undefined,
    commentId: formData.get("commentId") || undefined,
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
  });

  if (!parsed.success) {
    redirect(`/content/${formData.get("slug")}?error=${encodeURIComponent("Could not submit that report.")}`);
  }

  await prisma.report.create({
    data: {
      userId: session.user.id,
      contentId: parsed.data.contentId,
      reviewId: parsed.data.reviewId,
      commentId: parsed.data.commentId,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  });

  revalidatePath("/admin");
  redirect(`/content/${formData.get("slug")}?success=Report submitted.`);
}

export async function updateReportStatusAction(formData: FormData) {
  await requireAdmin();

  const reportId = String(formData.get("reportId") ?? "");
  const status = String(formData.get("status") ?? "OPEN");

  await prisma.report.update({
    where: { id: reportId },
    data: { status },
  });

  revalidatePath("/admin");
  redirect("/admin?success=Report status updated.");
}

export async function guestRecommendAction(formData: FormData) {
  const favoriteGenres = formData.getAll("favoriteGenres") as string[];
  const favoriteMoods = formData.getAll("favoriteMoods") as string[];
  const pacingPreference = (formData.get("pacingPreference") as string) || null;
  const naturalLanguagePrompt = (formData.get("naturalLanguagePrompt") as string) || "";

  const base = "/guest";
  const p = new URLSearchParams();

  if (favoriteGenres.length) p.set("favoriteGenres", favoriteGenres.join(","));
  if (favoriteMoods.length) p.set("favoriteMoods", favoriteMoods.join(","));
  if (pacingPreference) p.set("pacingPreference", pacingPreference);
  if (naturalLanguagePrompt.trim()) p.set("naturalLanguagePrompt", naturalLanguagePrompt.trim());

  try {
    await generateGuestRecommendations({
      favoriteGenres,
      favoriteMoods,
      pacingPreference,
      naturalLanguagePrompt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI recommendation failed.";
    redirect(`${base}?${p.toString()}&error=${encodeURIComponent(msg)}`);
  }

  const qs = p.toString();
  redirect(`${base}?${qs}`);
}
