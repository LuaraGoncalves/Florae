import cors from "cors";
import express from "express";
import { fileURLToPath } from "node:url";
import { routes } from "./routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { validateAuthConfig } from "./auth.js";

export function createApp() {
  const app = express();
  if (process.env.NODE_ENV === "production") validateAuthConfig();
  if (process.env.TRUST_PROXY_HOPS) app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
  app.disable("x-powered-by");
  app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
  app.use(express.json());
  app.use("/api", routes);
  app.use("/api", (_request, response) => response.status(404).json({ message: "Endpoint nao encontrado." }));
  if (process.env.NODE_ENV === "production") {
    const frontend = fileURLToPath(new URL("../../../frontend/dist/", import.meta.url));
    app.use(express.static(frontend));
    app.get("*", (_request, response) => response.sendFile(`${frontend}/index.html`));
  }
  app.use(errorHandler);
  return app;
}
