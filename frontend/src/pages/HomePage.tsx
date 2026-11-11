import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchHealth } from "../api/resources";

export function HomePage() {
  const { t } = useTranslation();
  const health = useQuery({ queryKey: ["health"], queryFn: fetchHealth, retry: false });

  const pillars = [
    ["home.collectTitle", "home.collectText"],
    ["home.distinguishTitle", "home.distinguishText"],
    ["home.validateTitle", "home.validateText"],
  ] as const;

  const origins = [
    ["home.collected", "home.collectedText"],
    ["home.aiProposal", "home.aiProposalText"],
    ["home.validated", "home.validatedText"],
  ] as const;

  return (
    <div>
      <section className="border-b border-line bg-paper">
        <div className="container-page grid gap-8 py-16 md:grid-cols-[1.4fr_0.8fr] md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-clay">{t("home.kicker")}</p>
            <h1 className="max-w-2xl text-4xl leading-tight text-forest md:text-5xl">{t("home.title")}</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">{t("home.lead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn" to="/register">
                {t("home.ctaPrimary")}
              </Link>
              <Link className="btn-secondary" to="/categories">
                {t("home.ctaSecondary")}
              </Link>
            </div>
          </div>
          <aside className="card">
            <p className="text-sm font-semibold text-forest">
              {health.isLoading
                ? t("common.loading")
                : health.data?.status === "ok"
                  ? t("home.apiOk")
                  : t("home.apiDown")}
            </p>
            <p className="mt-4 text-sm leading-6 text-muted">{t("home.nextText")}</p>
          </aside>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-3xl">{t("home.pillarsTitle")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {pillars.map(([title, text]) => (
            <article key={title} className="card">
              <h3 className="text-2xl text-forest">{t(title)}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{t(text)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <h2 className="text-3xl">{t("home.originsTitle")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {origins.map(([title, text]) => (
            <article key={title} className="rounded-3xl border border-line bg-white/70 p-5">
              <h3 className="text-xl">{t(title)}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{t(text)}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-muted">{t("home.nextTitle")}</p>
      </section>
    </div>
  );
}
