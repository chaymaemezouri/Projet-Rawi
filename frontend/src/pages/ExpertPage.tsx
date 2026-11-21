import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchReviewQueue } from "../api/resources";
import { ErrorState, LoadingState } from "../components/ui/Chrome";

export function ExpertPage() {
  const { t } = useTranslation();
  const queue = useQuery({ queryKey: ["expert-queue"], queryFn: () => fetchReviewQueue("pending") });
  return (
    <section className="container-page py-12 md:py-16">
      <p className="kicker">{t("atlas.expertNav")}</p>
      <h1 className="mt-3 text-5xl">{t("atlas.expertTitle")}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">{t("atlas.expertLead")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link className="rounded-[1.5rem] bg-forest p-6 text-cream" to="/expert/validations">
          <p className="text-sm text-gold">{t("atlas.real")}</p>
          <p className="mt-2 font-serif text-3xl">{t("atlas.expertQueue")}</p>
          <p className="mt-3 text-4xl">{queue.data?.items.length ?? "—"}</p>
        </Link>
        <Link className="rounded-[1.5rem] border border-line bg-paper p-6" to="/modules/analysis">
          <p className="text-sm text-clay-ink">{t("atlas.real")}</p>
          <p className="mt-2 font-serif text-3xl">{t("atlas.expertCompare")}</p>
        </Link>
        <div className="rounded-[1.5rem] border border-dashed border-line p-6">
          <p className="text-sm text-clay-ink">{t("atlas.soon")}</p>
          <p className="mt-2 font-serif text-3xl">{t("atlas.nlpCard")}</p>
          <p className="mt-3 text-sm leading-6 text-muted">{t("atlas.nlpCardText")}</p>
        </div>
      </div>
      <h2 className="mt-12 text-3xl">{t("atlas.expertQueue")}</h2>
      {queue.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {queue.isError ? <ErrorState label={t("common.error")} /> : null}
      <ul className="mt-4 grid gap-3">
        {(queue.data?.items ?? []).map((item) => (
          <li key={item.id}>
            <Link className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper px-4 py-3" to={`/expert/recits/${item.id}`}>
              <span className="font-serif text-2xl">{item.title}</span>
              <span className="text-sm text-muted">{item.approvals}/2</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
