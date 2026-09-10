import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import { AdminAccess } from "../components/AdminAccess";
import { HomePage } from "../pages/HomePage";
import { PlantDetailPage } from "../pages/PlantDetailPage";
import { PlantsPage } from "../pages/PlantsPage";
import { ProblemsPage } from "../pages/ProblemsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "plantas", element: <PlantsPage /> },
      { path: "plantas/:id", element: <PlantDetailPage /> },
      { path: "problemas", element: <ProblemsPage /> },
      { path: "admin", element: <AdminAccess /> }
    ]
  }
]);
