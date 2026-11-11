import { api } from "./client";
import type {
  AuthResponse,
  Category,
  HealthResponse,
  LanguageCode,
  ModuleStatus,
  Role,
  Story,
  StoryInput,
  StoryList,
  User,
  ValidationStatus,
} from "../types";

export function login(email: string, password: string) {
  return api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload: {
  email: string;
  password: string;
  full_name: string;
  preferred_language: LanguageCode;
}) {
  return api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMe() {
  return api<User>("/api/auth/me");
}

export function fetchHealth() {
  return api<HealthResponse>("/api/health");
}

export function fetchCategories() {
  return api<Category[]>("/api/categories");
}

export function createCategory(payload: Omit<Category, "id" | "created_at">) {
  return api<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchStories(params: {
  mine?: boolean;
  categoryId?: string;
  status?: string;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params.mine) query.set("mine", "true");
  if (params.categoryId) query.set("category_id", params.categoryId);
  if (params.status) query.set("validation_status", params.status);
  if (params.offset) query.set("offset", String(params.offset));
  const suffix = query.toString();
  return api<StoryList>(`/api/stories${suffix ? `?${suffix}` : ""}`);
}

export function fetchStory(id: string) {
  return api<Story>(`/api/stories/${id}`);
}

export function createStory(payload: StoryInput) {
  return api<Story>("/api/stories", { method: "POST", body: JSON.stringify(payload) });
}

export function updateStory(id: string, payload: StoryInput) {
  return api<Story>(`/api/stories/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteStory(id: string) {
  return api<void>(`/api/stories/${id}`, { method: "DELETE" });
}

export function setValidation(id: string, validation_status: ValidationStatus) {
  return api<Story>(`/api/stories/${id}/validation`, {
    method: "PATCH",
    body: JSON.stringify({ validation_status }),
  });
}

export function addFavorite(id: string) {
  return api<Story>(`/api/stories/${id}/favorite`, { method: "POST" });
}

export function removeFavorite(id: string) {
  return api<void>(`/api/stories/${id}/favorite`, { method: "DELETE" });
}

export function fetchFavorites() {
  return api<StoryList>("/api/me/favorites");
}

export function fetchModuleStatus() {
  return api<ModuleStatus>("/api/modules/status");
}

export function updateUserRole(userId: string, role: Role) {
  return api<User>(`/api/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
