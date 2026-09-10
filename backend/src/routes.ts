import { Router } from "express";
import {
  createPlant,
  deletePlant,
  getPlant,
  listPlants,
  updatePlant
} from "./controllers/plantsController.js";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from "./controllers/categoriesController.js";
import {
  createProblem,
  deleteProblem,
  listProblems,
  updateProblem
} from "./controllers/problemsController.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { login, loginLimiter, requireAdmin } from "./auth.js";

export const routes = Router();
routes.post("/auth/login", loginLimiter, login);
routes.get("/auth/me", requireAdmin, (_request, response) => response.json({ role: "admin" }));
routes.use((request, response, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  return requireAdmin(request, response, next);
});

routes.get("/health", (_request, response) => response.json({ status: "ok", app: "Florae" }));

routes.get("/plantas", asyncHandler(listPlants));
routes.get("/plantas/:id", asyncHandler(getPlant));
routes.post("/plantas", asyncHandler(createPlant));
routes.put("/plantas/:id", asyncHandler(updatePlant));
routes.delete("/plantas/:id", asyncHandler(deletePlant));

routes.get("/categorias", asyncHandler(listCategories));
routes.post("/categorias", asyncHandler(createCategory));
routes.put("/categorias/:id", asyncHandler(updateCategory));
routes.delete("/categorias/:id", asyncHandler(deleteCategory));

routes.get("/problemas", asyncHandler(listProblems));
routes.post("/problemas", asyncHandler(createProblem));
routes.put("/problemas/:id", asyncHandler(updateProblem));
routes.delete("/problemas/:id", asyncHandler(deleteProblem));
