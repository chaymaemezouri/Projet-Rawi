import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchCategories, fetchCover, fetchStories } from "../api/resources";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState, ErrorState, SectionHeading } from "../components/ui/Chrome";
import { categoryName, formatDate } from "../lib/format";
import type { Story } from "../types";

const PAGE_SIZE = 9;

function NeutralCover() {
  return (
    <div className="grid h-44 place-items-center bg-cream text-forest" aria-hidden="true">
      <svg viewBox="0 0 80 64" className="h-16 w-20">
        <path d="M8 54c14-18 22-18 32-4 8-16 18-22 32-18" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="40" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M40 36v16" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

function StoryCover({ story }: { story: Story }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!story.has_image) return;
    let active = true;
    let objectUrl = "";
    void fetchCover(story.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [story.has_image, story.id]);
  if (!url) return <NeutralCover />;
  return <img src={url} alt="" className="h-44 w-full object-cover" />;
}

function StoryCard({ story, list }: { story: Story; list: boolean }) {
  const { t, i18n } = useTranslation();
  const excerpt = story.original_content.replace(/\s+/g, " ").slice(0, 180);
  return (
    <Link to={`/stories/${story.id}`} className={`card lift block overflow-hidden p-0 ${list ? "md:grid md:grid-cols-[11rem_1fr]" : ""}`}>
      <StoryCover story={story} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-3xl leading-none">{story.title}</h2>
          <span className="flex flex-col items-end gap-2">
            {story.workflow_status === "draft" ? (
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium">{t("story.draft")}</span>
            ) : null}
            <StatusBadge status={story.validation_status} />
          </span>
        </div>
        <p className="mt-3 text-sm text-muted">
          {story.category ? categoryName(story.category, i18n.language) : t("category.none")}
          {" · "}
          {t(`lang.${story.language}`)}
          {" · "}
          {story.origin_place || t("story.unknown")}
          {" · "}
          {formatDate(story.collected_on ?? story.created_at, i18n.language)}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-6">{excerpt}</p>
        <p className="mt-3 text-xs text-muted">
          {!story.has_image ? t("library.noImage") : null}
          {story.has_audio ? ` · ${t("library.hasAudio")}` : ""}
          {story.has_document ? ` · ${t("library.hasDocument")}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function StoryListPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const qParam = params.get("q") ?? "";
  const [q, setQ] = useState(qParam);
  const categoryId = params.get("category") ?? "";
  const language = params.get("language") ?? "";
  const origin = params.get("origin") ?? "";
  const status = params.get("status") ?? "";
  const source = params.get("source") ?? "";
  const collectedFrom = params.get("from") ?? "";
  const collectedTo = params.get("to") ?? "";
  const hasAudio = params.get("audio") === "1";
  const hasDocument = params.get("document") === "1";
  const sort = params.get("sort") ?? "recent";
  const view = params.get("view") === "list" ? "list" : "grid";
  const mine = params.get("mine") === "1";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  useEffect(() => setQ(qParam), [qParam]);
  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (q.trim() === qParam) return;
      const next = new URLSearchParams(params);
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      next.delete("page");
      setParams(next);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [q, qParam, params, setParams]);

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  }

  const stories = useQuery({
    queryKey: ["stories", { qParam, categoryId, language, origin, status, source, collectedFrom, collectedTo, hasAudio, hasDocument, sort, mine, page }],
    queryFn: () =>
      fetchStories({
        mine,
        q: qParam || undefined,
        categoryId: categoryId || undefined,
        language: language || undefined,
        origin: origin || undefined,
        status: status || undefined,
        source: source || undefined,
        collectedFrom: collectedFrom || undefined,
        collectedTo: collectedTo || undefined,
        hasAudio,
        hasDocument,
        sort,
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
  });
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const total = stories.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="container-page py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading as="h1" kicker={t("design.libraryKicker")} title={t("story.listTitle")} text={mine ? t("library.leadMine") : t("library.lead")} />
        <Link className="btn" to="/stories/new">{t("nav.newStory")}</Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label={t("library.scope")}>
        <button className={mine ? "btn-secondary" : "btn"} type="button" role="tab" aria-selected={!mine} onClick={() => update({ mine: null })}>
          {t("library.shared")}
        </button>
        <button className={mine ? "btn" : "btn-secondary"} type="button" role="tab" aria-selected={mine} onClick={() => update({ mine: "1" })}>
          {t("library.mine")}
        </button>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => event.preventDefault()}>
        <label className="md:col-span-2 xl:col-span-4">
          <span className="label">{t("library.search")}</span>
          <input className="field" value={q} placeholder={t("library.searchPlaceholder")} onChange={(event) => setQ(event.target.value)} />
        </label>
        <label>
          <span className="label">{t("story.filterCategory")}</span>
          <select className="field" value={categoryId} onChange={(event) => update({ category: event.target.value || null })}>
            <option value="">{t("story.all")}</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>{categoryName(category, i18n.language)}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">{t("story.language")}</span>
          <select className="field" value={language} onChange={(event) => update({ language: event.target.value || null })}>
            <option value="">{t("story.all")}</option>
            <option value="fr">{t("lang.fr")}</option>
            <option value="ar">{t("lang.ar")}</option>
            <option value="ary">{t("lang.ary")}</option>
          </select>
        </label>
        <label>
          <span className="label">{t("library.region")}</span>
          <input className="field" value={origin} onChange={(event) => update({ origin: event.target.value || null })} />
        </label>
        <label>
          <span className="label">{t("story.filterStatus")}</span>
          <select className="field" value={status} onChange={(event) => update({ status: event.target.value || null })}>
            <option value="">{t("story.all")}</option>
            <option value="pending">{t("status.pending")}</option>
            <option value="validated">{t("status.validated")}</option>
            <option value="rejected">{t("status.rejected")}</option>
            <option value="correction_requested">{t("status.correction_requested")}</option>
          </select>
        </label>
        <label>
          <span className="label">{t("story.source")}</span>
          <select className="field" value={source} onChange={(event) => update({ source: event.target.value || null })}>
            <option value="">{t("story.all")}</option>
            <option value="oral">{t("source.oral")}</option>
            <option value="written">{t("source.written")}</option>
            <option value="digitized">{t("source.digitized")}</option>
          </select>
        </label>
        <label>
          <span className="label">{t("library.from")}</span>
          <input className="field" type="date" value={collectedFrom} onChange={(event) => update({ from: event.target.value || null })} />
        </label>
        <label>
          <span className="label">{t("library.to")}</span>
          <input className="field" type="date" value={collectedTo} onChange={(event) => update({ to: event.target.value || null })} />
        </label>
        <label>
          <span className="label">{t("library.sort")}</span>
          <select className="field" value={sort} onChange={(event) => update({ sort: event.target.value })}>
            <option value="recent">{t("library.sortRecent")}</option>
            <option value="collected">{t("library.sortCollected")}</option>
            <option value="title">{t("library.sortTitle")}</option>
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-forest" checked={hasAudio} onChange={(event) => update({ audio: event.target.checked ? "1" : null })} />
            {t("library.audioOnly")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-forest" checked={hasDocument} onChange={(event) => update({ document: event.target.checked ? "1" : null })} />
            {t("library.documentOnly")}
          </label>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">{stories.isSuccess ? t(total === 1 ? "library.countOne" : "library.count", { count: total }) : t("common.loading")}</p>
        <div className="flex flex-wrap gap-2">
          <button className={view === "grid" ? "btn" : "btn-secondary"} type="button" onClick={() => update({ view: null })}>{t("library.grid")}</button>
          <button className={view === "list" ? "btn" : "btn-secondary"} type="button" onClick={() => update({ view: "list" })}>{t("library.list")}</button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setQ("");
              setParams(mine ? { mine: "1" } : {});
            }}
          >
            {t("library.reset")}
          </button>
        </div>
      </div>

      {stories.isLoading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[1.75rem] bg-line/80" />
          ))}
        </div>
      ) : null}
      {stories.isError ? <div className="mt-6"><ErrorState label={t("common.error")} /></div> : null}
      {stories.data && stories.data.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t("story.empty")} text={mine ? t("library.emptyMine") : t("library.emptyShared")} />
        </div>
      ) : null}
      <div className={view === "list" ? "mt-6 grid gap-4" : "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
        {stories.data?.items.map((story) => <StoryCard key={story.id} story={story} list={view === "list"} />)}
      </div>
      {total > PAGE_SIZE ? (
        <div className="mt-8 flex items-center gap-3">
          <button className="btn-secondary" type="button" disabled={page <= 1} onClick={() => update({ page: page > 2 ? String(page - 1) : null })}>
            {t("common.previous")}
          </button>
          <p className="text-sm text-muted">{t("library.page", { page, pages })}</p>
          <button className="btn-secondary" type="button" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })}>
            {t("common.next")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
