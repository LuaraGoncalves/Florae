import assert from "node:assert/strict";

export async function verifyAdminRelations(page, base, password) {
  let categories = [
    { id: "category-remove", name: "Categoria removida", slug: "removida", description: "Categoria de teste" },
    { id: "category-keep", name: "Categoria mantida", slug: "mantida", description: "Categoria de teste" }
  ];
  let problems = [
    { id: "problem-remove", name: "Problema removido", slug: "removido", description: "Problema de teste", causes: "Causas de teste", recommendation: "Cuidados de teste" },
    { id: "problem-keep", name: "Problema mantido", slug: "mantido", description: "Problema de teste", causes: "Causas de teste", recommendation: "Cuidados de teste" }
  ];
  const plants = ["A", "B"].map(letter => ({
    id: `plant-${letter}`, name: `Planta ${letter}`, slug: `planta-${letter.toLowerCase()}`, scientificName: "Species test",
    description: "Descricao de teste valida", imageUrl: "", difficulty: "EASY", light: "Meia-sombra", humidity: "Alta",
    environment: "Interior", watering: "Semanal", temperature: "20 graus", substrate: "Terra", fertilizing: "Mensal", pruning: "Anual",
    tips: ["Dica existente"], categories: categories.map(category => ({ category })), problems: problems.map(problem => ({ problem }))
  }));
  const writes = [];
  const plantHandler = async route => {
    if (route.request().method() === "PUT") {
      const payload = route.request().postDataJSON();
      writes.push(payload);
      const id = new URL(route.request().url()).pathname.split("/").at(-1);
      await route.fulfill({ json: { ...plants.find(plant => plant.id === id), ...payload,
        categories: categories.filter(category => payload.categoryIds.includes(category.id)).map(category => ({ category })),
        problems: problems.filter(problem => payload.problemIds.includes(problem.id)).map(problem => ({ problem })) } });
    } else {
      assert.equal(route.request().method(), "GET");
      await route.fulfill({ json: plants });
    }
  };
  const categoryHandler = async route => {
    if (route.request().method() === "DELETE") {
      const id = new URL(route.request().url()).pathname.split("/").at(-1);
      if (id === "category-keep") return route.fulfill({ status: 500, json: { message: "Exclusao recusada no teste." } });
      categories = categories.filter(category => category.id !== id);
      await route.fulfill({ status: 204 });
    } else await route.fulfill({ json: categories });
  };
  const problemHandler = async route => {
    if (route.request().method() === "DELETE") {
      const id = new URL(route.request().url()).pathname.split("/").at(-1);
      problems = problems.filter(problem => problem.id !== id);
      await route.fulfill({ status: 204 });
    } else await route.fulfill({ json: problems });
  };
  await page.route("**/api/plantas**", plantHandler);
  await page.route("**/api/categorias**", categoryHandler);
  await page.route("**/api/problemas**", problemHandler);
  const next = () => page.getByRole("button", { name: "Continuar", exact: true }).click();
  const edit = async name => {
    await page.getByRole("tab", { name: "Plantas cadastradas", exact: true }).click();
    await page.getByRole("button", { name: `Editar ${name}`, exact: true }).click();
    await next(); await next(); await next();
  };
  try {
    await page.goto(`${base}/admin`);
    await page.getByLabel("E-mail", { exact: true }).fill("admin@example.test");
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await edit("Planta A");
    await page.getByRole("button", { name: "Gerenciar categorias", exact: true }).click();
    await page.getByRole("button", { name: "Editar categoria", exact: true }).first().click();
    await page.getByRole("button", { name: "Excluir categoria", exact: true }).first().click();
    await page.getByText("Categoria excluída.", { exact: true }).waitFor();
    await page.getByRole("heading", { name: "Nova categoria", exact: true }).waitFor();
    assert.equal(await page.getByPlaceholder("Nome da categoria", { exact: true }).inputValue(), "");
    await page.getByRole("button", { name: "Excluir categoria", exact: true }).click();
    await page.getByText("Exclusao recusada no teste.", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Voltar à planta", exact: true }).click();
    assert.equal(await page.getByRole("checkbox", { name: "Categoria mantida", exact: true }).isChecked(), true);
    await edit("Planta A");
    assert.equal(await page.getByRole("checkbox", { name: "Categoria removida", exact: true }).count(), 0);
    await next();
    await page.getByRole("button", { name: "Gerenciar problemas", exact: true }).click();
    await page.getByRole("button", { name: "Editar problema", exact: true }).first().click();
    await page.getByRole("button", { name: "Excluir problema", exact: true }).first().click();
    await page.getByText("Problema excluído.", { exact: true }).waitFor();
    await page.getByRole("heading", { name: "Novo problema", exact: true }).waitFor();
    assert.equal(await page.getByPlaceholder("Nome do problema", { exact: true }).inputValue(), "");
    for (const name of ["Planta A", "Planta B"]) {
      await edit(name);
      assert.equal(await page.getByRole("checkbox", { name: "Categoria mantida", exact: true }).isChecked(), true);
      await next();
      assert.equal(await page.getByRole("checkbox", { name: "Problema removido", exact: true }).count(), 0);
      assert.equal(await page.getByRole("checkbox", { name: "Problema mantido", exact: true }).isChecked(), true);
      await page.getByRole("button", { name: "Salvar", exact: true }).click();
      await page.getByRole("button", { name: `Editar ${name}`, exact: true }).waitFor();
      assert.deepEqual(writes.at(-1).categoryIds, ["category-keep"]);
      assert.deepEqual(writes.at(-1).problemIds, ["problem-keep"]);
      assert.deepEqual(writes.at(-1).tips, ["Dica existente"]);
    }
    assert.equal(writes.length, 2);
    await page.getByRole("button", { name: "Editar Planta A", exact: true }).click();
    await page.getByRole("tab", { name: "Plantas cadastradas", exact: true }).click();
    await page.getByRole("tab", { name: "Plantas cadastradas", exact: true }).press("End");
    assert.equal(await page.getByPlaceholder("Nome popular", { exact: true }).inputValue(), "");
    await page.getByRole("heading", { name: "Adicionar planta", exact: true }).waitFor();
    console.log("OK: exclusao de vinculos, falha preserva selecao, reedicao sem IDs excluidos e novo cadastro por teclado.");
  } finally {
    await page.unroute("**/api/plantas**", plantHandler);
    await page.unroute("**/api/categorias**", categoryHandler);
    await page.unroute("**/api/problemas**", problemHandler);
  }
}
