import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { categorySchema } from "../schemas.js";
import { slugify } from "../utils/slug.js";
import { textParam } from "../utils/textParam.js";

export async function listCategories(_request: Request, response: Response) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return response.json(categories);
}

export async function createCategory(request: Request, response: Response) {
  const data = categorySchema.parse(request.body);
  const category = await prisma.category.create({
    data: { ...data, slug: data.slug || slugify(data.name) }
  });
  return response.status(201).json(category);
}

export async function updateCategory(request: Request, response: Response) {
  const data = categorySchema.parse(request.body);
  const id = textParam(request.params.id);
  const category = await prisma.category.update({
    where: { id },
    data: { ...data, slug: data.slug || slugify(data.name) }
  });
  return response.json(category);
}

export async function deleteCategory(request: Request, response: Response) {
  const id = textParam(request.params.id);
  await prisma.category.delete({ where: { id } });
  return response.status(204).send();
}
