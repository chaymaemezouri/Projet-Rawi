import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api/client";
import { correctRecipe, createRecipe, exportRecipe, fetchRecipe, fetchRecipeRevisions, fetchRecipes, fetchStories, publishRecipe } from "../api/resources";
import { ErrorState, SectionHeading } from "../components/ui/Chrome";
import type { RecipeCite, RecipeSheet, Story } from "../types";

export function RecipePage() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [field, setField] = useState("title");
  const [replacement, setReplacement] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const shared = useQuery({ queryKey: ["recipe-stories", "shared"], queryFn: () => fetchStories({ limit: 100 }) });
  const mine = useQuery({ queryKey: ["recipe-stories", "mine"], queryFn: () => fetchStories({ mine: true, limit: 100 }) });
  const recipes = useQuery({ queryKey: ["recipes", "mine"], queryFn: () => fetchRecipes(true) });
  const sheet = useQuery({ queryKey: ["recipe", currentId], queryFn: () => fetchRecipe(currentId), enabled: Boolean(currentId) });
  const history = useQuery({ queryKey: ["recipe-history", currentId], queryFn: () => fetchRecipeRevisions(currentId), enabled: Boolean(currentId) });
  const stories = useMemo(() => {
    const byId = new Map<string, Story>();
    for (const item of [...(shared.data?.items ?? []), ...(mine.data?.items ?? [])]) byId.set(item.id, item);
    return [...byId.values()];
  }, [shared.data, mine.data]);
  const refresh = async (id = currentId) => {
    await client.invalidateQueries({ queryKey: ["recipes"] });
    if (id) {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipe-history", id] });
    }
  };
  const generate = useMutation({
    mutationFn: () => createRecipe(title, selected),
    onSuccess: async (created) => {
      setCurrentId(created.id);
      setError("");
      await refresh(created.id);
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });
  const correction = useMutation({
    mutationFn: () => correctRecipe(currentId, field, replacement, note),
    onSuccess: async () => {
      setReplacement("");
      setNote("");
      setError("");
      await refresh();
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });
  const publication = useMutation({
    mutationFn: () => publishRecipe(currentId),
    onSuccess: async () => {
      setError("");
      await refresh();
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading as="h1" kicker={t("recipe.kicker")} title={t("recipe.title")} text={t("recipe.lead")} />
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <label className="block text-sm">
            <span className="text-muted">{t("recipe.name")}</span>
            <input className="field mt-2" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          {shared.isLoading || mine.isLoading ? <div className="mt-4 h-40 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
          {shared.isError || mine.isError ? <div className="mt-4"><ErrorState label={t("common.error")} /></div> : null}
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {stories.map((story) => {
              const checked = selected.includes(story.id);
              return (
                <li key={story.id}>
                  <label className="card block h-full">
                    <input className="accent-forest" type="checkbox" checked={checked} disabled={!checked && selected.length >= 6} onChange={() => setSelected((current) => current.includes(story.id) ? current.filter((id) => id !== story.id) : [...current, story.id])} />
                    <span className="ms-3" dir="auto">{story.title}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <button className="btn mt-4" type="button" disabled={title.trim().length < 2 || selected.length < 1 || generate.isPending} onClick={() => generate.mutate()}>{t("recipe.generate")}</button>
        </div>
        <div>
          <h2 className="section-title mt-0">{t("recipe.mine")}</h2>
          {recipes.isLoading ? <div className="mt-4 h-24 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
          {recipes.isError ? <div className="mt-4"><ErrorState label={t("common.error")} /></div> : null}
          {recipes.data && recipes.data.items.length === 0 ? <p className="mt-4 text-sm text-muted">{t("recipe.empty")}</p> : null}
          <ul className="mt-4 space-y-3">
            {recipes.data?.items.map((item) => (
              <li key={item.id}>
                <button className={`card w-full text-start ${currentId === item.id ? "border-forest" : ""}`} type="button" onClick={() => setCurrentId(item.id)}>
                  <span className="font-serif text-2xl leading-tight text-ink" dir="auto">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted">{t(`recipe.${item.status}`, item.status)} · {t("recipe.version", { version: item.version })}</span>
                  {item.stale ? <span className="mt-1 block text-sm text-danger">{t("recipe.stale")}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}
      {sheet.isLoading ? <div className="mt-6 h-48 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
      {sheet.isError ? <div className="mt-6"><ErrorState label={t("common.error")} /></div> : null}
      {sheet.data ? (
        <SheetView
          sheet={sheet.data}
          history={history.data ?? []}
          field={field}
          replacement={replacement}
          note={note}
          busy={correction.isPending || publication.isPending}
          onField={setField}
          onReplacement={setReplacement}
          onNote={setNote}
          onSave={() => correction.mutate()}
          onPublish={() => publication.mutate()}
          onExport={async () => {
            const blob = await exportRecipe(sheet.data.id);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${sheet.data.title}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        />
      ) : null}
    </section>
  );
}

function lines(items: RecipeCite[]) {
  return items.map((item) => `${item.canonical ? `${item.canonical} · ` : ""}${item.passage} — ${item.title}`).join("\n");
}

function SheetView({
  sheet,
  history,
  field,
  replacement,
  note,
  busy,
  onField,
  onReplacement,
  onNote,
  onSave,
  onPublish,
  onExport,
}: {
  sheet: RecipeSheet;
  history: { version: number; reason: string; title: string; status: string }[];
  field: string;
  replacement: string;
  note: string;
  busy: boolean;
  onField: (value: string) => void;
  onReplacement: (value: string) => void;
  onNote: (value: string) => void;
  onSave: () => void;
  onPublish: () => void;
  onExport: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const body = sheet.body;
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      <article className="card lg:col-span-2">
        <p className="text-sm">{sheet.notice}</p>
        {sheet.stale ? <p role="status" className="mt-3 text-sm text-danger">{t("recipe.stale")}</p> : null}
        <p className="mt-2 text-sm text-muted">{t(`recipe.${sheet.status}`, sheet.status)} · {t("recipe.version", { version: sheet.version })}</p>
      </article>
      <article className="card">
        <h2 className="section-title mt-0">{t("recipe.preview")}</h2>
        <h3 className="entry-title" dir="auto">{sheet.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{sheet.category_slug || t("recipe.missing")}</p>
        <h3 className="block-title">{t("recipe.context")}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm" dir="auto">{body.context.length ? lines(body.context) : t("recipe.missing")}</p>
        {body.context_divergence ? <p className="mt-2 text-sm text-danger">{t("recipe.divergences")}</p> : null}
        <h3 className="block-title">{t("recipe.ingredients")}</h3>
        {body.ingredients.map((item) => <p key={item.canonical} className="mt-2 text-sm" dir="auto">{item.canonical} · {item.stories.map((story) => story.passage).join(" / ")}</p>)}
        <h3 className="block-title">{t("recipe.quantities")}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm" dir="auto">{body.quantities.length ? lines(body.quantities) : t("recipe.missing")}</p>
        <h3 className="block-title">{t("recipe.steps")}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm" dir="auto">{body.steps.length ? lines(body.steps) : t("recipe.missing")}</p>
        <h3 className="block-title">{t("recipe.durations")}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm" dir="auto">{body.durations.length ? lines(body.durations) : t("recipe.missing")}</p>
        <h3 className="block-title">{t("recipe.precautions")}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm" dir="auto">{body.precautions.length ? lines(body.precautions) : t("recipe.missing")}</p>
      </article>
      <div className="space-y-4">
        <article className="card">
          <h2 className="section-title mt-0">{t("recipe.sources")}</h2>
          {sheet.sources.map((source) => (
            <p key={source.id} className="mt-3 text-sm" dir="auto">{source.title} · {t("recipe.version", { version: source.revision })} · {t("recipe.approval", { kind: t(`recipe.${source.approval}`, source.approval) })}</p>
          ))}
          {body.divergences.length ? <p className="mt-4 text-sm">{t("recipe.divergences")} · {body.divergences.map((item) => item.canonical || item.kind).filter(Boolean).join(", ")}</p> : null}
          {body.missing.length ? <p className="mt-2 text-sm text-muted">{t("recipe.missing")} · {body.missing.join(", ")}</p> : null}
          {body.corrections.map((item, index) => <p key={`${item.field}-${index}`} className="mt-3 text-sm" dir="auto">{item.field} · {item.replacement} · {item.note}</p>)}
        </article>
        <article className="card">
          <h2 className="section-title mt-0">{t("recipe.editor")}</h2>
          <label className="mt-4 block text-sm">
            <span className="text-muted">{t("recipe.field")}</span>
            <select className="field mt-2" value={field} onChange={(event) => onField(event.target.value)}>
              <option value="title">{t("recipe.name")}</option>
              <option value="context">{t("recipe.context")}</option>
              <option value="precaution">{t("recipe.precautions")}</option>
            </select>
          </label>
          <label className="mt-3 block text-sm">
            <span className="text-muted">{t("recipe.replacement")}</span>
            <input className="field mt-2" value={replacement} onChange={(event) => onReplacement(event.target.value)} />
          </label>
          <label className="mt-3 block text-sm">
            <span className="text-muted">{t("recipe.note")}</span>
            <textarea className="field mt-2 min-h-24" value={note} onChange={(event) => onNote(event.target.value)} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn" type="button" disabled={busy || replacement.trim().length < 2 || note.trim().length < 3} onClick={onSave}>{t("recipe.save")}</button>
            <button className="btn-secondary" type="button" disabled={busy || sheet.status !== "draft"} onClick={onPublish}>{t("recipe.publish")}</button>
            <button className="btn-secondary" type="button" onClick={() => void onExport()}>{t("recipe.export")}</button>
          </div>
        </article>
        <article className="card">
          <h2 className="section-title mt-0">{t("recipe.history")}</h2>
          {history.length === 0 ? <p className="mt-3 text-sm text-muted">{t("recipe.empty")}</p> : null}
          {history.map((item) => <p key={item.version} className="mt-3 text-sm" dir="auto">{t("recipe.version", { version: item.version })} · {item.reason} · {item.title}</p>)}
        </article>
      </div>
    </div>
  );
}
