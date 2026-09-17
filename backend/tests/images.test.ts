import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import express from "express";
import sharp from "sharp";
import { SignJWT } from "jose";
import { createImageRouter } from "../src/imageRoutes.js";
import { plantSchema } from "../src/schemas.js";

test("upload exige login e valida conteudo, tamanho e armazenamento", async () => {
  process.env.AUTH_SECRET = randomBytes(48).toString("hex");
  process.env.ADMIN_EMAIL = "photos@example.test";
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject(process.env.ADMIN_EMAIL)
    .setIssuer("florae").setAudience("florae-admin").setExpirationTime("5m").sign(new TextEncoder().encode(process.env.AUTH_SECRET));
  let enabled = true;
  let fail = false;
  let stored = 0;
  const app = express();
  app.use("/images", createImageRouter(async buffer => {
    assert.equal((await sharp(buffer).metadata()).format, "webp");
    if (fail) throw new Error("offline");
    stored++;
    return "https://example.test/photo.webp";
  }, () => enabled));
  const server = app.listen(0, "127.0.0.1"); await once(server, "listening");
  const address = server.address(); assert(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/images`;
  const send = (buffer: Uint8Array, type: string, auth = true) => {
    const data = new FormData(); data.append("image", new Blob([new Uint8Array(buffer)], { type }), "photo");
    return fetch(base, { method: "POST", body: data, headers: auth ? { Authorization: `Bearer ${token}` } : {} });
  };
  try {
    const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).png().toBuffer();
    assert.equal((await send(png, "image/png", false)).status, 401);
    assert.equal((await fetch(`${base}/status`)).status, 401);
    assert.equal((await send(Buffer.from("not an image"), "image/png")).status, 400);
    assert.equal((await send(Buffer.from("<svg/>"), "image/svg+xml")).status, 400);
    assert.equal((await send(Buffer.alloc(5 * 1024 * 1024 + 1), "image/png")).status, 413);
    const response = await send(png, "image/png"); assert.equal(response.status, 201);
    assert.equal((await response.json()).imageUrl, "https://example.test/photo.webp");
    assert.equal(stored, 1);
    fail = true; assert.equal((await send(png, "image/png")).status, 502);
    enabled = false; assert.equal((await send(png, "image/png")).status, 503);
    assert.equal(plantSchema.shape.imageUrl.parse(""), "");
    assert.equal(plantSchema.shape.imageUrl.safeParse("javascript:alert(1)").success, false);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
