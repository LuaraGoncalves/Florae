import { useSyncExternalStore } from "react";
import { z } from "zod";

const plantSchema = z.object({ id: z.string(), slug: z.string(), name: z.string(), scientificName: z.string(), imageUrl: z.string() });
const careSchema = z.object({ id: z.string(), type: z.enum(["Rega", "Adubação", "Poda", "Outro"]), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: z.string().max(1000) });
const entrySchema = z.object({ id: z.string(), plant: plantSchema, nickname: z.string().min(1).max(100), location: z.string().max(100), records: z.array(careSchema) });
const schema = z.object({ version: z.literal(1), favorites: z.array(plantSchema), plants: z.array(entrySchema) });
export type SavedPlant = z.infer<typeof plantSchema>;
export type GardenEntry = z.infer<typeof entrySchema>;
export type CareRecord = z.infer<typeof careSchema>;
type Data = z.infer<typeof schema>;
const key = "florae:garden:v1";
const empty = (): Data => ({ version: 1, favorites: [], plants: [] });
function read(): { data: Data; error: string } {
  try { const raw = localStorage.getItem(key); return { data: raw ? schema.parse(JSON.parse(raw)) : empty(), error: "" }; }
  catch { return { data: empty(), error: "Não foi possível ler sua coleção neste navegador. Os dados existentes foram preservados." }; }
}
let snapshot = read();
const listeners = new Set<() => void>();
function emit() { listeners.forEach(listener => listener()); }
window.addEventListener("storage", event => { if (event.key === key || event.key === null) { snapshot = read(); emit(); } });
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function useGarden() { return useSyncExternalStore(subscribe, () => snapshot); }
function change(update: (data: Data) => Data) {
  const current = read();
  if (current.error) throw new Error(current.error);
  const next = schema.parse(update(current.data));
  try { localStorage.setItem(key, JSON.stringify(next)); }
  catch { throw new Error("Não foi possível salvar. Verifique o espaço e as permissões do navegador."); }
  snapshot = { data: next, error: "" }; emit();
}
export const garden = {
  toggleFavorite(plant: SavedPlant) { change(data => ({ ...data, favorites: data.favorites.some(item => item.id === plant.id) ? data.favorites.filter(item => item.id !== plant.id) : [...data.favorites, plantSchema.parse(plant)] })); },
  addPlant(plant: SavedPlant) { change(data => ({ ...data, plants: [...data.plants, { id: crypto.randomUUID(), plant: plantSchema.parse(plant), nickname: plant.name, location: "", records: [] }] })); },
  updatePlant(id: string, nickname: string, location: string) { change(data => ({ ...data, plants: data.plants.map(item => item.id === id ? { ...item, nickname: nickname.trim(), location: location.trim() } : item) })); },
  removePlant(id: string) { change(data => ({ ...data, plants: data.plants.filter(item => item.id !== id) })); },
  addRecord(id: string, record: Omit<CareRecord, "id">) { change(data => ({ ...data, plants: data.plants.map(item => item.id === id ? { ...item, records: [{ ...record, id: crypto.randomUUID() }, ...item.records] } : item) })); },
  removeRecord(id: string, recordId: string) { change(data => ({ ...data, plants: data.plants.map(item => item.id === id ? { ...item, records: item.records.filter(record => record.id !== recordId) } : item) })); }
};
