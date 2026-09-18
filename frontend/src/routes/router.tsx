import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import { AdminAccess } from "../components/AdminAccess";
import { HomePage } from "../pages/HomePage";
import { PlantDetailPage } from "../pages/PlantDetailPage";
import { PlantsPage } from "../pages/PlantsPage";
import { ProblemsPage } from "../pages/ProblemsPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { GardenPage } from "../pages/GardenPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "plantas", element: <PlantsPage /> },
      { path: "plantas/:id", element: <PlantDetailPage /> },
      { path: "problemas", element: <ProblemsPage /> },
      { path: "admin", element: <AdminAccess /> },
      { path: "favoritos", element: <FavoritesPage /> },
      { path: "minhas-plantas", element: <GardenPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
