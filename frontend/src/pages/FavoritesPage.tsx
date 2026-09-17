import { Link } from "react-router-dom";
import { useGarden } from "../services/garden";
import { PlantImage } from "../components/PlantImage";
import { PlantActions } from "../components/PlantActions";

export function FavoritesPage() {
  const { data, error } = useGarden();
  return <section className="section-shell py-12">
    <h1 className="text-3xl font-semibold">Favoritos</h1>
    <p className="mt-3 text-sm text-primary/70">Salvos neste navegador.</p>
    {error && <p role="alert" className="mt-6 text-red-700">{error}</p>}
    {!error && !data.favorites.length && <p className="my-8">Nenhuma planta favorita ainda. <Link className="underline" to="/plantas">Explorar catálogo</Link></p>}
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.favorites.map(plant => <article key={plant.id} className="overflow-hidden rounded-lg border border-border bg-white">
        <Link to={`/plantas/${plant.slug}`}><PlantImage src={plant.imageUrl} alt={plant.name} className="aspect-[4/3] w-full object-cover" /></Link>
        <div className="p-5"><Link to={`/plantas/${plant.slug}`}><h2 className="break-words text-xl font-semibold">{plant.name}</h2></Link><p className="text-sm italic">{plant.scientificName}</p><PlantActions plant={plant} /></div>
      </article>)}
    </div>
  </section>;
}
