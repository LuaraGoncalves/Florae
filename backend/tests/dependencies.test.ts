import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfigFromFile } from "@prisma/config";

const require = createRequire(import.meta.url);

test("Prisma carrega a configuracao com a dependencia de merge corrigida", async () => {
  const configRequire = createRequire(require.resolve("@prisma/config"));
  const { deepmerge } = configRequire("deepmerge-ts");
  const left: Record<string, unknown> = { name: "left" };
  const right: Record<string, unknown> = { name: "right" };
  left.self = left;
  right.self = right;
  assert.doesNotThrow(() => deepmerge(left, right));
  assert.deepEqual(deepmerge({ migrations: { path: "migrations" } }, { migrations: { seed: "tsx seed.ts" } }), {
    migrations: { path: "migrations", seed: "tsx seed.ts" }
  });
  const directory = await mkdtemp(join(tmpdir(), "florae-prisma-test-"));
  try {
    await writeFile(join(directory, "prisma.config.mjs"), 'export default { schema: "schema.prisma", migrations: { path: "migrations" } };');
    const loaded = await loadConfigFromFile({ configRoot: directory });
    assert.equal(loaded.error, undefined);
    assert.equal(loaded.config?.schema, join(directory, "schema.prisma"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("Express e body-parser usam qs corrigido e preservam filtros", () => {
  const expressRequire = createRequire(require.resolve("express"));
  const bodyParserRequire = createRequire(expressRequire.resolve("body-parser"));
  for (const parent of [expressRequire, bodyParserRequire]) {
    assert.equal(parent("qs/package.json").version, "6.16.0");
    const qs = parent("qs");
    assert.deepEqual(qs.parse("difficulty=EASY&environment=Interior"), { difficulty: "EASY", environment: "Interior" });
    assert.doesNotThrow(() => qs.stringify({ value: { constructor: { isBuffer: "not-a-function" } } }));
  }
});
