import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { garden, useGarden, type SavedPlant } from "../services/garden";
import { Button } from "./ui/button";

export function PlantActions({ plant }: { plant: SavedPlant }) {
  const { data } = useGarden();
  const [message, setMessage] = useState("");
  const favorite = data.favorites.some(item => item.id === plant.id);
  function act(action: () => void, success: string) { try { action(); setMessage(success); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar."); } }
  return <div className="mt-4 text-primary">
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="dark" size="icon" aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} title={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={favorite} onClick={() => act(() => garden.toggleFavorite(plant), favorite ? "Favorito removido." : "Favorito salvo.")}><Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} /></Button>
      <Button type="button" variant="dark" onClick={() => act(() => garden.addPlant(plant), "Adicionada em Minhas plantas.")}><Plus className="h-4 w-4" />Minha coleção</Button>
    </div>
    <p role="status" className="mt-2 min-h-5 text-sm text-inherit">{message}</p>
  </div>;
}
