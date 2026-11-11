import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="container-page py-20">
      <h1 className="text-4xl">{t("common.notFoundTitle")}</h1>
      <p className="mt-3 text-muted">{t("common.notFoundText")}</p>
      <Link className="btn mt-6" to="/">
        {t("nav.home")}
      </Link>
    </section>
  );
}
