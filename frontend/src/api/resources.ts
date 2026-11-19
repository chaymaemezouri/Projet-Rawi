import { ApiError, TOKEN_KEY, api } from "./client";
import type {
  AuthResponse,
  Category,
  HealthResponse,
  LanguageCode,
  ModuleStatus,
  Role,
  CorrectionRequest,
  Story,
  Comparison,
  ReviewDossier,
  ReviewQueue,
  RecipeSheet,
  GuideView,
  StoryAnalysis,
  StoryInput,
  StoryList,
  SimilarStory,
  StoryMedia,
  StoryRevision,
  SpaceItem,
  SpaceNote,
  SpaceNotice,
  SpaceSummary,
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

export function fetchSpaceSummary() {
  return api<SpaceSummary>("/api/me/summary");
}

export function updateProfile(fullName: string, preferredLanguage: LanguageCode) {
  return api<User>("/api/me", { method: "PATCH", body: JSON.stringify({ full_name: fullName, preferred_language: preferredLanguage }) });
}

export function fetchLibrary(params: { q?: string; kind?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.kind) query.set("kind", params.kind);
  if (params.status) query.set("status", params.status);
  const suffix = query.toString();
  return api<{ items: SpaceItem[] }>(`/api/me/library${suffix ? `?${suffix}` : ""}`);
}

export function fetchHistory(q = "") {
  return api<{ items: SpaceItem[] }>(`/api/me/history${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}

export function fetchNotifications() {
  return api<{ items: SpaceNotice[] }>("/api/me/notifications");
}

export function markNotificationRead(key: string) {
  return api<{ items: SpaceNotice[] }>("/api/me/notifications/read", { method: "POST", body: JSON.stringify({ key }) });
}

export function fetchNotes() {
  return api<{ items: SpaceNote[] }>("/api/me/notes");
}

export function saveNote(recipeId: string, body: string) {
  return api<{ items: SpaceNote[] }>(`/api/me/notes/${recipeId}`, { method: "PUT", body: JSON.stringify({ body }) });
}

export function fetchConsents() {
  return api<{ items: { id: string; title: string; consent: boolean; publish_authorized: boolean; workflow: string; href: string }[] }>("/api/me/consents");
}

export function requestDeletion(scope: string, reason: string, storyId?: string) {
  return api<{ id: string; scope: string; kept: boolean }>("/api/me/deletion-requests", {
    method: "POST",
    body: JSON.stringify({ scope, reason, story_id: storyId ?? null }),
  });
}

export function exportAccount() {
  return api<Record<string, unknown>>("/api/me/export");
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
  language?: string;
  q?: string;
  origin?: string;
  source?: string;
  collectedFrom?: string;
  collectedTo?: string;
  hasAudio?: boolean;
  hasDocument?: boolean;
  sort?: string;
  offset?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.mine) query.set("mine", "true");
  if (params.categoryId) query.set("category_id", params.categoryId);
  if (params.status) query.set("validation_status", params.status);
  if (params.language) query.set("language", params.language);
  if (params.q) query.set("q", params.q);
  if (params.origin) query.set("origin", params.origin);
  if (params.source) query.set("source", params.source);
  if (params.collectedFrom) query.set("collected_from", params.collectedFrom);
  if (params.collectedTo) query.set("collected_to", params.collectedTo);
  if (params.hasAudio) query.set("has_audio", "true");
  if (params.hasDocument) query.set("has_document", "true");
  if (params.sort) query.set("sort", params.sort);
  if (params.offset) query.set("offset", String(params.offset));
  if (params.limit) query.set("limit", String(params.limit));
  const suffix = query.toString();
  return api<StoryList>(`/api/stories${suffix ? `?${suffix}` : ""}`);
}

export function fetchSimilar(storyId: string) {
  return api<SimilarStory[]>(`/api/stories/${storyId}/similar`);
}

export async function fetchCover(storyId: string) {
  const headers = new Headers();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`/api/stories/${storyId}/cover`, { headers });
  if (!response.ok) throw new ApiError(response.status, "Image inaccessible.");
  return response.blob();
}

export function fetchAnalysis(id: string) {
  return api<StoryAnalysis>(`/api/stories/${id}/analysis`);
}

export function runAnalysis(id: string) {
  return api<StoryAnalysis>(`/api/stories/${id}/analysis`, { method: "POST" });
}

export function correctAnalysis(id: string, payload: { target_id: string; action: string; replacement?: string; note: string }) {
  return api<StoryAnalysis>(`/api/stories/${id}/analysis/corrections`, { method: "POST", body: JSON.stringify(payload) });
}

export function compareStories(storyIds: string[]) {
  return api<Comparison>("/api/comparisons", {
    method: "POST",
    body: JSON.stringify({ story_ids: storyIds }),
  });
}

export function fetchReviewQueue(validationStatus = "") {
  const suffix = validationStatus ? `?validation_status=${validationStatus}` : "";
  return api<ReviewQueue>(`/api/reviews/queue${suffix}`);
}

export function fetchReviewDossier(id: string) {
  return api<ReviewDossier>(`/api/reviews/${id}`);
}

export function submitReview(id: string, decision: string, comment: string) {
  return api<ReviewDossier>(`/api/reviews/${id}`, {
    method: "POST",
    body: JSON.stringify({ decision, comment }),
  });
}

export function fetchRecipes(mine = false) {
  return api<{ items: { id: string; title: string; status: string; stale: boolean; category_slug: string | null; version: number }[]; notice: string }>(
    `/api/recipes${mine ? "?mine=true" : ""}`,
  );
}

export function createRecipe(title: string, storyIds: string[]) {
  return api<RecipeSheet>("/api/recipes", { method: "POST", body: JSON.stringify({ title, story_ids: storyIds }) });
}

export function fetchRecipe(id: string) {
  return api<RecipeSheet>(`/api/recipes/${id}`);
}

export function fetchRecipeRevisions(id: string) {
  return api<{ version: number; reason: string; title: string; status: string }[]>(`/api/recipes/${id}/revisions`);
}

export function correctRecipe(id: string, field: string, replacement: string, note: string) {
  return api<RecipeSheet>(`/api/recipes/${id}/corrections`, { method: "POST", body: JSON.stringify({ field, replacement, note }) });
}

export function publishRecipe(id: string) {
  return api<RecipeSheet>(`/api/recipes/${id}/publication`, { method: "POST" });
}

export async function exportRecipe(id: string) {
  const headers = new Headers();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`/api/recipes/${id}/export`, { headers });
  if (!response.ok) throw new ApiError(response.status, "Export impossible.");
  return response.blob();
}

export function fetchGuides() {
  return api<{ items: { recipe_id: string; title: string; status: string; stale: boolean; safety: string; practical_allowed: boolean }[]; notice: string }>("/api/guides");
}

export function fetchGuide(id: string) {
  return api<GuideView>(`/api/guides/${id}`);
}

export function startGuide(id: string, version: number) {
  return api<GuideView>(`/api/guides/${id}/start`, { method: "POST", body: JSON.stringify({ version }) });
}

export function reviewGuideSafety(id: string, decision: string, note: string) {
  return api<GuideView>(`/api/guides/${id}/safety`, { method: "POST", body: JSON.stringify({ decision, note }) });
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

export function fetchStoryMedia(storyId: string) {
  return api<StoryMedia[]>(`/api/stories/${storyId}/media`);
}

export function uploadStoryMedia(
  storyId: string,
  file: Blob,
  filename: string,
  onProgress?: (value: number) => void,
) {
  return new Promise<StoryMedia>((resolve, reject) => {
    const body = new FormData();
    body.append("file", file, filename);
    body.append("consent_to_retain", "true");
    const request = new XMLHttpRequest();
    request.open("POST", `/api/stories/${storyId}/media`);
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      let parsed: { detail?: unknown } | null = null;
      try {
        parsed = request.responseText ? (JSON.parse(request.responseText) as { detail?: unknown }) : null;
      } catch {
        parsed = null;
      }
      if (request.status >= 200 && request.status < 300) {
        resolve(parsed as StoryMedia);
        return;
      }
      reject(new ApiError(request.status, parsed?.detail ?? request.statusText));
    };
    request.onerror = () => reject(new ApiError(0, "Le transfert a été interrompu."));
    request.send(body);
  });
}

export async function fetchMediaBlob(storyId: string, mediaId: string) {
  const headers = new Headers();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`/api/stories/${storyId}/media/${mediaId}/file`, { headers });
  if (!response.ok) {
    throw new ApiError(response.status, "Fichier inaccessible.");
  }
  return response.blob();
}

export function deleteStoryMedia(storyId: string, mediaId: string) {
  return api<void>(`/api/stories/${storyId}/media/${mediaId}`, { method: "DELETE" });
}

export function transcribeMedia(storyId: string, mediaId: string) {
  return api<StoryMedia>(`/api/stories/${storyId}/media/${mediaId}/transcription`, { method: "POST" });
}

export function correctTranscript(storyId: string, mediaId: string, corrected_text: string) {
  return api<StoryMedia>(`/api/stories/${storyId}/media/${mediaId}/transcription`, {
    method: "PATCH",
    body: JSON.stringify({ corrected_text }),
  });
}

export function extractDocument(storyId: string, mediaId: string, manuscript: boolean) {
  return api<StoryMedia>(`/api/stories/${storyId}/media/${mediaId}/extraction`, {
    method: "POST",
    body: JSON.stringify({ manuscript }),
  });
}

export function correctExtraction(storyId: string, mediaId: string, corrected_text: string) {
  return api<StoryMedia>(`/api/stories/${storyId}/media/${mediaId}/extraction`, {
    method: "PATCH",
    body: JSON.stringify({ corrected_text }),
  });
}

export function fetchCorrections(storyId: string) {
  return api<CorrectionRequest[]>(`/api/stories/${storyId}/corrections`);
}

export function requestCorrection(storyId: string, comment: string) {
  return api<Story>(`/api/stories/${storyId}/corrections`, {
    method: "POST",
    body: JSON.stringify({ comment }),
  });
}

export function fetchRevisions(storyId: string) {
  return api<StoryRevision[]>(`/api/stories/${storyId}/revisions`);
}

export function fetchMyCorrections() {
  return api<CorrectionRequest[]>("/api/me/corrections");
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

export function fetchAdminSummary() {
  return api<Record<string, number>>("/api/admin/summary");
}

export function fetchAdminUsers(q = "") {
  return api<{ items: { id: string; email: string; full_name: string; role: Role; is_active: boolean }[] }>(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}

export function setAdminRole(userId: string, role: Role) {
  return api<{ id: string; role: Role; is_active: boolean }>(`/api/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
}

export function setAdminActive(userId: string, active: boolean) {
  return api<{ id: string; role: Role; is_active: boolean }>(`/api/admin/users/${userId}/active`, { method: "PATCH", body: JSON.stringify({ active }) });
}

export function fetchAdminValidators() {
  return api<{ items: { id: string; full_name: string; email: string; is_active: boolean; decisions: number; latest: string }[] }>("/api/admin/validators");
}

export function fetchAdminCategories() {
  return api<{ items: { id: string; slug: string; name_fr: string; name_ar: string; name_ary: string; is_active: boolean; stories: number }[] }>("/api/admin/categories");
}

export function setAdminCategoryActive(categoryId: string, active: boolean) {
  return api(`/api/admin/categories/${categoryId}/active`, { method: "PATCH", body: JSON.stringify({ active }) });
}

export function fetchAdminModeration() {
  return api<{ corrections: { id: string; story_id: string; title: string; status: string }[]; pending: { id: string; title: string; validation_status: string; workflow: string }[]; deletions: { id: string; scope: string; status: string; reason: string }[] }>("/api/admin/moderation");
}

export function fetchAdminDeletions() {
  return api<{ items: { id: string; scope: string; status: string; reason: string; story_id: string | null }[]; policy: string }>("/api/admin/deletions");
}

export function reviewAdminDeletion(id: string, status: string) {
  return api<{ kept: boolean }>(`/api/admin/deletions/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function fetchAdminJournal() {
  return api<{ items: { id: string; kind: string; action: string; actor_id: string; target_id: string; detail: string; at: string }[] }>("/api/admin/journal");
}

export async function downloadAdminExport(format: string, kind: string) {
  const headers = new Headers();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`/api/admin/export?format=${format}&kind=${kind}`, { headers });
  if (!response.ok) throw new ApiError(response.status, "Export impossible.");
  return response.blob();
}
