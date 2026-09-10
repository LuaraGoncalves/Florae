import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { problemSchema } from "../schemas.js";
import { slugify } from "../utils/slug.js";
import { textParam } from "../utils/textParam.js";

export async function listProblems(_request: Request, response: Response) {
  const problems = await prisma.problem.findMany({ orderBy: { name: "asc" } });
  return response.json(problems);
}

export async function createProblem(request: Request, response: Response) {
  const data = problemSchema.parse(request.body);
  const problem = await prisma.problem.create({
    data: { ...data, slug: data.slug || slugify(data.name) }
  });
  return response.status(201).json(problem);
}

export async function updateProblem(request: Request, response: Response) {
  const data = problemSchema.parse(request.body);
  const id = textParam(request.params.id);
  const problem = await prisma.problem.update({
    where: { id },
    data: { ...data, slug: data.slug || slugify(data.name) }
  });
  return response.json(problem);
}

export async function deleteProblem(request: Request, response: Response) {
  const id = textParam(request.params.id);
  await prisma.problem.delete({ where: { id } });
  return response.status(204).send();
}
