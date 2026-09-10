import { z } from "zod";

export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const plantSchema = z.object({
  name: z.string().min(2),
  scientificName: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(10),
  imageUrl: z.string().url(),
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
