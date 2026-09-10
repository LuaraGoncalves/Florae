export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type Problem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  causes: string;
  recommendation: string;
};

export type Relation<T> = {
  category?: T;
  problem?: T;
};

export type Plant = {
  id: string;
  name: string;
  scientificName: string;
  slug: string;
  description: string;
  imageUrl: string;
  difficulty: Difficulty;
  light: string;
  watering: string;
  temperature: string;
  humidity: string;
  substrate: string;
  fertilizing: string;
  pruning: string;
  environment: string;
  tips: string[];
  categories: Array<{ category: Category }>;
  problems: Array<{ problem: Problem }>;
};

export type PlantPayload = Omit<Plant, "id" | "categories" | "problems"> & {
  categoryIds: string[];
  problemIds: string[];
};
