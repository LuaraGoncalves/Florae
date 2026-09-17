import type { Category, Plant, PlantPayload, Problem } from "../types";

const API_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");
let token: string | null = null;
export function clearSession() { token = null; }
export function hasSession() { return token !== null; }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    signal: AbortSignal.timeout(options?.body instanceof FormData ? 60000 : 15000),
    headers: { ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers }
  }).catch(() => { throw new Error("Nao foi possivel conectar. Tente novamente em instantes."); });

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
      window.dispatchEvent(new Event("florae:session-expired"));
    }
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Nao foi possivel carregar os dados.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  imageStatus: () => request<{ enabled: boolean }>("/imagens/status"),
  uploadImage(file: File) {
    const body = new FormData();
    body.append("image", file);
    return request<{ imageUrl: string }>("/imagens", { method: "POST", body });
  },
  async login(email: string, password: string) {
    const result = await request<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    token = result.token;
  },
  async listPlants(params?: { search?: string; category?: string; difficulty?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.difficulty) query.set("difficulty", params.difficulty);

    return request<Plant[]>(`/plantas${query.size ? `?${query}` : ""}`);
  },
  async getPlant(id: string) {
    return request<Plant>(`/plantas/${encodeURIComponent(id)}`);
  },
  createPlant: (payload: PlantPayload) => request<Plant>("/plantas", { method: "POST", body: JSON.stringify(payload) }),
  updatePlant: (id: string, payload: PlantPayload) => request<Plant>(`/plantas/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePlant: (id: string) => request<void>(`/plantas/${id}`, { method: "DELETE" }),
  async listCategories() {
    return request<Category[]>("/categorias");
  },
  createCategory: (payload: Omit<Category, "id">) => request<Category>("/categorias", { method: "POST", body: JSON.stringify(payload) }),
  updateCategory: (id: string, payload: Omit<Category, "id">) => request<Category>(`/categorias/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCategory: (id: string) => request<void>(`/categorias/${id}`, { method: "DELETE" }),
  async listProblems() {
    return request<Problem[]>("/problemas");
  },
  createProblem: (payload: Omit<Problem, "id">) => request<Problem>("/problemas", { method: "POST", body: JSON.stringify(payload) }),
  updateProblem: (id: string, payload: Omit<Problem, "id">) => request<Problem>(`/problemas/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProblem: (id: string) => request<void>(`/problemas/${id}`, { method: "DELETE" })
};
