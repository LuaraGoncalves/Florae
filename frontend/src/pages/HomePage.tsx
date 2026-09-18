import { ArrowRight, CheckCircle2, Droplets, Leaf, Search, ShoppingBag, Sparkles, SunMedium } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlantCard } from "../components/PlantCard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { LoadError } from "../components/LoadError";

export function HomePage() {
  const navigate = useNavigate();
  const { data: plants, error, loading } = useAsync(() => api.listPlants(), []);
  const featured = plants?.slice(0, 3) ?? [];

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const search = String(form.get("search") ?? "").trim();
    navigate(search ? `/plantas?search=${encodeURIComponent(search)}` : "/plantas");
  }

  return (
    <>
      <section className="bg-primary text-cream">
        <div className="section-shell grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-moss">plant care journal</p>
            <h1 className="font-display text-7xl leading-none text-moss sm:text-8xl lg:text-[9rem]">Florae</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cream/75">
              Uma plataforma elegante para pesquisar plantas, entender sinais comuns e cuidar melhor de cada espécie.
            </p>
            <form onSubmit={handleSearch} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <Input name="search" placeholder="Pesquise por Jiboia, Zamioculca..." className="bg-cream text-primary" />
              <Button type="submit">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </form>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="ghost" onClick={() => navigate("/plantas")}>
                Ver plantas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative min-h-[430px]">
            <div className="absolute inset-x-8 bottom-0 h-72 rounded-full bg-leaf/60 blur-3xl" />
            <img
              className="relative mx-auto h-[520px] w-full max-w-[560px] object-contain drop-shadow-[0_24px_42px_rgba(0,0,0,0.45)]"
              src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80"
              alt="Costela-de-adão"
            />
            <Card className="absolute bottom-8 right-0 max-w-xs border-moss/20 bg-cream/90 p-5 text-primary backdrop-blur">
              <p className="text-sm leading-6">
                A Costela-de-adão gosta de luz indireta, substrato aerado e regas moderadas quando a terra começa a secar.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-leaf py-20 text-cream">
        <div className="section-shell">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-6xl text-moss sm:text-7xl">Store</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-cream/70">Categorias rápidas para encontrar a planta certa para sua casa e rotina.</p>
            </div>
            <Link to="/plantas">
              <Button variant="outline">
                <ShoppingBag className="h-4 w-4" />
                Ir para plantas
              </Button>
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map(([title, text, Icon, slug]) => (
              <Link key={title} to={`/plantas?${slug}`}>
                <div className="grid aspect-square place-items-center rounded-full bg-moss/20 p-7 text-center transition hover:bg-moss/35">
                  <Icon className="mb-4 h-10 w-10 text-moss" />
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-cream/70">{text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-leaf">em destaque</p>
              <h2 className="mt-2 text-4xl font-semibold">Plantas para começar</h2>
            </div>
            <Link to="/plantas" className="hidden text-sm font-semibold text-leaf hover:text-primary sm:inline-flex">
              Ver catálogo
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {error && <LoadError message={error} />}
            {loading && <p>Carregando plantas...</p>}
            {featured.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-cream">
        <div className="section-shell grid gap-5 md:grid-cols-3">
          {[
            ["Cuidados claros", "Luz, rega, temperatura, umidade e substrato organizados em uma única página."],
            ["Diagnóstico simples", "Problemas como folhas amarelas e pontas marrons com causas e recomendações."],
            ["Encontre sua planta", "Explore o catálogo por nome, categoria e nível de cuidado."]
          ].map(([title, text]) => (
            <Card key={title} className="border-moss/20 bg-cream/10 p-6 text-cream">
              <Sparkles className="mb-6 h-6 w-6 text-moss" />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-cream/70">{text}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
  const categoryCards: Array<[string, string, LucideIcon, string]> = [
    ["Interior", "Plantas para sala e escritório", Leaf, "environment=interior"],
    ["Fáceis", "Comece sem medo", CheckCircle2, "difficulty=EASY"],
    ["Meia-sombra", "Luz suave e filtrada", SunMedium, "light=meia-sombra"],
    ["Umidade", "Banheiros claros e cantos úmidos", Droplets, "humidity=alta"]
  ];
