import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchFavorites, fetchStories } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "../components/ui/Chrome";
import { formatDate } from "../lib/format";

const MODULES = [
  ["/modules/ai", "nav.ai"],
  ["/modules/analysis", "nav.analysis"],
  ["/modules/validation", "nav.validation"],
  ["/modules/recipes", "nav.recipes"],
] as const;

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const stories = useQuery({ queryKey: ["stories", "mine"], queryFn: () => fetchStories({ mine: true }) });
  const pending = useQuery({
    queryKey: ["stories", "mine", "pending"],
    queryFn: () => fetchStories({ mine: true, status: "pending" }),
  });
  const favorites = useQuery({ queryKey: ["favorites"], queryFn: fetchFavorites });

  const counts = [
    [t("design.countsStories"), stories.data?.total],
    [t("design.countsPending"), pending.data?.total],
    [t("design.countsSaved"), favorites.data?.total],
  ] as const;

  return (
    <section className="container-page py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          as="h1"
          kicker={user ? t(`roles.${user.role}`) : undefined}
          title={t("dashboard.hello", { name: user?.full_name })}
          text={t("dashboard.intro")}
        />
        <div className="flex flex-wrap gap-3">
          <Link className="btn" to="/stories/new">
            {t("nav.newStory")}
          </Link>
          <Link className="btn-secondary" to="/profile">
            {t("design.profile")}
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {counts.map(([label, value]) => (
          <article key={label} className="card">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-3 font-serif text-5xl text-forest">{value ?? "—"}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-3xl">{t("design.recent")}</h2>
            <Link className="text-sm font-medium text-forest" to="/stories">
              {t("design.viewAll")}
            </Link>
          </div>
          {stories.isLoading ? <LoadingState label={t("common.loading")} /> : null}
          {stories.isError ? <ErrorState label={t("common.error")} /> : null}
          {stories.data && stories.data.items.length === 0 ? <div className="mt-5"><EmptyState title={t("dashboard.emptyStories")} /></div> : null}
          <ul className="mt-5 space-y-3">
            {stories.data?.items.slice(0, 5).map((story) => (
              <li key={story.id}>
                <Link className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 hover:border-forest" to={`/stories/${story.id}`}>
                  <span>
                    <span className="block">{story.title}</span>
                    <span className="mt-1 block text-xs text-muted">{formatDate(story.created_at, i18n.language)}</span>
                  </span>
                  <StatusBadge status={story.validation_status} />
                </Link>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2 className="text-3xl">{t("dashboard.favorites")}</h2>
          {favorites.isLoading ? <LoadingState label={t("common.loading")} /> : null}
          {favorites.isError ? <ErrorState label={t("common.error")} /> : null}
          {favorites.data && favorites.data.items.length === 0 ? <div className="mt-5"><EmptyState title={t("dashboard.emptyFavorites")} /></div> : null}
          <ul className="mt-5 space-y-3">
            {favorites.data?.items.slice(0, 5).map((story) => (
              <li key={story.id}>
                <Link className="block rounded-2xl border border-line px-4 py-3 hover:border-forest" to={`/stories/${story.id}`}>
                  {story.title}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <h2 className="mt-12 text-3xl">{t("dashboard.modules")}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map(([to, label], index) => (
          <Link key={to} to={to} className="card lift block">
            <span className="font-serif text-3xl text-forest">{String(index + 1).padStart(2, "0")}</span>
            <span className="mt-4 block text-2xl">{t(label)}</span>
            <span className="mt-2 block text-sm text-muted">{t("module.notReady")}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
