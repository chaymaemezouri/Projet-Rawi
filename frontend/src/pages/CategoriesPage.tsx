import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createCategory, fetchCategories } from "../api/resources";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "../components/ui/Chrome";
import { categoryDescription, categoryName } from "../lib/format";

const EMPTY_FORM = {
  slug: "",
  name_fr: "",
  name_ar: "",
  name_ary: "",
  description_fr: "",
  description_ar: "",
  description_ary: "",
};

const PHOTOS = ["/images/rawi-botanical.jpg", "/images/rawi-ritual.jpg", "/images/rawi-library.jpg", "/images/rawi-hero.jpg"];

export function CategoriesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      setForm(EMPTY_FORM);
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate(form);
  }

  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading as="h1" kicker={t("design.libraryKicker")} title={t("category.title")} text={t("category.lead")} />
      {categories.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {categories.isError ? <ErrorState label={t("common.error")} /> : null}
      {categories.data && categories.data.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("story.empty")} />
        </div>
      ) : null}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {categories.data?.map((category, index) => (
          <article key={category.id} className="card lift overflow-hidden p-0">
            <img src={PHOTOS[index % PHOTOS.length]} alt="" className="h-48 w-full object-cover" />
            <div className="p-6">
              <p className="kicker">{category.slug}</p>
              <h2 className="mt-3 text-3xl">{categoryName(category, i18n.language)}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{categoryDescription(category, i18n.language)}</p>
              <Link className="btn-secondary mt-5" to={user ? `/stories?category=${category.id}` : "/login"}>
                {user ? t("design.readStories") : t("design.signInToRead")}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {user?.role === "admin" ? (
        <form onSubmit={onSubmit} className="card mt-12 grid gap-4 md:grid-cols-2" aria-label={t("category.adminTitle")}>
          <h2 className="text-3xl md:col-span-2">{t("category.adminTitle")}</h2>
          {(
            [
              ["slug", "category.slug"],
              ["name_fr", "category.nameFr"],
              ["name_ar", "category.nameAr"],
              ["name_ary", "category.nameAry"],
              ["description_fr", "category.descFr"],
              ["description_ar", "category.descAr"],
              ["description_ary", "category.descAry"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={key.startsWith("description") ? "md:col-span-2" : ""}>
              <span className="label">{t(label)}</span>
              <input
                className="field"
                required={!key.startsWith("description")}
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
          {error ? (
            <p role="alert" className="text-sm text-danger md:col-span-2">
              {error}
            </p>
          ) : null}
          <button className="btn md:col-span-2" type="submit" disabled={mutation.isPending}>
            {t("category.create")}
          </button>
        </form>
      ) : null}
    </section>
  );
}
