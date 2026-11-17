import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchCategories, fetchStories } from "../api/resources";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "../components/ui/Chrome";
import { categoryName, formatDate } from "../lib/format";

export function StoryListPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const categoryId = params.get("category") ?? "";
  const status = params.get("status") ?? "";
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const stories = useQuery({
    queryKey: ["stories", { categoryId, status, offset }],
    queryFn: () => fetchStories({ categoryId: categoryId || undefined, status: status || undefined, offset }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    setOffset(0);
  }

  const items = (stories.data?.items ?? []).filter((story) => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return true;
    return `${story.title} ${story.narrator_name} ${story.original_content}`.toLocaleLowerCase().includes(needle);
  });
  const total = stories.data?.total ?? 0;
  const count = stories.data?.items.length ?? 0;

  return (
    <section className="container-page py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading as="h1" kicker={t("design.libraryKicker")} title={t("story.listTitle")} text={t("story.lead")} />
        <Link className="btn" to="/stories/new">
          {t("nav.newStory")}
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="label">{t("design.search")}</span>
          <input
            className="field"
            value={query}
            placeholder={t("design.searchPlaceholder")}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="mt-2 block text-xs text-muted">{t("design.searchHint")}</span>
        </label>
        <label>
          <span className="label">{t("story.filterCategory")}</span>
          <select className="field" value={categoryId} onChange={(event) => updateParam("category", event.target.value)}>
            <option value="">{t("story.all")}</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {categoryName(category, i18n.language)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">{t("story.filterStatus")}</span>
          <select className="field" value={status} onChange={(event) => updateParam("status", event.target.value)}>
            <option value="">{t("story.all")}</option>
            <option value="pending">{t("status.pending")}</option>
            <option value="validated">{t("status.validated")}</option>
            <option value="rejected">{t("status.rejected")}</option>
          </select>
        </label>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {t("design.results", { count: items.length })}
      </p>
      {stories.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {stories.isError ? <ErrorState label={t("common.error")} /> : null}
      {stories.data && items.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t("story.empty")} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((story) => (
          <Link key={story.id} to={`/stories/${story.id}`} className="card lift block">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-3xl">{story.title}</h2>
              <StatusBadge status={story.validation_status} />
            </div>
            <p className="mt-3 text-sm text-muted">
              {t("story.by")} {story.narrator_name}
              {story.category ? ` · ${categoryName(story.category, i18n.language)}` : ""}
              {" · "}
              {formatDate(story.created_at, i18n.language)}
            </p>
            <p className="mt-4 line-clamp-3 text-sm leading-7">{story.original_content}</p>
          </Link>
        ))}
      </div>

      {total > count ? (
        <div className="mt-8 flex gap-3">
          <button className="btn-secondary" type="button" disabled={offset === 0} onClick={() => setOffset((value) => Math.max(0, value - 20))}>
            {t("common.previous")}
          </button>
          <button className="btn-secondary" type="button" disabled={offset + count >= total} onClick={() => setOffset((value) => value + 20)}>
            {t("common.next")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
