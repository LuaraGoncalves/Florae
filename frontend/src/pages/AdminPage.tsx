import { Pencil, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAsync } from "../hooks/useAsync";
import { difficultyLabels } from "../lib/utils";
import { api } from "../services/api";
import { LoadError } from "../components/LoadError";
import { ImagePicker } from "../components/ImagePicker";
import { PlantImage } from "../components/PlantImage";
import type { Category, Difficulty, Plant, PlantPayload, Problem } from "../types";

const emptyPlant: PlantPayload = {
  name: "",
  scientificName: "",
  slug: "",
  description: "",
  imageUrl: "",
  difficulty: "EASY",
  light: "",
  watering: "",
  temperature: "",
  humidity: "",
  substrate: "",
  fertilizing: "",
  pruning: "",
  environment: "",
  tips: [],
  categoryIds: [],
  problemIds: []
};

export function AdminPage() {
  const plantsState = useAsync(() => api.listPlants(), []);
  const categoriesState = useAsync(() => api.listCategories(), []);
  const problemsState = useAsync(() => api.listProblems(), []);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Plant | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [form, setForm] = useState<PlantPayload>(emptyPlant);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Omit<Category, "id">>({ name: "", slug: "", description: "" });
  const [problemForm, setProblemForm] = useState<Omit<Problem, "id">>({ name: "", slug: "", description: "", causes: "", recommendation: "" });
  const plants = plantsState.data ?? [];
  const categories = categoriesState.data ?? [];
  const problems = problemsState.data ?? [];

  const title = editing ? `Editando ${editing.name}` : "Nova planta";
  const tipText = useMemo(() => form.tips.join("\n"), [form.tips]);
  const loadError = plantsState.error || categoriesState.error || problemsState.error;
  if (loadError) return <section className="section-shell py-12"><LoadError message={loadError} /></section>;
  if (plantsState.loading || categoriesState.loading || problemsState.loading) return <section className="section-shell py-12">Carregando...</section>;

  function editPlant(plant: Plant) {
    if (saving) return;
    setPhoto(null);
    setEditing(plant);
    setForm({
      name: plant.name,
      scientificName: plant.scientificName,
      slug: plant.slug,
      description: plant.description,
      imageUrl: plant.imageUrl,
      difficulty: plant.difficulty,
      light: plant.light,
      watering: plant.watering,
      temperature: plant.temperature,
      humidity: plant.humidity,
      substrate: plant.substrate,
      fertilizing: plant.fertilizing,
      pruning: plant.pruning,
      environment: plant.environment,
      tips: plant.tips,
      categoryIds: plant.categories.map(({ category }) => category.id),
      problemIds: plant.problems.map(({ problem }) => problem.id)
    });
  }

  async function savePlant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      let payload = form;
      if (photo) {
        const { imageUrl } = await api.uploadImage(photo);
        payload = { ...form, imageUrl };
        setForm(payload);
        setPhoto(null);
      }
      const saved = editing ? await api.updatePlant(editing.id, payload) : await api.createPlant(payload);
      plantsState.setData(editing ? plants.map((plant) => (plant.id === saved.id ? saved : plant)) : [...plants, saved]);
      setEditing(null);
      setForm(emptyPlant);
      setMessage("Planta salva com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally { setSaving(false); }
  }

  async function removePlant(id: string) {
    try {
      await api.deletePlant(id);
      plantsState.setData(plants.filter((plant) => plant.id !== id));
      setMessage("Planta excluída.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível excluir.");
    }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const saved = editingCategory ? await api.updateCategory(editingCategory.id, categoryForm) : await api.createCategory(categoryForm);
      categoriesState.setData(editingCategory ? categories.map((item) => (item.id === saved.id ? saved : item)) : [...categories, saved]);
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", description: "" });
      setMessage("Categoria salva.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar a categoria.");
    }
  }

  async function removeCategory(id: string) {
    try {
      await api.deleteCategory(id);
      categoriesState.setData(categories.filter((item) => item.id !== id));
      setMessage("Categoria excluída.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível excluir a categoria.");
    }
  }

  async function saveProblem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const saved = editingProblem ? await api.updateProblem(editingProblem.id, problemForm) : await api.createProblem(problemForm);
      problemsState.setData(editingProblem ? problems.map((item) => (item.id === saved.id ? saved : item)) : [...problems, saved]);
      setEditingProblem(null);
      setProblemForm({ name: "", slug: "", description: "", causes: "", recommendation: "" });
      setMessage("Problema salvo.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o problema.");
    }
  }

  async function removeProblem(id: string) {
    try {
      await api.deleteProblem(id);
      problemsState.setData(problems.filter((item) => item.id !== id));
      setMessage("Problema excluído.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível excluir o problema.");
    }
  }

  return (
    <section className="section-shell py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-leaf">administração</p>
          <h1 className="mt-3 text-5xl font-semibold">Conteúdo do Florae</h1>
          <p className="mt-4 max-w-2xl leading-7 text-primary/70">Gerencie plantas, categorias e problemas comuns usando a API.</p>
        </div>
        <Badge>{message}</Badge>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Plantas cadastradas</h2>
            <Button
              variant="dark"
              disabled={saving}
              onClick={() => {
                setEditing(null);
                setPhoto(null);
                setForm(emptyPlant);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-primary/60">
                  <th className="py-3">Planta</th>
                  <th>Dificuldade</th>
                  <th>Categorias</th>
                  <th className="w-32">Ações</th>
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => (
                  <tr key={plant.id} className="border-b border-border/70">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <PlantImage className="h-12 w-12 rounded-md object-cover" src={plant.imageUrl} alt={plant.name} />
                        <div>
                          <p className="font-semibold">{plant.name}</p>
                          <p className="text-primary/55">{plant.scientificName}</p>
                        </div>
                      </div>
                    </td>
                    <td>{difficultyLabels[plant.difficulty]}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {plant.categories.map(({ category }) => (
                          <Badge key={category.id}>{category.name}</Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button disabled={saving} variant="ghost" size="icon" aria-label="Editar" onClick={() => editPlant(plant)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button disabled={saving} variant="ghost" size="icon" aria-label="Excluir" onClick={() => removePlant(plant.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-5 text-2xl font-semibold">{title}</h2>
          <form className="grid gap-3" onSubmit={savePlant}>
            <fieldset disabled={saving} className="grid min-w-0 gap-3">
            <Input required placeholder="Nome popular" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input required placeholder="Nome científico" value={form.scientificName} onChange={(event) => setForm({ ...form, scientificName: event.target.value })} />
            <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
            <ImagePicker value={form.imageUrl} file={photo} disabled={saving} onChange={(file, imageUrl) => { setPhoto(file); setForm({ ...form, imageUrl }); }} />
            <select
              className="h-11 rounded-md border border-border bg-white px-4 text-sm"
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value as Difficulty })}
            >
              <option value="EASY">Fácil</option>
              <option value="MEDIUM">Médio</option>
              <option value="HARD">Difícil</option>
            </select>
            {[
              ["description", "Descrição"],
              ["light", "Iluminação"],
              ["watering", "Rega"],
              ["temperature", "Temperatura"],
              ["humidity", "Umidade"],
              ["substrate", "Substrato"],
              ["fertilizing", "Adubação"],
              ["pruning", "Poda"],
              ["environment", "Ambiente"]
            ].map(([key, label]) => (
              <textarea
                key={key}
                required
                className="min-h-20 rounded-md border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-moss/40"
                placeholder={label}
                value={String(form[key as keyof PlantPayload])}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            ))}
            <textarea
              className="min-h-24 rounded-md border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-moss/40"
              placeholder="Dicas, uma por linha"
              value={tipText}
              onChange={(event) => setForm({ ...form, tips: event.target.value.split("\n").filter(Boolean) })}
            />
            <CheckList
              title="Categorias"
              items={categories}
              selected={form.categoryIds}
              onChange={(categoryIds) => setForm({ ...form, categoryIds })}
            />
            <CheckList title="Problemas" items={problems} selected={form.problemIds} onChange={(problemIds) => setForm({ ...form, problemIds })} />
            <Button type="submit" variant="dark">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setForm(emptyPlant); setPhoto(null); setEditing(null); }}>
              <RefreshCcw className="h-4 w-4" />
              Limpar
            </Button>
            </fieldset>
          </form>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-5 text-2xl font-semibold">Categorias</h2>
          <form className="mb-5 grid gap-3" onSubmit={saveCategory}>
            <Input required placeholder="Nome da categoria" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} />
            <Input placeholder="Slug" value={categoryForm.slug} onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })} />
            <Input required placeholder="Descrição" value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} />
            <Button type="submit" variant="dark">
              <Save className="h-4 w-4" />
              {editingCategory ? "Atualizar categoria" : "Salvar categoria"}
            </Button>
          </form>
          <div className="grid gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-white p-3">
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-sm text-primary/60">{category.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Editar categoria"
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryForm({ name: category.name, slug: category.slug, description: category.description });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Excluir categoria" onClick={() => removeCategory(category.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-5 text-2xl font-semibold">Problemas comuns</h2>
          <form className="mb-5 grid gap-3" onSubmit={saveProblem}>
            <Input required placeholder="Nome do problema" value={problemForm.name} onChange={(event) => setProblemForm({ ...problemForm, name: event.target.value })} />
            <Input placeholder="Slug" value={problemForm.slug} onChange={(event) => setProblemForm({ ...problemForm, slug: event.target.value })} />
            <Input required placeholder="Descrição" value={problemForm.description} onChange={(event) => setProblemForm({ ...problemForm, description: event.target.value })} />
            <Input required placeholder="Possíveis causas" value={problemForm.causes} onChange={(event) => setProblemForm({ ...problemForm, causes: event.target.value })} />
            <Input required placeholder="Recomendação" value={problemForm.recommendation} onChange={(event) => setProblemForm({ ...problemForm, recommendation: event.target.value })} />
            <Button type="submit" variant="dark">
              <Save className="h-4 w-4" />
              {editingProblem ? "Atualizar problema" : "Salvar problema"}
            </Button>
          </form>
          <div className="grid gap-3">
            {problems.map((problem) => (
              <div key={problem.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-white p-3">
                <div>
                  <p className="font-semibold">{problem.name}</p>
                  <p className="text-sm text-primary/60">{problem.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Editar problema"
                    onClick={() => {
                      setEditingProblem(problem);
                      setProblemForm({
                        name: problem.name,
                        slug: problem.slug,
                        description: problem.description,
                        causes: problem.causes,
                        recommendation: problem.recommendation
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Excluir problema" onClick={() => removeProblem(problem.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function CheckList<T extends Category | Problem>({
  title,
  items,
  selected,
  onChange
}: {
  title: string;
  items: T[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-3">
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={(event) => {
                onChange(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id));
              }}
            />
            {item.name}
          </label>
        ))}
      </div>
    </div>
  );
}
