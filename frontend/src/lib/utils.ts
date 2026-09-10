import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const difficultyLabels = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil"
} as const;
