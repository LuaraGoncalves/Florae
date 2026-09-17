import { Droplets, Leaf, Scissors, Sprout, SunMedium, Thermometer, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAsync } from "../hooks/useAsync";
import { difficultyLabels } from "../lib/utils";
import { api } from "../services/api";
import { LoadError } from "../components/LoadError";
import { PlantImage } from "../components/PlantImage";
import { PlantActions } from "../components/PlantActions";

export function PlantDetailPage() {
  const { id = "" } = useParams();
  const { data: plant, loading, error } = useAsync(() => api.getPlant(id), [id]);
  if (error) return <section className="section-shell py-16"><LoadError message={error} /></section>;

  if (loading) {
    return <section className="section-shell py-16 text-primary/70">Carregando detalhes...</section>;
  }

  if (!plant) {
    return (
      <section className="section-shell py-16">
        <Card className="p-10 text-center">
          <h1 className="text-3xl font-semibold">Planta não encontrada</h1>
          <Link to="/plantas" className="mt-6 inline-flex">
            <Button variant="dark">Voltar ao catálogo</Button>
          </Link>
        </Card>
      </section>
    );
  }

  const care: Array<[string, string, LucideIcon]> = [
    ["Iluminação", plant.light, SunMedium],
    ["Rega", plant.watering, Droplets],
    ["Temperatura", plant.temperature, Thermometer],
    ["Umidade", plant.humidity, Waves],
    ["Substrato", plant.substrate, Sprout],
    ["Adubação", plant.fertilizing, Leaf],
    ["Poda", plant.pruning, Scissors]
  ];

  return (
    <>
      <section className="bg-primary text-cream">
        <div className="section-shell grid gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="overflow-hidden rounded-lg bg-leaf">
            <PlantImage className="aspect-[4/5] h-full w-full object-cover" src={plant.imageUrl} alt={plant.name} />
          </div>
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge>{difficultyLabels[plant.difficulty]}</Badge>
              {plant.categories.map(({ category }) => (
                <Badge key={category.id} className="bg-cream/15 text-cream">
                  {category.name}
                </Badge>
              ))}
            </div>
            <h1 className="font-display text-6xl leading-none text-moss sm:text-7xl">{plant.name}</h1>
            <p className="mt-3 text-lg italic text-cream/65">{plant.scientificName}</p>
            <div className="mt-5 rounded-md bg-cream p-4"><PlantActions plant={plant} /></div>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-cream/75">{plant.description}</p>
            <p className="mt-6 rounded-lg border border-moss/30 bg-cream/10 p-5 text-sm leading-6 text-cream/75">{plant.environment}</p>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <h2 className="text-4xl font-semibold">Cuidados</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {care.map(([title, text, Icon]) => (
            <Card key={String(title)} className="p-6">
              <Icon className="mb-5 h-7 w-7 text-leaf" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-primary/70">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-leaf py-16 text-cream">
        <div className="section-shell grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-semibold">Dicas saudáveis</h2>
            <div className="mt-6 grid gap-3">
              {plant.tips.map((tip) => (
                <div key={tip} className="rounded-lg border border-moss/20 bg-cream/10 p-4 text-sm text-cream/80">
                  {tip}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-semibold">Problemas comuns</h2>
            <div className="mt-6 grid gap-3">
              {plant.problems.map(({ problem }) => (
                <Card key={problem.id} className="bg-cream p-5 text-primary">
                  <h3 className="font-semibold">{problem.name}</h3>
                  <p className="mt-2 text-sm text-primary/70">{problem.description}</p>
                  <p className="mt-3 text-sm">
                    <strong>Causas:</strong> {problem.causes}
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Cuidado:</strong> {problem.recommendation}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
