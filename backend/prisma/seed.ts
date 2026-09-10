import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Interior", slug: "interior", description: "Plantas que se adaptam bem dentro de casa." },
  { name: "Fáceis", slug: "faceis", description: "Espécies indicadas para quem está começando." },
  { name: "Meia-sombra", slug: "meia-sombra", description: "Gostam de luz indireta e ambientes protegidos." },
  { name: "Umidade", slug: "umidade", description: "Preferem ar mais úmido e regas atentas." }
];

const problems = [
  {
    name: "Folhas amarelas",
    slug: "folhas-amarelas",
    description: "As folhas perdem o verde e ficam amareladas.",
    causes: "Excesso de água, pouca luz ou falta de nutrientes.",
    recommendation: "Confira se o vaso drena bem, reduza a rega e aproxime a planta da luz indireta."
  },
  {
    name: "Folhas murchas",
    slug: "folhas-murchas",
    description: "A planta perde firmeza e parece caída.",
    causes: "Falta de água, calor intenso ou raízes comprometidas.",
    recommendation: "Toque o substrato antes de regar e observe se a planta melhora nas próximas horas."
  },
  {
    name: "Pontas marrons",
    slug: "pontas-marrons",
    description: "As pontas das folhas secam e escurecem.",
    causes: "Ar seco, sol direto, excesso de adubo ou acúmulo de sais.",
    recommendation: "Aumente a umidade, evite sol forte e lave o substrato com água filtrada ocasionalmente."
  }
];

const plants = [
  {
    name: "Costela-de-adão",
    scientificName: "Monstera deliciosa",
    slug: "costela-de-adao",
    description: "Folhagem tropical elegante, famosa pelos recortes naturais nas folhas adultas.",
    imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80",
    difficulty: Difficulty.EASY,
    light: "Luz indireta intensa, sem sol direto nas horas mais quentes.",
    watering: "Regue quando os primeiros centímetros do substrato estiverem secos.",
    temperature: "18°C a 29°C",
    humidity: "Média a alta",
    substrate: "Leve, aerado e rico em matéria orgânica.",
    fertilizing: "Adube mensalmente na primavera e no verão.",
    pruning: "Remova folhas secas e conduza caules longos com tutor.",
    environment: "Sala, varanda protegida ou escritório iluminado.",
    tips: ["Gire o vaso a cada semana.", "Use tutor de fibra para folhas maiores.", "Limpe as folhas com pano úmido."],
    categorySlugs: ["interior", "faceis", "meia-sombra"],
    problemSlugs: ["folhas-amarelas", "pontas-marrons"]
  },
  {
    name: "Jiboia",
    scientificName: "Epipremnum aureum",
    slug: "jiboia",
    description: "Trepadeira resistente, versátil e perfeita para prateleiras, vasos suspensos e ambientes internos.",
    imageUrl: "https://images.unsplash.com/photo-1600411833114-5e4e7bf0f408?auto=format&fit=crop&w=1200&q=80",
    difficulty: Difficulty.EASY,
    light: "Meia-sombra ou luz indireta.",
    watering: "Uma a duas vezes por semana, conforme a umidade do substrato.",
    temperature: "17°C a 30°C",
    humidity: "Média",
    substrate: "Solto e com boa drenagem.",
    fertilizing: "Adubo equilibrado a cada 45 dias nos meses quentes.",
    pruning: "Pode as pontas para estimular brotações laterais.",
    environment: "Ambientes internos, banheiros claros e cozinhas.",
    tips: ["Evite encharcar.", "Faça mudas por estacas na água.", "Proteja de vento frio."],
    categorySlugs: ["interior", "faceis", "meia-sombra"],
    problemSlugs: ["folhas-amarelas", "folhas-murchas"]
  },
  {
    name: "Zamioculca",
    scientificName: "Zamioculcas zamiifolia",
    slug: "zamioculca",
    description: "Planta robusta, brilhante e muito tolerante a períodos de pouca rega.",
    imageUrl: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=1200&q=80",
    difficulty: Difficulty.EASY,
    light: "Pouca luz a luz indireta média.",
    watering: "Regas espaçadas, apenas quando o substrato secar bem.",
    temperature: "18°C a 28°C",
    humidity: "Baixa a média",
    substrate: "Bem drenável, com areia ou perlita.",
    fertilizing: "Adubação leve a cada dois meses.",
    pruning: "Retire hastes amareladas pela base.",
    environment: "Corredores claros, escritórios e salas.",
    tips: ["Prefira menos água.", "Não deixe prato acumulando água.", "Mantenha fora do alcance de pets."],
    categorySlugs: ["interior", "faceis"],
    problemSlugs: ["folhas-amarelas", "folhas-murchas"]
  },
  {
    name: "Lírio-da-paz",
    scientificName: "Spathiphyllum wallisii",
    slug: "lirio-da-paz",
    description: "Espécie clássica de interior, com folhas verdes e flores brancas delicadas.",
    imageUrl: "https://images.unsplash.com/photo-1597055181449-531c075e1dc5?auto=format&fit=crop&w=1200&q=80",
    difficulty: Difficulty.MEDIUM,
    light: "Luz indireta média a intensa.",
    watering: "Mantenha o substrato levemente úmido, sem encharcar.",
    temperature: "18°C a 27°C",
    humidity: "Alta",
    substrate: "Rico em matéria orgânica e com boa drenagem.",
    fertilizing: "Adube a cada 30 dias na fase de crescimento.",
    pruning: "Corte flores secas e folhas danificadas.",
    environment: "Ambientes internos claros e protegidos.",
    tips: ["Borrife água em dias secos.", "Evite ar-condicionado direto.", "Floresce melhor com boa luminosidade."],
    categorySlugs: ["interior", "umidade", "meia-sombra"],
    problemSlugs: ["folhas-murchas", "pontas-marrons"]
  }
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: problem,
      create: problem
    });
  }

  for (const plant of plants) {
    const { categorySlugs, problemSlugs, ...plantData } = plant;
    const savedPlant = await prisma.plant.upsert({
      where: { slug: plant.slug },
      update: plantData,
      create: plantData
    });

    await prisma.plantCategory.deleteMany({ where: { plantId: savedPlant.id } });
    await prisma.plantProblem.deleteMany({ where: { plantId: savedPlant.id } });

    for (const slug of categorySlugs) {
      const category = await prisma.category.findUniqueOrThrow({ where: { slug } });
      await prisma.plantCategory.create({ data: { plantId: savedPlant.id, categoryId: category.id } });
    }

    for (const slug of problemSlugs) {
      const problem = await prisma.problem.findUniqueOrThrow({ where: { slug } });
      await prisma.plantProblem.create({ data: { plantId: savedPlant.id, problemId: problem.id } });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
