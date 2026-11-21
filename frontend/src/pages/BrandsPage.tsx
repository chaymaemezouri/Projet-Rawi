import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { text } from "../demo/catalog";
import { TERROIRS, terroirBySlug, type Copy } from "../demo/terroirs";

const NAV = [
  ["/marques", "home"],
  ["/marques/ingredients", "ingredients"],
  ["/marques/tendances", "trends"],
] as const;

function useCopy() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;
  return (value: Copy) => text(language, value);
}

export function BrandsPage() {
  const { slug = "" } = useParams();
  const house = terroirBySlug(slug);
  if (house) return <HousePage />;
  return <TerroirsIndex />;
}

function TerroirsIndex() {
  const { t } = useTranslation();
  const label = useCopy();
  const { pathname } = useLocation();
  const page = pathname.endsWith("/ingredients") ? "ingredients" : pathname.endsWith("/tendances") ? "trends" : "home";
  const products = TERROIRS.flatMap((house) => house.products.map((product) => ({ house, product })));

  return (
    <section className="container-page py-12 md:py-16">
      <p className="w-fit rounded-full bg-gold/40 px-4 py-1 text-sm text-clay-ink">{t("atlas.brandsKicker")}</p>
      <h1 className="mt-4 max-w-3xl text-5xl">{t(`atlas.brandPages.${page}`)}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">{t("atlas.brandsLead")}</p>
      <nav className="mt-8 flex flex-wrap gap-2" aria-label={t("atlas.brandsNav")}>
        {NAV.map(([to, key]) => (
          <Link key={to} to={to} className={`rounded-full px-4 py-2 text-sm ${page === key ? "bg-forest text-cream" : "bg-cream text-ink"}`}>
            {t(`atlas.brandNav.${key}`)}
          </Link>
        ))}
      </nav>
      {page === "home" ? (
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {TERROIRS.map((house) => (
            <li key={house.slug}>
              <Link to={`/marques/${house.slug}`} className="group relative block h-full overflow-hidden rounded-[1.5rem] border border-line bg-paper">
                <img src={house.hero} alt="" className="h-96 w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/35 to-transparent p-5 text-cream">
                  <span className="flex items-center gap-3">
                    <img src={house.logo} alt="" className="h-12 w-12 shrink-0 rounded-full bg-cream object-cover ring-2 ring-gold/80" />
                    <span>
                      <span className="block font-serif text-3xl leading-tight">{label(house.name)}</span>
                      <span className="mt-1 block text-sm text-cream/90">{house.products.map((product) => label(product.name)).join(" · ")}</span>
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {page === "ingredients" ? (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(({ house, product }) => (
            <li key={`${house.slug}-${product.name.fr}`}>
              <Link to={`/marques/${house.slug}`} className="flex flex-col items-center text-center">
                <img src={product.image} alt="" className="h-40 w-40 rounded-full object-cover ring-4 ring-gold/80" />
                <p className="mt-4 font-serif text-2xl">{label(product.name)}</p>
                <p className="mt-1 text-xs text-clay-ink">{label(house.name)}</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted">{label(product.note)}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {page === "trends" ? (
        <ul className="mt-10 grid gap-4">
          {TERROIRS.map((house) => (
            <li key={house.slug}>
              <Link to={`/marques/${house.slug}`} className="flex items-center gap-5 rounded-[1.5rem] border border-line bg-paper p-4">
                <img src={house.hero} alt="" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                <div>
                  <h2 className="font-serif text-3xl">{label(house.name)}</h2>
                  <p className="mt-2 leading-7">{house.products.map((product) => label(product.name)).join(" · ")}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function HousePage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const label = useCopy();
  const house = terroirBySlug(slug);
  if (!house) {
    return (
      <section className="container-page py-16">
        <h1 className="text-4xl">{t("atlas.empty")}</h1>
        <Link className="btn mt-6" to="/marques">{t("atlas.houseBack")}</Link>
      </section>
    );
  }
  return (
    <article className="container-page py-12">
      <Link className="text-sm text-forest" to="/marques">{t("atlas.houseBack")}</Link>
      <header className="mt-6 flex items-center gap-4">
        <img src={house.logo} alt="" className="h-16 w-16 shrink-0 rounded-full bg-cream object-cover ring-2 ring-gold/80" />
        <div>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{label(house.name)}</h1>
          <p className="mt-2 text-sm text-muted">{label(house.place)}</p>
        </div>
      </header>
      <p className="mt-6 max-w-2xl text-lg leading-8">{label(house.summary)}</p>
      <p className="mt-3 max-w-2xl leading-7 text-muted">{label(house.story)}</p>
      <h2 className="mt-12 font-serif text-3xl">{t("atlas.houseProducts")}</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {house.products.map((product) => (
          <li key={product.name.fr} className="grid items-center gap-6 py-8 md:grid-cols-[16rem_1fr]">
            <img src={product.image} alt="" className="h-56 w-full rounded-[1.25rem] object-cover" />
            <div>
              <p className="text-sm text-clay-ink">{label(house.name)}</p>
              <h3 className="mt-1 font-serif text-3xl">{label(product.name)}</h3>
              <p className="mt-3 leading-7">{label(product.note)}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{label(product.limit)}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
