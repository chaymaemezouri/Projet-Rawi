export type Role = "contributor" | "validator" | "admin";
export type LanguageCode = "fr" | "ar" | "ary";
export type NarratorRole =
  | "grandmother"
  | "achaba"
  | "hammam_practitioner"
  | "practitioner"
  | "other";
export type StorySource = "oral" | "written" | "digitized";
export type ValidationStatus = "pending" | "validated" | "rejected" | "correction_requested";
export type MediaKind = "audio" | "image" | "document";
export type EngineStatus = "pending" | "processing" | "unavailable" | "completed" | "failed";
export type WorkflowStatus = "draft" | "submitted";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  preferred_language: LanguageCode;
  is_active?: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  name_ary: string;
  description_fr: string;
  description_ar: string;
  description_ary: string;
  created_at: string;
}

export interface Story {
  id: string;
  title: string;
  narrator_name: string;
  narrator_role: NarratorRole;
  source: StorySource;
  language: LanguageCode;
  original_content: string;
  consent: boolean;
  origin_place: string | null;
  transmission_note: string | null;
  collected_on: string | null;
  mentioned_ingredients: string | null;
  publish_authorized: boolean;
  workflow_status: WorkflowStatus;
  validation_status: ValidationStatus;
  content_origin: "collected";
  category_id: string | null;
  category: Category | null;
  created_by: User;
  validated_by: User | null;
  validated_at: string | null;
  is_favorite: boolean;
  has_image: boolean;
  has_audio: boolean;
  has_document: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryList {
  items: Story[];
  total: number;
}

export interface StoryInput {
  title: string;
  narrator_name: string;
  narrator_role: NarratorRole;
  source: StorySource;
  language: LanguageCode;
  original_content: string;
  consent: boolean;
  category_id: string | null;
  origin_place?: string | null;
  transmission_note?: string | null;
  collected_on?: string | null;
  mentioned_ingredients?: string | null;
  publish_authorized?: boolean;
  workflow_status?: WorkflowStatus;
}

export interface TextEngine {
  id: string;
  engine: string | null;
  status: EngineStatus;
  raw_text: string | null;
  corrected_text: string | null;
  message: string;
  needs_strong_review: boolean;
}

export interface StoryMedia {
  id: string;
  story_id: string;
  kind: MediaKind;
  original_name: string;
  content_type: string;
  byte_size: number;
  consent_retained: boolean;
  created_at: string;
  transcript: TextEngine | null;
  extraction: TextEngine | null;
}

export interface CorrectionRequest {
  id: string;
  story_id: string;
  story_title: string;
  requested_by_id: string;
  comment: string;
  status: "open" | "answered";
  created_at: string;
  answered_at: string | null;
}

export interface StoryRevision {
  id: string;
  story_id: string;
  version_number: number;
  snapshot: { title?: string; original_content?: string };
  reason: string;
  created_by_name: string;
  created_at: string;
}

export interface SimilarReason {
  code: "category" | "ingredient" | "origin" | "term";
  detail: string | null;
}

export interface SimilarStory {
  story: Story;
  reasons: SimilarReason[];
}

export interface AnalysisSpan {
  id: string;
  surface?: string | null;
  canonical?: string;
  corrected?: string;
  unit_surface?: string | null;
  text?: string;
}

export interface StoryAnalysis {
  id: string;
  engine: string;
  engine_version: string;
  engine_kind: string;
  note: string;
  story_revision: number;
  created_at: string;
  classification: {
    status: "proposed" | "uncertain";
    category_slug: string | null;
    justification: string;
    passages: { text: string; start: number; end: number }[];
  };
  extractions: {
    ingredients: AnalysisSpan[];
    quantities: AnalysisSpan[];
    steps: AnalysisSpan[];
    durations: AnalysisSpan[];
    precautions: AnalysisSpan[];
  };
  corrections: { id: string; target_id: string; action: string; note: string; replacement: string | null }[];
}

export interface ComparisonPassage {
  id: string;
  title: string;
  revision: number;
  passage: string | null;
}

export interface Comparison {
  status: "compared" | "insufficient";
  reason: string | null;
  category_slug: string | null;
  notice?: string;
  sources: { id: string; title: string; revision: number; content_sha256: string; category_slug: string | null }[];
  indicators: Record<string, { value: string | null; detail: string }>;
  common: {
    ingredients: { canonical: string; stories: ComparisonPassage[] }[];
    steps: { cue: string; stories: ComparisonPassage[] }[];
  };
  divergences: { canonical: string; stories: ComparisonPassage[] }[];
  anomalies: { kind: string; canonical: string | null; story_id: string; passage: string | null }[];
  conflicts: { kind: string; canonical: string | null; values: ComparisonPassage[] }[];
  contradictions: { rule: string; canonical: string | null; unit: string | null; values: ComparisonPassage[] }[];
}

export interface ReviewQueueItem {
  id: string;
  title: string;
  validation_status: string;
  updated_at: string;
  approvals: number;
  rejections: number;
  disagreement: boolean;
}

export interface ReviewEntry {
  id: string;
  decision: string;
  comment: string;
  reviewer_name: string;
  story_revision: number;
  created_at: string;
  current: boolean;
}

export interface ReviewDossier {
  story: Story;
  media: { id: string; kind: string; original_name: string }[];
  analysis: StoryAnalysis | null;
  comparison: { status: string; reason?: string | null; common?: { ingredients?: { canonical: string }[] } };
  reviews: ReviewEntry[];
  revision: number;
  notice: string;
  approvals: number;
  rejections: number;
  disagreement: boolean;
}

export interface ReviewQueue {
  items: ReviewQueueItem[];
  counts: Record<string, number>;
  notice: string;
}

export interface RecipeCite {
  story_id: string;
  title: string;
  revision: number;
  passage: string;
  canonical?: string;
  unit?: string | null;
}

export interface RecipeSheet {
  id: string;
  title: string;
  category_slug: string | null;
  status: string;
  stale: boolean;
  version: number;
  notice: string;
  sources: { id: string; title: string; revision: number; content_sha256: string; approval: string }[];
  body: {
    context: RecipeCite[];
    context_divergence: boolean;
    ingredients: { canonical: string; stories: RecipeCite[] }[];
    quantities: RecipeCite[];
    steps: RecipeCite[];
    durations: RecipeCite[];
    precautions: RecipeCite[];
    divergences: { kind?: string; canonical?: string | null }[];
    missing: string[];
    corrections: { field: string; replacement: string; note: string }[];
    comparison_status: string;
  };
}

export interface GuideView {
  recipe_id: string;
  title: string;
  version: number;
  status: string;
  stale: boolean;
  mode: "documentary" | "practical";
  practical_allowed: boolean;
  safety: string;
  notice: string;
  category_slug: string | null;
  ingredients: { canonical: string; stories: { passage: string; title: string }[] }[];
  quantities: { canonical?: string; passage: string; title: string }[];
  steps: { passage: string; title: string; revision: number }[];
  durations: { passage: string; title: string; seconds: number | null }[];
  precautions: { passage: string; title: string }[];
  sources: { id: string; title: string; revision: number; approval: string }[];
  missing: string[];
}

export interface ModuleInfo {
  status: string;
  result: unknown;
  message: string;
}

export interface ModuleStatus {
  phase: string;
  disclaimer: string;
  modules: Record<string, ModuleInfo>;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface SpaceSummary {
  stories: number;
  drafts: number;
  submitted: number;
  corrections: number;
  recipes: number;
  favorites: number;
  notifications: number;
}

export interface SpaceItem {
  id: string;
  kind: string;
  title: string;
  status: string;
  workflow?: string | null;
  consent?: boolean | null;
  href: string;
  at?: string;
}

export interface SpaceNote {
  recipe_id: string;
  title: string;
  status: string;
  body: string;
  updated_at: string;
}

export interface SpaceNotice {
  key: string;
  kind: string;
  code: string;
  title: string;
  comment: string;
  at: string;
  read: boolean;
  href: string;
}
