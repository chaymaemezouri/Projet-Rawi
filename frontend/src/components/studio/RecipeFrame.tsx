import { useTranslation } from "react-i18next";

const SLOTS = ["design.ingredients", "design.provenance", "design.instructions", "design.validationStatus"] as const;

export function RecipeFrame() {
  const { t } = useTranslation();
  return (
    <section className="card" aria-label={t("design.recipeFrame")}>
      <p className="kicker">{t("design.demoBadge")}</p>
      <h2 className="mt-3 text-4xl">{t("design.recipeFrame")}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t("design.recipeEmpty")}</p>
      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        {SLOTS.map((key) => (
          <div key={key} className="rounded-[1.4rem] border border-dashed border-line px-5 py-5">
            <dt className="text-sm font-medium">{t(key)}</dt>
            <dd className="mt-4 font-serif text-3xl text-muted">—</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
