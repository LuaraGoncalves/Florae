import assert from "node:assert/strict";
import sharp from "sharp";

export async function verifyGarden(page, base, password) {
  const plant = { id: "garden-test", slug: "planta-teste", name: "Planta teste", scientificName: "Species test", imageUrl: "", description: "Planta para verificar os fluxos", difficulty: "EASY", light: "Luz indireta", watering: "Conforme substrato", temperature: "20 graus", humidity: "Media", substrate: "Terra", fertilizing: "Mensal", pruning: "Anual", environment: "Interior", tips: [], categories: [], problems: [] };
  let saved;
  await page.route("**/api/plantas*", async route => {
    if (route.request().method() === "POST") { saved = route.request().postDataJSON(); await route.fulfill({ status: 201, json: { ...plant, ...saved, id: "new-test" } }); }
    else await route.fulfill({ json: route.request().url().endsWith("/planta-teste") ? plant : [plant] });
  });
  await page.goto(`${base}/plantas`);
  await page.getByRole("button", { name: "Adicionar aos favoritos", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Remover dos favoritos", exact: true }).waitFor();
  await page.getByRole("button", { name: "Minha coleção", exact: true }).click();
  await page.goto(`${base}/minhas-plantas`);
  await page.getByLabel("Nome na coleção").fill("Minha planta da varanda");
  await page.getByLabel("Local", { exact: true }).fill("Varanda");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page.getByRole("heading", { name: "Minha planta da varanda" }).waitFor();
  await page.getByRole("button", { name: "Registrar cuidado" }).click();
  await page.getByLabel("Observação").fill("Substrato seco antes da rega.");
  await page.getByRole("button", { name: "Salvar cuidado" }).click();
  await page.reload();
  await page.getByText("Substrato seco antes da rega.", { exact: true }).waitFor();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `artifacts/garden-${width}.png`, fullPage: true });
  }
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Excluir registro" }).click();
  await page.getByText("Nenhum cuidado registrado.").waitFor();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Remover Minha planta da varanda" }).click();
  await page.getByText("Sua coleção está vazia.").waitFor();
  await page.goto(`${base}/favoritos`);
  await page.getByRole("heading", { name: "Planta teste", exact: true }).waitFor();
  await page.getByRole("button", { name: "Remover dos favoritos" }).click();
  await page.getByText(/Nenhuma planta favorita ainda/).waitFor();

  await page.route("**/api/imagens/status", route => route.fulfill({ json: { enabled: true } }));
  let uploaded = false;
  await page.route("**/api/imagens", route => { uploaded = true; assert.match(route.request().headers()["content-type"], /multipart\/form-data; boundary=/); return route.fulfill({ status: 201, json: { imageUrl: "https://example.test/upload.webp" } }); });
  await page.goto(`${base}/admin`);
  await page.getByLabel("E-mail", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("tab", { name: "Plantas cadastradas", exact: true }).waitFor();
  assert.equal(await page.getByRole("tab").count(), 2);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `artifacts/admin-list-${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Editar Planta teste", exact: true }).click();
  assert.equal(await page.getByRole("tab", { name: "Adicionar planta", exact: true }).getAttribute("aria-selected"), "true");
  assert.equal(await page.getByPlaceholder("Nome popular", { exact: true }).inputValue(), "Planta teste");
  await page.getByRole("button", { name: "Limpar", exact: true }).click();
  await page.getByRole("tab", { name: "Plantas cadastradas", exact: true }).click();
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Excluir Planta teste", exact: true }).click();
  await page.getByRole("button", { name: "Editar Planta teste", exact: true }).waitFor();
  await page.getByRole("tab", { name: "Adicionar planta", exact: true }).click();
  await page.getByPlaceholder("Nome popular", { exact: true }).fill("Nova planta");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  assert.equal(await page.locator("#plant-step-title").innerText(), "1. Identificação");
  assert.equal(saved, undefined);
  await page.getByPlaceholder("Nome científico", { exact: true }).fill("Species test");
  await page.getByLabel("Descrição", { exact: true }).fill("Conteudo de teste valido");
  const input = page.getByLabel("Selecionar foto", { exact: true });
  await input.setInputFiles({ name: "bad.txt", mimeType: "text/plain", buffer: Buffer.from("invalid") });
  await page.getByText("Selecione JPEG, PNG ou WebP de até 5 MB.").waitFor();
  const image = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).png().toBuffer();
  await input.setInputFiles({ name: "test.png", mimeType: "image/png", buffer: image });
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  assert.equal(await page.getByPlaceholder("Nome popular", { exact: true }).inputValue(), "Nova planta");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  for (const labels of [["Iluminação", "Temperatura", "Umidade", "Ambiente"], ["Rega", "Substrato", "Adubação", "Poda"]]) {
    for (const label of labels) {
      const values = { "Iluminação": "Meia-sombra", "Umidade": "Alta", "Ambiente": "Interior" };
      if (values[label]) await page.getByLabel(label, { exact: true }).selectOption(values[label]);
      else await page.getByLabel(label, { exact: true }).fill("Conteudo de teste valido");
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `artifacts/step-${labels[0]}-${width}.png`, fullPage: true });
    }
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
  }
  for (const [button, tab] of [["Gerenciar categorias", "Categorias"], ["Gerenciar problemas", "Problemas"]]) {
    await page.getByRole("button", { name: button, exact: true }).click();
    await page.getByPlaceholder(tab === "Categorias" ? "Nome da categoria" : "Nome do problema", { exact: true }).fill("Rascunho");
    await page.getByRole("button", { name: "Fechar gerenciamento", exact: true }).click();
    assert.equal(await page.locator("#plant-step-title").innerText(), tab === "Categorias" ? "4. Categorias" : "5. Problemas");
    if (tab === "Categorias") {
      assert.equal(await page.getByRole("button", { name: "Salvar", exact: true }).count(), 0);
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
    }
  }
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page.getByText("Planta salva com sucesso.").waitFor();
  assert.equal(await page.getByRole("tab", { name: "Plantas cadastradas", exact: true }).getAttribute("aria-selected"), "true");
  await page.getByRole("button", { name: "Editar Nova planta", exact: true }).waitFor();
  assert(uploaded); assert.equal(saved.imageUrl, "https://example.test/upload.webp");
  assert.equal(saved.environment, "Interior");
  assert.equal(saved.light, "Meia-sombra");
  assert.equal(saved.humidity, "Alta");

  await page.evaluate(() => localStorage.setItem("florae:garden:v1", "invalid-json"));
  await page.goto(`${base}/minhas-plantas`);
  await page.getByRole("alert").waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem("florae:garden:v1")), "invalid-json");
  await page.evaluate(() => localStorage.removeItem("florae:garden:v1"));
  console.log("OK: favoritos persistentes, colecao, cuidados, exclusoes, upload simulado e dados locais invalidos preservados.");
}
