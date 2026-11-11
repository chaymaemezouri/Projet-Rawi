import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchCategories, fetchStories } from "../api/resources";
import { StatusBadge } from "../components/StatusBadge";
import { categoryName, formatDate } from "../lib/format";

export function StoryListPage() {
  const { t, i18n } = useTranslation();
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const stories = useQuery({
    queryKey: ["stories", { categoryId, status, offset }],
    queryFn: () => fetchStories({ categoryId: categoryId || undefined, status: status || undefined, offset }),
  });

  const total = stories.data?.total ?? 0;
  const count = stories.data?.items.length ?? 0;

  return (
    <section className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">{t("story.listTitle")}</h1>
          <p className="mt-3 max-w-2xl text-muted">{t("story.lead")}</p>
        </div>
        <Link className="btn" to="/stories/new">
          {t("nav.newStory")}
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label>
          <span className="label">{t("story.filterCategory")}</span>
          <select
            className="field"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setOffset(0);
            }}
          >
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
          <select
            className="field"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setOffset(0);
            }}
          >
            <option value="">{t("story.all")}</option>
            <option value="pending">{t("status.pending")}</option>
            <option value="validated">{t("status.validated")}</option>
            <option value="rejected">{t("status.rejected")}</option>
          </select>
        </label>
      </div>

      {stories.isLoading ? <p className="mt-8 text-muted">{t("common.loading")}</p> : null}
      {stories.isError ? <p className="mt-8 text-danger">{t("common.error")}</p> : null}
      {stories.data && stories.data.items.length === 0 ? <p className="mt-8 text-muted">{t("story.empty")}</p> : null}

      <div className="mt-6 grid gap-4">
        {stories.data?.items.map((story) => (
          <Link key={story.id} to={`/stories/${story.id}`} className="card block">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl">{story.title}</h2>
              <StatusBadge status={story.validation_status} />
            </div>
            <p className="mt-2 text-sm text-muted">
              {t("story.by")} {story.narrator_name}
              {story.category ? ` · ${categoryName(story.category, i18n.language)}` : ""}
              {" · "}
              {formatDate(story.created_at, i18n.language)}
            </p>
            <p className="mt-3 line-clamp-3 text-sm leading-6">{story.original_content}</p>
          </Link>
        ))}
      </div>

      {total > count ? (
        <div className="mt-6 flex gap-3">
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
