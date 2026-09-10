import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { z } from "zod";

let muted = false;
const output = new Writable({ write(chunk, _encoding, callback) { if (!muted) process.stdout.write(chunk); callback(); } });
const input = createInterface({ input: process.stdin, output, terminal: Boolean(process.stdin.isTTY) });
try {
  let email = "";
  while (true) {
    email = (await input.question("E-mail do administrador: ")).trim().toLowerCase();
    if (z.string().email().safeParse(email).success) break;
    console.log("E-mail invalido. Informe um endereco completo, como nome@exemplo.com.");
  }
  let password = "";
  while (true) {
    const answer = input.question("Senha (12 a 256 caracteres; digitacao oculta): ");
    muted = true;
    try { password = await answer; }
    finally { muted = false; console.log(); }
    if (password.length >= 12 && password.length <= 256) break;
    console.log(password.length < 12
      ? "Senha muito curta. Use pelo menos 12 caracteres. Digite novamente."
      : "Senha muito longa. Use no maximo 256 caracteres. Digite novamente.");
  }
  const salt = randomBytes(16).toString("hex");
  const values = { ADMIN_EMAIL: email, ADMIN_PASSWORD_HASH: `${salt}:${scryptSync(password, salt, 64).toString("hex")}`, AUTH_SECRET: randomBytes(48).toString("hex") };
  let env = readFileSync(".env", "utf8");
  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${JSON.stringify(value)}`;
    env = pattern.test(env) ? env.replace(pattern, () => line) : `${env.trimEnd()}\n${line}\n`;
  }
  writeFileSync(".env", env);
  console.log("Administrador configurado. Reinicie o backend. Nenhuma senha foi salva em texto puro.");
} finally { input.close(); }
