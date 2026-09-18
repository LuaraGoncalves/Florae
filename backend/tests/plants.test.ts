import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";

test("filtros invalidos retornam 400 antes de consultar o banco", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/api/plantas`;
  const original = prisma.plant.findMany;
  const queries: unknown[] = [];
  prisma.plant.findMany = (async (args: unknown) => { queries.push(args); return []; }) as typeof original;
  try {
    for (const query of ["difficulty=invalid", "difficulty=easy", "difficulty=EASY&difficulty=HARD", "difficulty[]=EASY", "difficulty[value]=EASY", "search[value]=test", "environment[]=Interior"]) {
      const response = await fetch(`${base}?${query}`);
      assert.equal(response.status, 400, query);
      const body = await response.json() as { message: string; issues: object };
      assert.equal(body.message, "Filtros inválidos.");
      assert.ok(Object.keys(body.issues).length > 0);
    }
    assert.equal(queries.length, 0);
    for (const value of ["EASY", "MEDIUM", "HARD"]) {
      const response = await fetch(`${base}?difficulty=%20${value}%20`);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), []);
      assert.deepEqual((queries.at(-1) as { where: { AND: unknown[] } }).where.AND[2], { difficulty: value });
    }
    for (const suffix of ["", "?difficulty=", "?difficulty=%20"]) {
      assert.equal((await fetch(`${base}${suffix}`)).status, 200);
      assert.deepEqual((queries.at(-1) as { where: { AND: unknown[] } }).where.AND[2], {});
    }
    const response = await fetch(`${base}?search=%20teste%20&category=interior&environment=Interior&light=Meia-sombra&humidity=Alta`);
    assert.equal(response.status, 200);
    assert.deepEqual((queries.at(-1) as { where: { AND: unknown[] } }).where.AND.slice(1), [
      { categories: { some: { category: { slug: "interior" } } } }, {},
      { environment: { contains: "Interior", mode: "insensitive" } },
      { light: { contains: "Meia-sombra", mode: "insensitive" } },
      { humidity: { contains: "Alta", mode: "insensitive" } }
    ]);
  } finally {
    prisma.plant.findMany = original;
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await prisma.$disconnect();
  }
});
