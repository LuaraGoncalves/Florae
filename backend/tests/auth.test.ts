import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes, scryptSync } from "node:crypto";
import { once } from "node:events";
import { SignJWT } from "jose";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { verifyPassword } from "../src/auth.js";

test("login, permissoes, expiracao e payload de cadastro", async () => {
  const password = randomBytes(20).toString("hex");
  const salt = randomBytes(16).toString("hex");
  process.env.ADMIN_EMAIL = "admin@example.test";
  process.env.ADMIN_PASSWORD_HASH = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  process.env.AUTH_SECRET = randomBytes(48).toString("hex");
  assert.equal(verifyPassword(password, process.env.ADMIN_PASSWORD_HASH), true);
  assert.equal(verifyPassword("wrong", process.env.ADMIN_PASSWORD_HASH), false);
  const app = createApp();
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/api`;
  const original = prisma.plant.create;
  try {
    for (const resource of ["plantas", "categorias", "problemas"]) {
      for (const method of ["POST", "PUT", "DELETE"]) {
        const response = await fetch(`${base}/${resource}${method === "POST" ? "" : "/test"}`, { method });
        assert.equal(response.status, 401);
      }
    }
    const signIn = (value: string) => fetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: value }) });
    assert.equal((await signIn("wrong")).status, 401);
    const loggedIn = await signIn(password);
    assert.equal(loggedIn.status, 200);
    const { token } = await loggedIn.json() as { token: string };
    assert.equal((await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).status, 200);
    assert.equal((await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}x` } })).status, 401);
    const expired = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject(process.env.ADMIN_EMAIL)
      .setIssuer("florae").setAudience("florae-admin").setExpirationTime(0).sign(new TextEncoder().encode(process.env.AUTH_SECRET));
    assert.equal((await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${expired}` } })).status, 401);
    let captured: Record<string, unknown> | undefined;
    prisma.plant.create = (async (args: { data: Record<string, unknown> }) => { captured = args.data; return { id: "test", ...args.data }; }) as unknown as typeof prisma.plant.create;
    const payload = { name: "Planta teste", scientificName: "Planta testus", description: "Descricao de teste", imageUrl: "https://example.com/plant.jpg", difficulty: "EASY", light: "Luz", watering: "Agua", temperature: "20 graus", humidity: "Media", substrate: "Terra", fertilizing: "Mensal", pruning: "Anual", environment: "Interior", tips: [], categoryIds: ["category"], problemIds: ["problem"] };
    const created = await fetch(`${base}/plantas`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    assert.equal(created.status, 201);
    assert(captured);
    assert.equal("categoryIds" in captured, false);
    assert.equal("problemIds" in captured, false);
    assert.deepEqual(captured.categories, { create: [{ categoryId: "category" }] });
    assert.deepEqual(captured.problems, { create: [{ problemId: "problem" }] });
    for (let i = 0; i < 8; i++) await signIn("wrong");
    assert.equal((await signIn("wrong")).status, 429);
  } finally {
    prisma.plant.create = original;
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  }
});
