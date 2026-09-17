import { ImageOff } from "lucide-react";
import { useState } from "react";

export function PlantImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <div role="img" aria-label={`${alt}: sem foto`} className={`flex items-center justify-center bg-mint text-leaf ${className}`}><ImageOff aria-hidden="true" className="h-8 w-8" /></div>;
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(src)} />;
}
