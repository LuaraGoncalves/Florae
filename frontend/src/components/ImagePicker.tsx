import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { PlantImage } from "./PlantImage";
import { Button } from "./ui/button";
import { api } from "../services/api";

export function ImagePicker({ value, file, onChange, disabled }: { value: string; file: File | null; onChange: (file: File | null, url: string) => void; disabled: boolean }) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { let active = true; api.imageStatus().then(result => { if (active) { setEnabled(result.enabled); if (!result.enabled) setError("Envio de fotos indisponível no momento."); } }).catch(() => { if (active) setError("Não foi possível verificar o envio de fotos."); }); return () => { active = false; }; }, []);
  useEffect(() => { if (!file) { setPreview(""); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  return <div className="grid min-w-0 gap-3">
    <span className="text-sm font-semibold">Foto</span>
    <PlantImage src={preview || value} alt="Foto selecionada" className="aspect-[4/3] w-full rounded-md object-cover" />
    <label className={`flex items-center gap-2 text-sm font-semibold ${disabled || !enabled ? "opacity-50" : "cursor-pointer"}`}>
      <Upload className="h-4 w-4" />Selecionar foto
      <input aria-label="Selecionar foto" className="min-w-0 w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || !enabled} onChange={event => {
        const selected = event.target.files?.[0]; event.target.value = "";
        if (!selected) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) || selected.size > 5 * 1024 * 1024) { setError("Selecione JPEG, PNG ou WebP de até 5 MB."); return; }
        setError(""); onChange(selected, value);
      }} />
    </label>
    {(file || value) && <Button type="button" variant="ghost" disabled={disabled} onClick={() => { setError(""); onChange(null, ""); }}><X className="h-4 w-4" />Remover foto</Button>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
