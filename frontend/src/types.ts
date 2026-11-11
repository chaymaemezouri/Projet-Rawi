export type Role = "contributor" | "validator" | "admin";
export type LanguageCode = "fr" | "ar" | "ary";
export type NarratorRole =
  | "grandmother"
  | "achaba"
  | "hammam_practitioner"
  | "practitioner"
  | "other";
export type StorySource = "oral" | "written" | "digitized";
export type ValidationStatus = "pending" | "validated" | "rejected";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  preferred_language: LanguageCode;
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
  validation_status: ValidationStatus;
  content_origin: "collected";
  category_id: string | null;
  category: Category | null;
  created_by: User;
  validated_by: User | null;
  validated_at: string | null;
  is_favorite: boolean;
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
