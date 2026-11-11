import type { Category } from "../types";

export function categoryName(category: Category, language: string): string {
  if (language === "ar") return category.name_ar;
  if (language === "ary") return category.name_ary;
  return category.name_fr;
}

export function categoryDescription(category: Category, language: string): string {
  if (language === "ar") return category.description_ar;
  if (language === "ary") return category.description_ary;
  return category.description_fr;
}

export function formatDate(value: string, language: string): string {
  const locale = language === "fr" ? "fr-MA" : "ar-MA";
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(value));
}
