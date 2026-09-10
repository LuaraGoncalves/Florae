import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PlantCard } from "../components/PlantCard";
import { LoadError } from "../components/LoadError";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAsync } from "../hooks/useAsync";
import { difficultyLabels } from "../lib/utils";
import { api } from "../services/api";
import type { Difficulty } from "../types";

const difficultyOptions: Array<{ value: Difficulty; label: string }> = [
  { value: "EASY", label: "Fácil" },
  { value: "MEDIUM", label: "Médio" },
  { value: "HARD", label: "Difícil" }
];

export function PlantsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const category = params.get("category") ?? "";
  const difficulty = params.get("difficulty") ?? "";
  const { data: categories, error: categoryError } = useAsync(() => api.listCategories(), []);
  const { data: plants, loading, error } = useAsync(
    () => api.listPlants({ search: params.get("search") ?? "", category, difficulty }),
    [params.toString()]
  );

  const activeLabel = useMemo(() => {
    const parts = [];
    if (params.get("search")) parts.push(`Busca: ${params.get("search")}`);
    if (category) parts.push(categories?.find((item) => item.slug === category)?.name ?? category);
    if (difficulty) parts.push(difficultyLabels[difficulty as Difficulty]);
    return parts.join(" • ");
  }, [category, categories, difficulty, params]);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <section className="section-shell py-12">
      <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-leaf">catálogo</p>
          <h1 className="mt-3 text-5xl font-semibold">Encontre sua planta</h1>
          <p className="mt-4 max-w-2xl leading-7 text-primary/70">Pesquise por nome, veja categorias e filtre pelo nível de cuidado.</p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            updateFilter("search", search);
          }}
        >
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar planta" />
          <Button type="submit" variant="dark" size="icon" aria-label="Buscar">
            <Search className="h-5 w-5" />
          </Button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <Card className="sticky top-24 p-5">
            <div className="mb-5 flex items-center gap-2 font-semibold">
              <Filter className="h-5 w-5 text-leaf" />
              Filtros
            </div>
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-primary/70">Categorias</p>
                <div className="grid gap-2">
                  <Button className="justify-start" variant={!category ? "dark" : "ghost"} onClick={() => updateFilter("category", "")}>
                    Todas
                  </Button>
                  {categories?.map((item) => (
                    <Button
                      key={item.id}
                      className="justify-start"
                      variant={category === item.slug ? "dark" : "ghost"}
                      onClick={() => updateFilter("category", item.slug)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-primary/70">Dificuldade</p>
                <div className="grid gap-2">
                  {difficultyOptions.map((item) => (
                    <Button
                      key={item.value}
                      className="justify-start"
                      variant={difficulty === item.value ? "dark" : "ghost"}
                      onClick={() => updateFilter("difficulty", difficulty === item.value ? "" : item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </aside>

        <div>
          {activeLabel && <Badge className="mb-5">{activeLabel}</Badge>}
          {error || categoryError ? <LoadError message={error || categoryError!} /> : loading ? (
            <p className="text-primary/70">Carregando plantas...</p>
          ) : plants?.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <h2 className="text-2xl font-semibold">Nenhuma planta encontrada</h2>
              <p className="mt-3 text-primary/70">Tente limpar filtros ou buscar por outro nome.</p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
