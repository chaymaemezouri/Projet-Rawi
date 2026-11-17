import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="container-page grid gap-8 py-20 md:grid-cols-2 md:items-center">
      <div>
        <p className="kicker">RAWI</p>
        <h1 className="mt-4 text-5xl md:text-6xl">{t("common.notFoundTitle")}</h1>
        <p className="mt-4 max-w-md text-muted">{t("common.notFoundText")}</p>
        <Link className="btn mt-8" to="/">
          {t("nav.home")}
        </Link>
      </div>
      <img src="/images/rawi-library.jpg" alt="" className="aspect-[4/5] w-full rounded-[1.75rem] object-cover" />
    </section>
  );
}
