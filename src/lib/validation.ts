import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password needs at least one uppercase letter.")
    .regex(/[a-z]/, "Password needs at least one lowercase letter.")
    .regex(/[0-9]/, "Password needs at least one number."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const onboardingSchema = z.object({
  favoriteGenres: z.array(z.string()).min(1, "Choose at least one genre."),
  favoriteMoods: z.array(z.string()).min(1, "Choose at least one mood."),
  viewingHabits: z.array(z.string()).min(1, "Choose at least one viewing habit."),
  favoriteEras: z.array(z.string()).min(1, "Choose at least one era."),
  pacingPreference: z.string().min(1, "Choose a pacing preference."),
});

export const recommendationAdjustmentSchema = z.object({
  includeGenres: z.array(z.string()).default([]),
  excludeGenres: z.array(z.string()).default([]),
  includeTitles: z.array(z.string()).default([]),
  excludeTitles: z.array(z.string()).default([]),
  naturalLanguagePrompt: z.string().max(300).optional(),
  mode: z.enum(["one-time", "permanent"]),
});

export const ratingSchema = z.object({
  contentId: z.string().min(1),
  score: z.coerce.number().int().min(1).max(5),
});

export const reviewSchema = z.object({
  contentId: z.string().min(1),
  body: z.string().min(10).max(500),
});

export const commentSchema = z.object({
  contentId: z.string().min(1),
  body: z.string().min(3).max(200),
});

export const reportSchema = z.object({
  contentId: z.string().min(1),
  reviewId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.string().min(1),
  details: z.string().max(250).optional(),
});
