import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";
import { LoadError } from "../components/LoadError";

export function ProblemsPage() {
  const { data: problems, loading, error } = useAsync(() => api.listProblems(), []);
  const { data: plants, error: plantError } = useAsync(() => api.listPlants(), []);

  return (
    <section className="section-shell py-14">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-leaf">diagnóstico</p>
        <h1 className="mt-3 text-5xl font-semibold">O que está acontecendo com sua planta?</h1>
        <p className="mt-4 leading-7 text-primary/70">Escolha um sinal e veja causas prováveis, cuidados e plantas relacionadas.</p>
      </div>

      {error || plantError ? <LoadError message={error || plantError!} /> : loading ? (
        <p className="text-primary/70">Carregando problemas...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {problems?.map((problem) => {
            const related = plants?.filter((plant) => plant.problems.some((item) => item.problem.id === problem.id || item.problem.slug === problem.slug)) ?? [];
            return (
              <Card key={problem.id} className="p-6">
                <AlertTriangle className="mb-5 h-7 w-7 text-clay" />
                <h2 className="text-2xl font-semibold">{problem.name}</h2>
                <p className="mt-3 text-sm leading-6 text-primary/70">{problem.description}</p>
                <div className="mt-5 space-y-3 rounded-lg bg-moss/30 p-4 text-sm">
                  <p>
                    <strong>Possíveis causas:</strong> {problem.causes}
                  </p>
                  <p>
                    <strong>Recomendação:</strong> {problem.recommendation}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {related.map((plant) => (
                    <Link key={plant.id} to={`/plantas/${plant.slug}`}>
                      <Badge className="gap-1">
                        {plant.name}
                        <ArrowRight className="h-3 w-3" />
                      </Badge>
                    </Link>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
