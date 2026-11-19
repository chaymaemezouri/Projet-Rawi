import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { compareStories, fetchCategories, fetchStories } from "../api/resources";
import { ErrorState, SectionHeading } from "../components/ui/Chrome";
import type { Category, Comparison, Story } from "../types";
import { formatCount } from "../lib/format";

function categoryLabel(category: Category, language: string) {
  if (language === "ary") return category.name_ary;
  if (language === "ar") return category.name_ar;
  return category.name_fr;
}

function passagesFor(result: Comparison, storyId: string) {
  const found: string[] = [];
  for (const group of [...result.common.ingredients, ...result.divergences]) {
    const item = group.stories.find((story) => story.id === storyId);
    if (item?.passage) found.push(item.passage);
  }
  for (const group of result.common.steps) {
    const item = group.stories.find((story) => story.id === storyId);
    if (item?.passage) found.push(item.passage);
  }
  for (const group of [...result.conflicts, ...result.contradictions]) {
    for (const item of group.values) {
      if (item.id === storyId && item.passage) found.push(item.passage);
    }
  }
  return [...new Set(found)];
}

export function ComparePage() {
  const { t, i18n } = useTranslation();
  const [categoryId, setCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const shared = useQuery({ queryKey: ["compare-stories", "shared"], queryFn: () => fetchStories({ limit: 100 }) });
  const mine = useQuery({ queryKey: ["compare-stories", "mine"], queryFn: () => fetchStories({ mine: true, limit: 100 }) });
  const stories = useMemo(() => {
    const byId = new Map<string, Story>();
    for (const item of [...(shared.data?.items ?? []), ...(mine.data?.items ?? [])]) byId.set(item.id, item);
    return [...byId.values()];
  }, [shared.data, mine.data]);
  const visible = stories.filter((story) => {
    const categoryMatches = !categoryId || story.category_id === categoryId;
    const titleMatches = story.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return categoryMatches && titleMatches;
  });
  const chosenCategory = stories.find((story) => selected.includes(story.id))?.category_id ?? "";
  const comparison = useMutation({
    mutationFn: () => compareStories(selected),
    onError: () => setError(t("common.error")),
  });
  const result = comparison.data;
  const indicatorLabel: Record<string, string> = {
    sources: t("compare.sources"),
    coverage: t("compare.coverage"),
    coherence: t("compare.coherence"),
    anomalies: t("compare.anomalyCount"),
  };
  const indicatorDetail: Record<string, string> = {
    sources: t("compare.detailSources"),
    coverage: t("compare.detailCoverage"),
    coherence: t("compare.detailCoherence"),
    anomalies: t("compare.detailAnomalies"),
  };

  function toggle(story: Story) {
    setError("");
    setSelected((current) => {
      if (current.includes(story.id)) return current.filter((id) => id !== story.id);
      if (current.length >= 6) return current;
      const locked = stories.find((item) => current.includes(item.id))?.category_id;
      if (locked && locked !== story.category_id) return current;
      return [...current, story.id];
    });
  }

  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading as="h1" kicker={t("compare.kicker")} title={t("compare.title")} text={t("compare.lead")} />
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="text-muted">{t("compare.category")}</span>
          <select className="field mt-2" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setSelected([]); }}>
            <option value="">{t("compare.all")}</option>
            {categories.data?.map((category) => <option key={category.id} value={category.id}>{categoryLabel(category, i18n.language)}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-muted">{t("compare.search")}</span>
          <input className="field mt-2" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>
      <h2 className="section-title">{t("compare.select")}</h2>
      {shared.isLoading || mine.isLoading ? <div className="mt-4 h-40 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
      {shared.isError || mine.isError ? <div className="mt-4"><ErrorState label={t("common.error")} /></div> : null}
      {visible.length === 0 && !shared.isLoading ? <p className="mt-4 text-sm text-muted">{t("compare.empty")}</p> : null}
      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((story) => {
          const checked = selected.includes(story.id);
          const blocked = Boolean(chosenCategory) && story.category_id !== chosenCategory;
          return (
            <li key={story.id}>
              <label className={`card block h-full ${blocked ? "opacity-50" : ""}`}>
                <input className="accent-forest" type="checkbox" checked={checked} disabled={blocked || (!checked && selected.length >= 6)} onChange={() => toggle(story)} />
                <span className="ms-3 font-medium" dir="auto">{story.title}</span>
                <span className="mt-2 block text-sm text-muted">{story.category ? categoryLabel(story.category, i18n.language) : t("compare.all")}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <button className="btn mt-6" type="button" disabled={selected.length < 2 || comparison.isPending} onClick={() => { setError(""); comparison.mutate(); }}>
        {t("compare.run")}
      </button>
      {selected.length < 2 ? <p className="mt-3 text-sm text-muted">{t("compare.need")}</p> : null}
      {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}
      {result ? <ComparisonResult result={result} labels={indicatorLabel} details={indicatorDetail} /> : null}
    </section>
  );
}

function ComparisonResult({ result, labels, details }: { result: Comparison; labels: Record<string, string>; details: Record<string, string> }) {
  const { t, i18n } = useTranslation();
  const groups = [...result.common.ingredients.map((item) => ({ label: item.canonical, count: item.stories.length })), ...result.divergences.map((item) => ({ label: item.canonical, count: item.stories.length }))];
  return (
    <div className="mt-10 space-y-6">
      <p className="rounded-2xl border border-line bg-cream px-4 py-3 text-sm">{t("compare.notice")}</p>
      {result.status === "insufficient" ? <p role="status" className="text-sm">{t("compare.insufficient")}</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(result.indicators).map(([key, indicator]) => (
          <article key={key} className="card">
            <h2 className="block-title mt-0">{labels[key] || key}</h2>
            <p className="mt-3 text-3xl">{indicator.value ?? t("compare.insufficient")}</p>
            <p className="mt-2 text-sm text-muted">{indicator.value === null ? t("compare.insufficient") : (details[key] || indicator.detail)}</p>
          </article>
        ))}
      </div>
      <div>
        <h2 className="section-title mt-0">{t("compare.side")}</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {result.sources.map((source) => (
            <article key={source.id} className="card">
              <h3 className="font-serif text-2xl leading-tight text-ink" dir="auto">{source.title}</h3>
              <p className="mt-1 text-sm text-muted">{t("compare.revision", { version: source.revision })}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {passagesFor(result, source.id).map((passage) => <li key={passage} dir="auto">« {passage} »</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
      {groups.length ? (
        <div>
          <h2 className="section-title mt-0">{t("compare.frequency")}</h2>
          <ul className="mt-4 space-y-3">
            {groups.map((group) => (
              <li key={group.label}>
                <div className="mb-1 flex justify-between text-sm"><span dir="auto">{group.label}</span><span>{formatCount(group.count, i18n.language)}/{formatCount(result.sources.length, i18n.language)}</span></div>
                <div className="h-2 rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={result.sources.length} aria-valuenow={group.count} aria-label={group.label}><div className="h-2 rounded-full bg-forest" style={{ width: `${(group.count / result.sources.length) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <article className="card overflow-x-auto" tabIndex={0}>
        <h2 id="compare-shared" className="section-title mt-0">{t("compare.shared")}</h2>
        <table className="mt-4 w-full min-w-[36rem] text-sm" aria-labelledby="compare-shared">
          <thead>
            <tr>
              <th scope="col" className="py-3 pe-3 text-start">{t("compare.shared")}</th>
              {result.sources.map((source) => (
                <th key={source.id} scope="col" className="py-3 pe-3 text-start" dir="auto">{source.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.common.ingredients.map((group) => (
              <tr key={group.canonical} className="border-t border-line">
                <th scope="row" className="py-3 pe-3 text-start" dir="auto">{group.canonical}</th>
                {result.sources.map((source) => {
                  const found = group.stories.find((story) => story.id === source.id);
                  return <td key={source.id} className="py-3 pe-3" dir="auto">{found?.passage || t("compare.absent")}</td>;
                })}
              </tr>
            ))}
            {result.divergences.map((group) => (
              <tr key={group.canonical} className="border-t border-line">
                <th scope="row" className="py-3 pe-3 text-start" dir="auto">{group.canonical}</th>
                {result.sources.map((source) => {
                  const found = group.stories.find((story) => story.id === source.id);
                  return <td key={source.id} className="py-3 pe-3" dir="auto">{found?.passage || t("compare.absent")}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!result.common.ingredients.length && !result.divergences.length ? <p className="mt-3 text-sm text-muted">{t("compare.empty")}</p> : null}
      </article>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="card">
          <h2 className="section-title mt-0">{t("compare.steps")}</h2>
          {result.common.steps.length ? result.common.steps.map((step) => (
            <p key={step.cue} className="mt-3 text-sm" dir="auto">{step.stories.map((story) => story.passage).filter(Boolean).join(" · ")}</p>
          )) : <p className="mt-3 text-sm text-muted">{t("compare.empty")}</p>}
        </article>
        <article className="card">
          <h2 className="section-title mt-0">{t("compare.anomalies")}</h2>
          {result.anomalies.length ? result.anomalies.map((item, index) => (
            <p key={`${item.kind}-${item.story_id}-${index}`} className="mt-3 text-sm" dir="auto">{t(`compare.${item.kind}`, item.kind)}{item.canonical ? ` · ${item.canonical}` : ""}{item.passage ? ` · « ${item.passage} »` : ""}</p>
          )) : <p className="mt-3 text-sm text-muted">{t("compare.empty")}</p>}
        </article>
        <article className="card">
          <h2 className="section-title mt-0">{t("compare.conflicts")}</h2>
          {result.conflicts.length ? result.conflicts.map((item, index) => (
            <p key={`${item.kind}-${index}`} className="mt-3 text-sm" dir="auto">{t(`compare.${item.kind}`, item.kind)}{item.canonical ? ` · ${item.canonical}` : ""} · {item.values.map((value) => value.passage).join(" / ")}</p>
          )) : <p className="mt-3 text-sm text-muted">{t("compare.empty")}</p>}
        </article>
        <article className="card">
          <h2 className="section-title mt-0">{t("compare.contradictions")}</h2>
          {result.contradictions.length ? result.contradictions.map((item, index) => (
            <p key={`${item.rule}-${index}`} className="mt-3 text-sm" dir="auto">{item.rule === "duration_values" ? t("compare.ruleDuration") : t("compare.ruleQuantity")} {item.values.map((value) => `« ${value.passage} »`).join(" / ")}</p>
          )) : <p className="mt-3 text-sm text-muted">{t("compare.empty")}</p>}
        </article>
      </div>
    </div>
  );
}
