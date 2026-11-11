import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchFavorites, fetchStories } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { StatusBadge } from "../components/StatusBadge";

const MODULES = [
  ["/modules/ai", "nav.ai"],
  ["/modules/analysis", "nav.analysis"],
  ["/modules/validation", "nav.validation"],
  ["/modules/recipes", "nav.recipes"],
] as const;

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const stories = useQuery({ queryKey: ["stories", "mine"], queryFn: () => fetchStories({ mine: true }) });
  const favorites = useQuery({ queryKey: ["favorites"], queryFn: fetchFavorites });

  return (
    <section className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-clay">
            {t("dashboard.role")} · {user ? t(`roles.${user.role}`) : ""}
          </p>
          <h1 className="mt-2 text-4xl">{t("dashboard.hello", { name: user?.full_name })}</h1>
          <p className="mt-3 max-w-2xl text-muted">{t("dashboard.intro")}</p>
        </div>
        <Link className="btn" to="/stories/new">
          {t("nav.newStory")}
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="card">
          <h2 className="text-2xl">{t("dashboard.myStories")}</h2>
          {stories.isLoading ? <p className="mt-4 text-muted">{t("common.loading")}</p> : null}
          {stories.data && stories.data.items.length === 0 ? (
            <p className="mt-4 text-muted">{t("dashboard.emptyStories")}</p>
          ) : null}
          <ul className="mt-4 space-y-3">
            {stories.data?.items.map((story) => (
              <li key={story.id}>
                <Link className="flex items-center justify-between gap-3 rounded-2xl border border-line px-3 py-3" to={`/stories/${story.id}`}>
                  <span>{story.title}</span>
                  <StatusBadge status={story.validation_status} />
                </Link>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2 className="text-2xl">{t("dashboard.favorites")}</h2>
          {favorites.data && favorites.data.items.length === 0 ? (
            <p className="mt-4 text-muted">{t("dashboard.emptyFavorites")}</p>
          ) : null}
          <ul className="mt-4 space-y-3">
            {favorites.data?.items.map((story) => (
              <li key={story.id}>
                <Link className="block rounded-2xl border border-line px-3 py-3" to={`/stories/${story.id}`}>
                  {story.title}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <h2 className="mt-10 text-2xl">{t("dashboard.modules")}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map(([to, label]) => (
          <Link key={to} to={to} className="card block">
            <span className="text-lg">{t(label)}</span>
            <span className="mt-2 block text-sm text-muted">{t("module.notReady")}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
