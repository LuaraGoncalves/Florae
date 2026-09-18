import assert from "node:assert/strict";

export async function verifyHome(page, base) {
  const makePlant = (name, difficulty) => ({
    id: name, slug: name, name, difficulty, scientificName: "Species test", imageUrl: "",
    description: "Descricao para teste", light: "Luz indireta", watering: "Rega moderada",
    categories: [], problems: []
  });
  let plants = [makePlant("Dificil", "HARD"), makePlant("Media", "MEDIUM"),
    ...[1, 2, 3, 4].map(id => makePlant(`Facil ${id}`, "EASY"))];
  let requestedDifficulty;
  const handler = route => {
    requestedDifficulty = new URL(route.request().url()).searchParams.get("difficulty");
    return route.fulfill({ json: plants });
  };
  await page.route("**/api/plantas*", handler);
  try {
    await page.goto(base);
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Plantas para começar", exact: true }) });
    await section.getByRole("heading", { name: "Facil 1", exact: true }).waitFor();
    assert.equal(requestedDifficulty, "EASY");
    assert.deepEqual(await section.locator("h3").allTextContents(), ["Facil 1", "Facil 2", "Facil 3"]);
    assert.equal(await section.getByRole("link", { name: "Ver catálogo", exact: true }).getAttribute("href"), "/plantas?difficulty=EASY");
    plants = [makePlant("Dificil", "HARD")];
    await page.reload();
    await section.getByText("Nenhuma planta de cuidado fácil cadastrada.", { exact: true }).waitFor();
    assert.equal(await section.locator("h3").count(), 0);
    plants = [];
    await page.reload();
    await section.getByText("Nenhuma planta de cuidado fácil cadastrada.", { exact: true }).waitFor();
    console.log("OK: destaques limitados a tres plantas faceis, consulta filtrada e estado vazio sem substitutos.");
  } finally {
    await page.unroute("**/api/plantas*", handler);
  }
}
