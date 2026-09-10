import { scryptSync, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { SignJWT, jwtVerify } from "jose";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("Configure AUTH_SECRET com pelo menos 32 caracteres.");
  return new TextEncoder().encode(value);
}

export function validateAuthConfig() {
  secret();
  if (!process.env.ADMIN_EMAIL || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(process.env.ADMIN_PASSWORD_HASH ?? "")) {
    throw new Error("Configure o administrador com npm run admin:setup --workspace backend.");
  }
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
}

export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { message: "Muitas tentativas. Aguarde 15 minutos." } });

export const login: RequestHandler = async (request, response, next) => {
  try {
    validateAuthConfig();
    const data = z.object({ email: z.string().email(), password: z.string().min(1).max(256) }).parse(request.body);
    const valid = verifyPassword(data.password, process.env.ADMIN_PASSWORD_HASH!);
    if (!valid || data.email.toLowerCase() !== process.env.ADMIN_EMAIL!.toLowerCase()) {
      response.status(401).json({ message: "E-mail ou senha incorretos." });
      return;
    }
    const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" })
      .setSubject(process.env.ADMIN_EMAIL!).setIssuer("florae").setAudience("florae-admin")
      .setIssuedAt().setExpirationTime("30m").sign(secret());
    response.setHeader("Cache-Control", "no-store");
    response.json({ token });
  } catch (error) { next(error); }
};

export const requireAdmin: RequestHandler = async (request, response, next) => {
  try {
    const token = request.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) throw new Error("Missing token");
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"], issuer: "florae", audience: "florae-admin" });
    if (payload.role !== "admin" || payload.sub !== process.env.ADMIN_EMAIL) throw new Error("Invalid administrator");
    next();
  } catch {
    response.status(401).json({ message: "Entre como administrador para continuar." });
  }
};
