import { Droplets, SunMedium } from "lucide-react";
import { Link } from "react-router-dom";
import { difficultyLabels } from "../lib/utils";
import type { Plant } from "../types";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { PlantActions } from "./PlantActions";
import { PlantImage } from "./PlantImage";

export function PlantCard({ plant }: { plant: Plant }) {
  return (
    <div className="group min-w-0">
      <Card className="h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(20,54,29,0.20)]">
        <Link to={`/plantas/${plant.slug}`}>
        <div className="aspect-[4/3] overflow-hidden bg-mint">
          <PlantImage className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={plant.imageUrl} alt={plant.name} />
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">{plant.name}</h3>
              <p className="mt-1 text-sm italic text-primary/60">{plant.scientificName}</p>
            </div>
            <Badge>{difficultyLabels[plant.difficulty]}</Badge>
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-primary/70">{plant.description}</p>
          <div className="grid gap-2 text-sm text-primary/70">
            <span className="flex items-center gap-2">
              <SunMedium className="h-4 w-4 text-clay" />
              {plant.light}
            </span>
            <span className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-leaf" />
              {plant.watering}
            </span>
          </div>
        </div>
        </Link>
        <div className="px-5 pb-5"><PlantActions plant={plant} /></div>
      </Card>
    </div>
  );
}
