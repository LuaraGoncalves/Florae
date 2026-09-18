import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="section-shell py-16">
      <h1 className="text-3xl font-semibold">Página não encontrada</h1>
      <p className="mt-4 max-w-xl text-primary/70">Este endereço não existe ou não está mais disponível.</p>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <Link to="/plantas" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-cream hover:bg-leaf focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Voltar ao catálogo
        </Link>
        <Link to="/" className="text-sm underline underline-offset-4">Ir para o início</Link>
      </div>
    </section>
  );
}
