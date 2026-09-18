import { z } from "zod";

export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const plantFiltersSchema = z.object({
  search: z.string().trim().default(""),
  category: z.string().trim().default(""),
  difficulty: z.string().trim().pipe(difficultySchema.or(z.literal(""))).optional(),
  environment: z.string().trim().default(""),
  light: z.string().trim().default(""),
  humidity: z.string().trim().default("")
});

export const plantSchema = z.object({
  name: z.string().min(2),
  scientificName: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(10),
  imageUrl: z.union([z.literal(""), z.string().url().refine(value => /^https?:\/\//i.test(value), "URL inválida")]).default(""),
  difficulty: difficultySchema,
  light: z.string().min(2),
  watering: z.string().min(2),
  temperature: z.string().min(2),
  humidity: z.string().min(2),
  substrate: z.string().min(2),
  fertilizing: z.string().min(2),
  pruning: z.string().min(2),
  environment: z.string().min(2),
  tips: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  problemIds: z.array(z.string()).default([])
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(5)
});

export const problemSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(5),
  causes: z.string().min(5),
  recommendation: z.string().min(5)
});
