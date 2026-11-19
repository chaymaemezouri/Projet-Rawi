import type { Category } from "../types";

export function categoryName(category: { name_fr: string; name_ar: string; name_ary: string }, language: string): string {
  if (language === "ar") return category.name_ar;
  if (language === "ary") return category.name_ary;
  return category.name_fr;
}

export function categoryDescription(category: Category, language: string): string {
  if (language === "ar") return category.description_ar;
  if (language === "ary") return category.description_ary;
  return category.description_fr;
}

function localeFor(language: string) {
  return language === "fr" ? "fr-MA" : "ar-MA";
}

export function formatDate(value: string, language: string): string {
  return new Intl.DateTimeFormat(localeFor(language), { dateStyle: "long" }).format(new Date(value));
}

export function formatCount(value: number, language: string): string {
  return new Intl.NumberFormat(localeFor(language)).format(value);
}
