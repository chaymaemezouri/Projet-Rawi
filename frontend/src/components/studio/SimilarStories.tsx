import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchSimilar } from "../../api/resources";

export function SimilarStories({ storyId }: { storyId: string }) {
  const { t } = useTranslation();
  const similar = useQuery({ queryKey: ["similar", storyId], queryFn: () => fetchSimilar(storyId) });
  return (
    <section className="mt-12" aria-label={t("library.similar")}>
      <h2 className="text-3xl">{t("library.similar")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{t("library.similarNote")}</p>
      {similar.isLoading ? <p className="mt-4 text-sm text-muted">{t("common.loading")}</p> : null}
      {similar.data && similar.data.length === 0 ? <p className="mt-4 text-sm text-muted">{t("library.similarEmpty")}</p> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {similar.data?.map((item) => (
          <article key={item.story.id} className="card">
            <Link className="font-serif text-2xl text-forest" to={`/stories/${item.story.id}`}>
              {item.story.title}
            </Link>
            <ul className="mt-3 space-y-1 text-sm leading-6">
              {item.reasons.map((reason, index) => (
                <li key={`${reason.code}-${reason.detail ?? index}`}>{t(`library.reason.${reason.code}`, { detail: reason.detail ?? "" })}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
