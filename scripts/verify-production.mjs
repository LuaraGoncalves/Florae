import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { once } from "node:events";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const salt = randomBytes(16).toString("hex");
const password = randomBytes(20).toString("hex");
const server = spawn(process.execPath, ["dist/src/server.js"], {
  cwd: new URL("../backend/", import.meta.url),
  env: { ...process.env, NODE_ENV: "production", PORT: "0", ADMIN_EMAIL: "admin@example.test",
    ADMIN_PASSWORD_HASH: `${salt}:${scryptSync(password, salt, 64).toString("hex")}`,
    AUTH_SECRET: randomBytes(48).toString("hex") },
  stdio: ["ignore", "pipe", "pipe"]
});
let browser;
try {
  const base = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Servidor nao iniciou")), 15000);
    server.once("exit", code => { clearTimeout(timeout); reject(new Error(`Servidor encerrou: ${code}`)); });
    server.stderr.on("data", chunk => process.stderr.write(chunk));
    server.stdout.on("data", chunk => {
      const url = String(chunk).match(/http:\/\/localhost:\d+/)?.[0];
      if (url) { clearTimeout(timeout); resolve(url); }
    });
  });
  for (const path of ["/", "/admin", "/plantas/teste"]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /id="root"/);
  }
  const missing = await fetch(`${base}/api/unknown`);
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get("content-type"), /json/);
  assert.equal((await fetch(`${base}/api/plantas`, { method: "POST" })).status, 401);
  browser = await chromium.launch(process.platform === "win32" ? { channel: "msedge", headless: true } : { headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/api/plantas*", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Catalogo temporariamente indisponivel." }) }));
  await page.route("**/api/categorias", route => route.fulfill({ json: [] }));
  await page.route("**/api/problemas", route => route.fulfill({ json: [] }));
  await mkdir(new URL("../artifacts/", import.meta.url), { recursive: true });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/admin`);
    await page.getByRole("button", { name: "Entrar", exact: true }).waitFor();
    assert.equal(await page.locator('input[type="password"]').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `artifacts/admin-${width}.png`, fullPage: true });
  }
  await page.getByLabel("E-mail", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("button", { name: "Sair", exact: true }).waitFor();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await page.getByRole("button", { name: "Entrar", exact: true }).waitFor();
  await page.goto(`${base}/plantas`);
  await page.getByRole("alert").waitFor();
  assert.match(await page.getByRole("alert").innerText(), /Catalogo temporariamente indisponivel/);
  await page.screenshot({ path: "artifacts/catalog-error.png", fullPage: true });
  await page.route("**/api/plantas*", route => route.fulfill({ json: [] }));
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await page.getByText("Nenhuma planta encontrada", { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log("OK: producao, rotas diretas, API protegida, login/logout, erro e recuperacao, desktop/mobile.");
} finally {
  await browser?.close();
  if (server.exitCode === null) { server.kill(); await once(server, "exit"); }
}
