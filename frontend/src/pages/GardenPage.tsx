import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Droplets, Save, Trash2, Plus, X } from "lucide-react";
import { garden, useGarden, type GardenEntry, type CareRecord } from "../services/garden";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { PlantImage } from "../components/PlantImage";

function today() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function GardenPlant({ entry }: { entry: GardenEntry }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  function act(action: () => void, success: string) { try { action(); setMessage(success); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar."); } }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    act(() => garden.updatePlant(entry.id, String(form.get("nickname")), String(form.get("location"))), "Planta atualizada.");
  }
  function record(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const date = String(form.get("date"));
    if (!date || date > today()) { setMessage("Escolha uma data até hoje."); return; }
    act(() => { garden.addRecord(entry.id, { date, type: String(form.get("type")) as CareRecord["type"], note: String(form.get("note")).trim() }); setOpen(false); }, "Cuidado registrado.");
  }
  const records = [...entry.records].sort((a, b) => b.date.localeCompare(a.date));
  const lastWatering = records.find(item => item.type === "Rega");
  return <article className="min-w-0 border-b border-border py-8">
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      <PlantImage src={entry.plant.imageUrl} alt={entry.plant.name} className="aspect-square w-full max-w-[180px] rounded-md object-cover" />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4"><div><h2 className="break-words text-2xl font-semibold">{entry.nickname}</h2><Link className="text-sm underline" to={`/plantas/${entry.plant.slug}`}>{entry.plant.name}</Link></div>
          <Button variant="ghost" size="icon" aria-label={`Remover ${entry.nickname}`} title="Remover da coleção" onClick={() => { if (window.confirm("Remover esta planta da coleção e seu histórico de cuidados?")) act(() => garden.removePlant(entry.id), ""); }}><Trash2 className="h-4 w-4" /></Button></div>
        <form onSubmit={save} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">Nome na coleção<Input name="nickname" defaultValue={entry.nickname} required maxLength={100} /></label>
          <label className="grid gap-1 text-sm">Local<Input name="location" defaultValue={entry.location} maxLength={100} placeholder="Ex.: varanda" /></label>
          <Button variant="dark" type="submit" className="justify-self-start"><Save className="h-4 w-4" />Salvar</Button>
        </form>
        <p className="my-4 flex items-center gap-2 text-sm"><Droplets className="h-4 w-4" />Última rega: {lastWatering ? new Date(`${lastWatering.date}T12:00:00`).toLocaleDateString("pt-BR") : "não registrada"}</p>
        <Button variant="dark" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{open ? "Cancelar" : "Registrar cuidado"}</Button>
        {open && <form onSubmit={record} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">Cuidado<select name="type" className="h-11 rounded-md border border-border bg-white px-3">{["Rega", "Adubação", "Poda", "Outro"].map(type => <option key={type}>{type}</option>)}</select></label>
          <label className="grid gap-1 text-sm">Data<Input name="date" type="date" defaultValue={today()} max={today()} required /></label>
          <label className="grid gap-1 text-sm sm:col-span-2">Observação<textarea name="note" maxLength={1000} className="min-h-24 w-full rounded-md border border-border bg-white p-3" /></label>
          <Button type="submit" variant="dark" className="justify-self-start"><Save className="h-4 w-4" />Salvar cuidado</Button>
        </form>}
        <p role="status" className="mt-3 min-h-5 text-sm">{message}</p>
        <h3 className="mt-4 font-semibold">Histórico</h3>
        {!records.length && <p className="mt-2 text-sm text-primary/60">Nenhum cuidado registrado.</p>}
        <ul className="divide-y divide-border">{records.map(item => <li key={item.id} className="flex items-start justify-between gap-4 py-3">
          <div className="min-w-0"><p className="text-sm font-semibold">{item.type} · {new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR")}</p><p className="whitespace-pre-wrap break-words text-sm">{item.note}</p></div>
          <Button variant="ghost" size="icon" aria-label="Excluir registro" title="Excluir registro" onClick={() => { if (window.confirm("Excluir este registro de cuidado?")) act(() => garden.removeRecord(entry.id, item.id), "Registro excluído."); }}><Trash2 className="h-4 w-4" /></Button>
        </li>)}</ul>
      </div>
    </div>
  </article>;
}

export function GardenPage() {
  const { data, error } = useGarden();
  return <section className="section-shell py-12">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-semibold">Minhas plantas</h1><Link className="font-semibold underline" to="/plantas">Adicionar do catálogo</Link></div>
    <p className="mt-3 text-sm text-primary/70">Coleção salva neste navegador, sem sincronização entre dispositivos.</p>
    {error && <p role="alert" className="mt-6 text-red-700">{error}</p>}
    {!error && !data.plants.length && <p className="my-8">Sua coleção está vazia.</p>}
    {data.plants.map(entry => <GardenPlant key={entry.id} entry={entry} />)}
  </section>;
}
