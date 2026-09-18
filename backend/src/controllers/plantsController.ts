import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { plantFiltersSchema, plantSchema } from "../schemas.js";
import { slugify } from "../utils/slug.js";
import { textParam } from "../utils/textParam.js";

const includeRelations = {
  categories: { include: { category: true } },
  problems: { include: { problem: true } }
};

export async function listPlants(request: Request, response: Response) {
  const filters = plantFiltersSchema.safeParse(request.query);
  if (!filters.success) {
    return response.status(400).json({ message: "Filtros inválidos.", issues: filters.error.flatten().fieldErrors });
  }
  const { search, category, difficulty, environment, light, humidity } = filters.data;

  const plants = await prisma.plant.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { scientificName: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } }
              ]
            }
          : {},
        category ? { categories: { some: { category: { slug: category } } } } : {},
        difficulty ? { difficulty } : {},
        environment ? { environment: { contains: environment, mode: "insensitive" } } : {},
        light ? { light: { contains: light, mode: "insensitive" } } : {},
        humidity ? { humidity: { contains: humidity, mode: "insensitive" } } : {}
      ]
    },
    include: includeRelations,
    orderBy: { name: "asc" }
  });

  return response.json(plants);
}

export async function getPlant(request: Request, response: Response) {
  const id = textParam(request.params.id);
  const plant = await prisma.plant.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: includeRelations
  });

  if (!plant) {
    return response.status(404).json({ message: "Planta não encontrada." });
  }

  return response.json(plant);
}

export async function createPlant(request: Request, response: Response) {
  const data = plantSchema.parse(request.body);
  const { categoryIds, problemIds, ...fields } = data;
  const plant = await prisma.plant.create({
    data: {
      ...fields,
      slug: data.slug || slugify(data.name),
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      problems: { create: problemIds.map((problemId) => ({ problemId })) }
    },
    include: includeRelations
  });

  return response.status(201).json(plant);
}

export async function updatePlant(request: Request, response: Response) {
  const data = plantSchema.parse(request.body);
  const id = textParam(request.params.id);
  const existing = await prisma.plant.findUnique({ where: { id } });

  if (!existing) {
    return response.status(404).json({ message: "Planta não encontrada." });
  }

  const plant = await prisma.plant.update({
    where: { id },
    data: {
      name: data.name,
      scientificName: data.scientificName,
      slug: data.slug || slugify(data.name),
      description: data.description,
      imageUrl: data.imageUrl,
      difficulty: data.difficulty,
      light: data.light,
      watering: data.watering,
      temperature: data.temperature,
      humidity: data.humidity,
      substrate: data.substrate,
      fertilizing: data.fertilizing,
      pruning: data.pruning,
      environment: data.environment,
      tips: data.tips,
      categories: {
        deleteMany: {},
        create: data.categoryIds.map((categoryId) => ({ categoryId }))
      },
      problems: {
        deleteMany: {},
        create: data.problemIds.map((problemId) => ({ problemId }))
      }
    },
    include: includeRelations
  });

  return response.json(plant);
}

export async function deletePlant(request: Request, response: Response) {
  const id = textParam(request.params.id);
  await prisma.plant.delete({ where: { id } });
  return response.status(204).send();
}
