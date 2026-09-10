CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

CREATE TABLE "Plant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "scientificName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "light" TEXT NOT NULL,
  "watering" TEXT NOT NULL,
  "temperature" TEXT NOT NULL,
  "humidity" TEXT NOT NULL,
  "substrate" TEXT NOT NULL,
  "fertilizing" TEXT NOT NULL,
  "pruning" TEXT NOT NULL,
  "environment" TEXT NOT NULL,
  "tips" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Problem" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "causes" TEXT NOT NULL,
  "recommendation" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlantCategory" (
  "plantId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,

  CONSTRAINT "PlantCategory_pkey" PRIMARY KEY ("plantId", "categoryId")
);

CREATE TABLE "PlantProblem" (
  "plantId" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,

  CONSTRAINT "PlantProblem_pkey" PRIMARY KEY ("plantId", "problemId")
);

CREATE UNIQUE INDEX "Plant_slug_key" ON "Plant"("slug");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Problem_name_key" ON "Problem"("name");
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

ALTER TABLE "PlantCategory"
ADD CONSTRAINT "PlantCategory_plantId_fkey"
FOREIGN KEY ("plantId") REFERENCES "Plant"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlantCategory"
ADD CONSTRAINT "PlantCategory_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlantProblem"
ADD CONSTRAINT "PlantProblem_plantId_fkey"
FOREIGN KEY ("plantId") REFERENCES "Plant"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlantProblem"
ADD CONSTRAINT "PlantProblem_problemId_fkey"
FOREIGN KEY ("problemId") REFERENCES "Problem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
