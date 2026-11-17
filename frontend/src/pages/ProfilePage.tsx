import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchFavorites, fetchStories } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "../components/ui/Chrome";
import { formatDate } from "../lib/format";

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const stories = useQuery({ queryKey: ["stories", "mine"], queryFn: () => fetchStories({ mine: true }) });
  const favorites = useQuery({ queryKey: ["favorites"], queryFn: fetchFavorites });

  if (!user) return null;

  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading as="h1" kicker={t("design.profile")} title={t("design.profileTitle")} text={t("design.profileLead")} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="card h-fit">
          <p className="font-serif text-4xl leading-tight">{user.full_name}</p>
          <p className="mt-3 text-sm text-muted">{user.email}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="text-muted">{t("dashboard.role")}</dt>
              <dd>{t(`roles.${user.role}`)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="text-muted">{t("auth.language")}</dt>
              <dd>{t(`lang.${user.preferred_language}`)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("design.memberSince")}</dt>
              <dd>{formatDate(user.created_at, i18n.language)}</dd>
            </div>
          </dl>
          <Link className="btn mt-6" to="/stories/new">
            {t("nav.newStory")}
          </Link>
        </aside>

        <div className="space-y-6">
          <article className="card">
            <h2 className="text-3xl">{t("design.contributions")}</h2>
            {stories.isLoading ? <LoadingState label={t("common.loading")} /> : null}
            {stories.isError ? <ErrorState label={t("common.error")} /> : null}
            {stories.data && stories.data.items.length === 0 ? (
              <div className="mt-5">
                <EmptyState title={t("dashboard.emptyStories")} />
              </div>
            ) : null}
            <ol className="mt-5 space-y-3">
              {stories.data?.items.map((story) => (
                <li key={story.id}>
                  <Link className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 hover:border-forest" to={`/stories/${story.id}`}>
                    <span>
                      <span className="block">{story.title}</span>
                      <span className="mt-1 block text-xs text-muted">{formatDate(story.updated_at, i18n.language)}</span>
                    </span>
                    <StatusBadge status={story.validation_status} />
                  </Link>
                </li>
              ))}
            </ol>
          </article>

          <article className="card">
            <h2 className="text-3xl">{t("dashboard.favorites")}</h2>
            {favorites.isLoading ? <LoadingState label={t("common.loading")} /> : null}
            {favorites.data && favorites.data.items.length === 0 ? (
              <div className="mt-5">
                <EmptyState title={t("dashboard.emptyFavorites")} />
              </div>
            ) : null}
            <ul className="mt-5 space-y-3">
              {favorites.data?.items.map((story) => (
                <li key={story.id}>
                  <Link className="block rounded-2xl border border-line px-4 py-3 hover:border-forest" to={`/stories/${story.id}`}>
                    {story.title}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2 className="text-3xl">{t("design.savedRecipes")}</h2>
            <div className="mt-5">
              <EmptyState title={t("design.savedRecipesEmpty")} action={<Link className="btn-secondary" to="/modules/recipes">{t("nav.recipes")}</Link>} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
