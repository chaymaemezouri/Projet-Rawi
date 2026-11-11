import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createCategory, fetchCategories } from "../api/resources";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
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
    <section className="container-page py-10">
      <h1 className="text-4xl">{t("category.title")}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t("category.lead")}</p>
      {categories.isLoading ? <p className="mt-8 text-muted">{t("common.loading")}</p> : null}
      {categories.isError ? <p className="mt-8 text-danger">{t("common.error")}</p> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {categories.data?.map((category) => (
          <article key={category.id} className="card">
            <p className="text-xs uppercase tracking-wide text-clay">{category.slug}</p>
            <h2 className="mt-2 text-2xl">{categoryName(category, i18n.language)}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{categoryDescription(category, i18n.language)}</p>
          </article>
        ))}
      </div>

      {user?.role === "admin" ? (
        <form onSubmit={onSubmit} className="card mt-10 grid gap-4 md:grid-cols-2" aria-label={t("category.adminTitle")}>
          <h2 className="text-2xl md:col-span-2">{t("category.adminTitle")}</h2>
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
          {error ? <p role="alert" className="text-sm text-danger md:col-span-2">{error}</p> : null}
          <button className="btn md:col-span-2" type="submit" disabled={mutation.isPending}>
            {t("category.create")}
          </button>
        </form>
      ) : null}
    </section>
  );
}
