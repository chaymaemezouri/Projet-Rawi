import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const INGREDIENTS = [
  { id: "argan", image: "/images/rawi-argan.jpg", group: "oils" },
  { id: "rhassoul", image: "/images/rawi-clay.jpg", group: "hammam" },
  { id: "henna", image: "/images/rawi-hair.jpg", group: "hair" },
  { id: "rose", image: "/images/rawi-rose.jpg", group: "face" },
] as const;

const FILTERS = ["all", "face", "hair", "hammam", "oils"] as const;

export function IngredientExplorer() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [selected, setSelected] = useState<(typeof INGREDIENTS)[number]["id"] | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = INGREDIENTS.find((item) => item.id === selected);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  const visible = INGREDIENTS.filter((item) => {
    const haystack = `${t(`heritage.${item.id}`)} ${t(`heritage.${item.id}Origin`)} ${t(`heritage.${item.id}Text`)}`.toLocaleLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLocaleLowerCase());
    return matchesQuery && (filter === "all" || item.group === filter);
  });

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <label className="block w-full md:max-w-sm">
          <span className="label">{t("heritage.searchIngredients")}</span>
          <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("heritage.searchIngredients")}>
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              className={`rounded-full px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${filter === item ? "bg-forest text-cream" : "border border-line bg-paper"}`}
              onClick={() => setFilter(item)}
            >
              {t(item === "all" ? "heritage.filterAll" : `heritage.filter${item[0].toUpperCase()}${item.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? <p className="mt-8 text-sm text-muted">{t("heritage.noIngredient")}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            className="zoom-frame group relative block h-80 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            onClick={() => setSelected(item.id)}
          >
            <img src={item.image} alt={t(`heritage.${item.id}Alt`)} className={`absolute inset-0 h-full w-full object-cover ${item.id === "henna" ? "object-[72%_center]" : item.id === "rose" ? "object-[78%_30%]" : "object-center"}`} />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-cream">
              <span className="block font-serif text-3xl">{t(`heritage.${item.id}`)}</span>
              <span className="mt-1 block text-sm text-cream/80">{t(`heritage.${item.id}Origin`)}</span>
            </span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="m-auto max-h-[calc(100%-2rem)] w-[min(56rem,calc(100%-2rem))] overflow-auto border border-line bg-cream p-0 text-ink backdrop:bg-ink/55"
        aria-labelledby="ingredient-title"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        {current ? (
          <div className="grid md:grid-cols-2">
            <img src={current.image} alt={t(`heritage.${current.id}Alt`)} className="h-72 w-full object-cover md:h-full" />
            <div className="p-6 md:p-8">
              <p className="kicker">{t("heritage.demoMark")}</p>
              <h3 id="ingredient-title" className="mt-3 text-4xl">{t(`heritage.${current.id}`)}</h3>
              <p className="mt-2 text-sm text-clay-ink">{t(`heritage.${current.id}Origin`)}</p>
              <p className="mt-5 text-sm font-medium">{t("heritage.traditionalLabel")}</p>
              <p className="mt-2 leading-7">{t(`heritage.${current.id}Text`)}</p>
              <p className="mt-4 text-sm leading-6 text-muted">{t("heritage.scienceLabel")}</p>
              <p className="mt-4 text-sm">
                <span className="text-muted">{t("heritage.categoryLink")} · </span>
                {t(`heritage.filter${current.group[0].toUpperCase()}${current.group.slice(1)}`)}
              </p>
              <button type="button" className="btn mt-8" onClick={() => dialogRef.current?.close()}>
                {t("heritage.closeDetail")}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
