import { ArrowLeft, ArrowRight, Check, Pencil, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";
import { LoadError } from "../components/LoadError";
import { ImagePicker } from "../components/ImagePicker";
import { plantConditions } from "../lib/plantOptions";
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

const plantSteps = ["Identificação", "Ambiente", "Cuidados", "Categorias", "Problemas"];

export function AdminPage() {
  const [view, setView] = useState<"list" | "form">("list");
  const [step, setStep] = useState(0);
  const [catalogOpen, setCatalogOpen] = useState(false);
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
  const managingCatalog = catalogOpen && step >= 3;

  function changeStep(next: number) {
    setCatalogOpen(false);
    setStep(next);
    requestAnimationFrame(() => document.getElementById("plant-step-title")?.focus());
  }

  function openCatalog() {
    setCatalogOpen(true);
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>("#catalog-editor input")?.focus());
  }

  function closeCatalog() {
    setCatalogOpen(false);
    requestAnimationFrame(() => document.getElementById(`manage-${plantSteps[step]}`)?.focus());
  }

  const title = editing ? `Editando ${editing.name}` : "Adicionar planta";
  const tipText = useMemo(() => form.tips.join("\n"), [form.tips]);
  const loadError = plantsState.error || categoriesState.error || problemsState.error;
  if (loadError) return <section className="section-shell py-12"><LoadError message={loadError} /></section>;
  if (plantsState.loading || categoriesState.loading || problemsState.loading) return <section className="section-shell py-12">Carregando...</section>;

  function resetPlant() {
    setEditing(null);
    setForm(emptyPlant);
    setPhoto(null);
    setStep(0);
    setCatalogOpen(false);
  }

  function selectView(next: "list" | "form") {
    if (saving || next === view) return;
    if (next === "form") resetPlant();
    setView(next);
  }

  function editPlant(plant: Plant) {
    if (saving) return;
    setView("form");
    setCatalogOpen(false);
    setStep(0);
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
      categoryIds: plant.categories.map(({ category }) => category.id).filter(id => categories.some(category => category.id === id)),
      problemIds: plant.problems.map(({ problem }) => problem.id).filter(id => problems.some(problem => problem.id === id))
    });
  }

  async function savePlant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (step < plantSteps.length - 1) {
      changeStep(step + 1);
      return;
    }
    setSaving(true);
    try {
      let payload = { ...form, tips: form.tips.map(tip => tip.trim()).filter(Boolean) };
      if (photo) {
        const { imageUrl } = await api.uploadImage(photo);
        payload = { ...payload, imageUrl };
        setForm(payload);
        setPhoto(null);
      }
      const saved = editing ? await api.updatePlant(editing.id, payload) : await api.createPlant(payload);
      plantsState.setData(editing ? plants.map((plant) => (plant.id === saved.id ? saved : plant)) : [...plants, saved]);
      resetPlant();
      setMessage("Planta salva com sucesso.");
      setView("list");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally { setSaving(false); }
  }

  async function removePlant(id: string) {
    if (saving) return;
    setSaving(true);
    try {
      await api.deletePlant(id);
      plantsState.setData(plants.filter((plant) => plant.id !== id));
      if (editing?.id === id) resetPlant();
      setMessage("Planta excluída.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível excluir.");
    } finally { setSaving(false); }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const saved = editingCategory ? await api.updateCategory(editingCategory.id, categoryForm) : await api.createCategory(categoryForm);
      categoriesState.setData(editingCategory ? categories.map((item) => (item.id === saved.id ? saved : item)) : [...categories, saved]);
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", description: "" });
      setForm(current => ({ ...current, categoryIds: [...new Set([...current.categoryIds, saved.id])] }));
      setCatalogOpen(false);
      setMessage("Categoria salva.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar a categoria.");
    }
  }

  async function removeCategory(id: string) {
    try {
      await api.deleteCategory(id);
      categoriesState.setData(categories.filter((item) => item.id !== id));
      plantsState.setData(current => current?.map(plant => ({ ...plant, categories: plant.categories.filter(({ category }) => category.id !== id) })) ?? null);
      setForm(current => ({ ...current, categoryIds: current.categoryIds.filter(value => value !== id) }));
      if (editingCategory?.id === id) {
        setEditingCategory(null);
        setCategoryForm({ name: "", slug: "", description: "" });
      }
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
      setForm(current => ({ ...current, problemIds: [...new Set([...current.problemIds, saved.id])] }));
      setCatalogOpen(false);
      setMessage("Problema salvo.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o problema.");
    }
  }

  async function removeProblem(id: string) {
    try {
      await api.deleteProblem(id);
      problemsState.setData(problems.filter((item) => item.id !== id));
      plantsState.setData(current => current?.map(plant => ({ ...plant, problems: plant.problems.filter(({ problem }) => problem.id !== id) })) ?? null);
      setForm(current => ({ ...current, problemIds: current.problemIds.filter(value => value !== id) }));
      if (editingProblem?.id === id) {
        setEditingProblem(null);
        setProblemForm({ name: "", slug: "", description: "", causes: "", recommendation: "" });
      }
      setMessage("Problema excluído.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível excluir o problema.");
    }
  }

  return (
    <section className="section-shell py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-leaf">administração</p>
          <h1 className="mt-3 text-3xl font-semibold">Conteúdo do Florae</h1>
        </div>
        <div role="status" aria-live="polite">{message && <Badge>{message}</Badge>}</div>
      </div>

      <div role="tablist" aria-label="Plantas" className="mb-6 flex border-b border-border">
        {([ ["list", "Plantas cadastradas"], ["form", "Adicionar planta"] ] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" id={`plant-tab-${id}`} aria-controls={`plant-panel-${id}`} aria-selected={view === id} tabIndex={view === id ? 0 : -1} disabled={saving}
            className={`min-h-12 flex-1 border-b-2 px-3 py-2 text-sm font-semibold focus-visible:outline-primary sm:flex-none sm:px-6 ${view === id ? "border-primary text-primary" : "border-transparent text-primary/60 hover:bg-moss/20"}`}
            onClick={() => selectView(id)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? "list" : event.key === "End" ? "form" : view === "list" ? "form" : "list";
              selectView(next);
              document.getElementById(`plant-tab-${next}`)?.focus();
            }}>
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="plant-panel-list" aria-labelledby="plant-tab-list" hidden={view !== "list"}>
        {plants.length === 0 && <p className="py-8 text-sm text-primary/70">Nenhuma planta cadastrada.</p>}
        <ul className="divide-y divide-border">
          {plants.map((plant) => <li key={plant.id} className="flex items-center justify-between gap-3 py-4">
            <div className="min-w-0"><p className="break-words font-semibold">{plant.name}</p><p className="break-words text-sm text-primary/60">{plant.scientificName}</p></div>
            <div className="flex shrink-0 gap-2">
              <Button disabled={saving} type="button" size="icon" variant="ghost" aria-label={`Editar ${plant.name}`} title="Editar planta" onClick={() => editPlant(plant)}><Pencil className="h-4 w-4" /></Button>
              <Button disabled={saving} type="button" size="icon" variant="ghost" aria-label={`Excluir ${plant.name}`} title="Excluir planta" onClick={() => { if (window.confirm(`Excluir ${plant.name}?`)) void removePlant(plant.id); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </li>)}
        </ul>
      </div>
      <div role="tabpanel" id="plant-panel-form" aria-labelledby="plant-tab-form" hidden={view !== "form"}>
      <Card className="min-w-0 p-4 sm:p-5">
          <h2 className="mb-6 break-words text-2xl font-semibold">{title}</h2>
          <ol aria-label="Etapas do cadastro" className="mb-6 grid grid-cols-5">
            {plantSteps.map((label, index) => (
              <li key={label} className="relative min-w-0">
                {index < plantSteps.length - 1 && <span aria-hidden="true" className={`absolute left-1/2 top-3.5 h-0.5 w-full ${index < step ? "bg-primary" : "bg-border"}`} />}
                <button type="button" disabled={saving || index > step} onClick={() => changeStep(index)} aria-current={index === step ? "step" : undefined} className={`relative flex min-h-16 w-full flex-col items-center gap-2 px-1 text-xs focus-visible:outline-primary ${index === step ? "font-semibold text-emerald-700" : index < step ? "text-primary" : "text-primary/60"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-4 border-white ${index < step ? "bg-primary text-white" : index === step ? "bg-emerald-600 text-white ring-2 ring-emerald-600" : "bg-border text-primary"}`}>
                    {index < step ? <Check className="h-3 w-3" aria-label="Concluída" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className="max-w-full break-words [overflow-wrap:anywhere]">{label}</span>
                </button>
              </li>
            ))}
          </ol>
          <h3 id="plant-step-title" tabIndex={-1} className="mb-4 text-lg font-semibold outline-none">{step + 1}. {plantSteps[step]}</h3>
          {managingCatalog && <Button type="button" variant="ghost" className="mb-4" onClick={closeCatalog}><ArrowLeft className="h-4 w-4" />Voltar à planta</Button>}
          <div hidden={managingCatalog}>
          <form className="grid gap-3" onSubmit={savePlant}>
            <fieldset disabled={saving} className="grid min-w-0 gap-3">
            {step === 0 && <>
            <Input required placeholder="Nome popular" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input required placeholder="Nome científico" value={form.scientificName} onChange={(event) => setForm({ ...form, scientificName: event.target.value })} />
            <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
            <ImagePicker value={form.imageUrl} file={photo} disabled={saving} onChange={(file, imageUrl) => { setPhoto(file); setForm({ ...form, imageUrl }); }} />
            </>}
            {step === 2 && <>
            <select
              aria-label="Dificuldade"
              className="h-11 rounded-md border border-border bg-white px-4 text-sm"
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value as Difficulty })}
            >
              <option value="EASY">Fácil</option>
              <option value="MEDIUM">Médio</option>
              <option value="HARD">Difícil</option>
            </select>
            </>}
            {step === 1 && plantConditions.map(({ key, label, options }) => (
              <label key={key} className="grid gap-2 text-sm font-medium">
                {label}
                <select aria-label={label} required className="h-11 min-w-0 w-full rounded-md border border-border bg-white px-3 text-sm" value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })}>
                  <option value="">Selecione</option>
                  {form[key] && !options.some(option => option === form[key]) && <option value={form[key]}>{form[key]} (valor anterior)</option>}
                  {options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            ))}
            {[
              ["description", "Descrição"],
              ["watering", "Rega"],
              ["temperature", "Temperatura"],
              ["substrate", "Substrato"],
              ["fertilizing", "Adubação"],
              ["pruning", "Poda"]
            ].filter(([key]) => (step === 0 && key === "description") || (step === 1 && ["light", "temperature", "humidity", "environment"].includes(key)) || (step === 2 && ["watering", "substrate", "fertilizing", "pruning"].includes(key))).map(([key, label]) => (
              <label key={key} className="grid gap-2 text-sm font-medium">
              {label}
              <textarea
                key={key}
                required
                className="min-h-20 rounded-md border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-moss/40"
                placeholder={label}
                value={String(form[key as keyof PlantPayload])}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
              </label>
            ))}
            {step === 2 && <>
            <textarea
              className="min-h-24 rounded-md border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-moss/40"
              placeholder="Dicas, uma por linha"
              value={tipText}
              onChange={(event) => setForm({ ...form, tips: event.target.value.split("\n") })}
            />
            </>}
            {step === 3 && <>
            <CheckList
              title="Categorias"
              description="Grupos de plantas, como suculentas ou plantas de interior."
              emptyMessage="Nenhuma categoria cadastrada."
              onManage={openCatalog}
              items={categories}
              selected={form.categoryIds}
              onChange={(categoryIds) => setForm({ ...form, categoryIds })}
            />
            </>}
            {step === 4 && <>
            <CheckList title="Problemas" description="Condições que podem afetar a planta, como folhas amareladas ou cochonilhas." emptyMessage="Nenhum problema cadastrado." onManage={openCatalog} items={problems} selected={form.problemIds} onChange={(problemIds) => setForm({ ...form, problemIds })} />
            </>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => changeStep(step - 1)}><ArrowLeft className="h-4 w-4" />Voltar</Button>
            <Button type="submit" variant="dark">
              {step === plantSteps.length - 1 ? <Save className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              {saving ? "Salvando..." : step === plantSteps.length - 1 ? "Salvar" : "Continuar"}
            </Button>
            </div>
            <Button type="button" variant="ghost" onClick={resetPlant}>
              <RefreshCcw className="h-4 w-4" />
              Limpar
            </Button>
            </fieldset>
          </form>
          </div>

      <div id={step === 3 ? "catalog-editor" : undefined} hidden={step !== 3 || !catalogOpen}>
        <div className="max-w-3xl">
          <h4 className="mb-4 text-lg font-semibold">{editingCategory ? "Editar categoria" : "Nova categoria"}</h4>
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
            {categories.length === 0 && <p className="py-4 text-sm text-primary/60">Nenhuma categoria cadastrada.</p>}
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
        </div>
      </div>

      <div id={step === 4 ? "catalog-editor" : undefined} hidden={step !== 4 || !catalogOpen}>
        <div className="max-w-3xl">
          <h4 className="mb-4 text-lg font-semibold">{editingProblem ? "Editar problema" : "Novo problema"}</h4>
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
            {problems.length === 0 && <p className="py-4 text-sm text-primary/60">Nenhum problema cadastrado.</p>}
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
        </div>
      </div>
      </Card>
      </div>
    </section>
  );
}

function CheckList<T extends Category | Problem>({
  title,
  description,
  emptyMessage,
  onManage,
  items,
  selected,
  onChange
}: {
  title: string;
  description: string;
  emptyMessage: string;
  onManage: () => void;
  items: T[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{title}</legend>
      <p className="mb-3 text-sm text-primary/70">{description}</p>
      <div className="grid gap-2">
        {items.length === 0 && <p className="text-sm text-primary/60">{emptyMessage}</p>}
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
      <Button id={`manage-${title}`} type="button" variant="ghost" className="mt-2" onClick={onManage}>
        <Plus className="h-4 w-4" />
        {title === "Categorias" ? "Gerenciar categorias" : "Gerenciar problemas"}
      </Button>
    </fieldset>
  );
}
