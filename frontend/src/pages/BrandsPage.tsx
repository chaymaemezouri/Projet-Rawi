import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { text, type Copy } from "../demo/catalog";
import { TERROIRS, productBySlug, terroirBySlug, type TerroirBrand, type TerroirProduct } from "../demo/terroirs";
import { BrandLogo, brandColors } from "../components/terroir/PackageArt";

function useCopy() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;
  return {
    language,
    label: (value: Copy) => text(language, value),
    money: (price: number) => (language === "fr" ? `${price},00 DH` : `${price} د.م.`),
  };
}

export function BrandsPage() {
  const { slug = "", product: productSlug = "" } = useParams();
  if (productSlug) return <ProductPage />;
  if (slug && terroirBySlug(slug)) return <BrandPage />;
  if (slug) return <Missing />;
  return <TerroirsHome />;
}

function Missing() {
  const { t } = useTranslation();
  return (
    <section className="container-page py-16">
      <h1 className="text-4xl">{t("atlas.terroirUi.missing")}</h1>
      <Link className="btn mt-6" to="/marques">{t("atlas.terroirUi.backAll")}</Link>
    </section>
  );
}

const MOVING = ["huile-olive", "savon-argan-rose", "lavande", "huile-argan", "creme-argan", "menthe", "huile-figue", "eau-rose", "infusion-detente", "huile-nigelle"];

function movingProducts() {
  const all = TERROIRS.flatMap((brand) => brand.products.map((product) => ({ brand, product })));
  return MOVING.flatMap((slug) => {
    const found = all.find((item) => item.product.slug === slug);
    return found ? [found] : [];
  });
}

function TerroirsHome() {
  const { t } = useTranslation();
  const { label, money } = useCopy();
  const moving = movingProducts();
  const loop = [...moving, ...moving];
  return (
    <div>
    <section className="container-page grid gap-8 py-12 lg:grid-cols-3">
      {TERROIRS.map((brand) => {
        const colors = brandColors(brand.id);
        return (
          <Link key={brand.id} to={`/marques/${brand.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-paper shadow-card transition duration-300 hover:-translate-y-1">
            <span className="block h-64 overflow-hidden">
              <img src={brand.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </span>
            <span className="flex flex-1 flex-col border-t-4 px-6 py-5" style={{ borderColor: colors.accent }}>
              <span className="flex items-center gap-3">
                <BrandLogo id={brand.id} className="h-12 w-12 shrink-0" />
                <span>
                  <span className="block font-serif text-3xl leading-none" style={{ color: colors.ink }}>{brand.name}</span>
                  <span className="mt-1 block text-sm" style={{ color: colors.accent }}>{label(brand.domain)}</span>
                </span>
              </span>
              <span className="mt-4 block text-sm leading-6">{label(brand.description)}</span>
              <span className="mt-5 text-sm font-medium" style={{ color: colors.accent }}>{t("atlas.terroirUi.discover")}</span>
            </span>
          </Link>
        );
      })}
    </section>
    <section className="overflow-hidden pb-14" aria-label={t("atlas.terroirUi.moving")}>
      <div className="container-page mb-5">
        <h2 className="font-serif text-3xl">{t("atlas.terroirUi.moving")}</h2>
      </div>
      <div className="product-rail flex w-max gap-4 px-5">
        {loop.map((item, index) => {
          const colors = brandColors(item.brand.id);
          const copy = index < moving.length;
          return (
            <Link key={`${item.product.id}-${index}`} to={`/marques/${item.brand.slug}/${item.product.slug}`} className="w-56 shrink-0 overflow-hidden rounded-[1.4rem] bg-paper shadow-card transition duration-300 hover:-translate-y-1" tabIndex={copy ? 0 : -1} aria-hidden={copy ? undefined : true}>
              <img src={item.product.image} alt="" className="h-56 w-full object-cover" />
              <span className="block p-4">
                <span className="block text-xs" style={{ color: colors.accent }}>{item.brand.name}</span>
                <span className="mt-1 block font-serif text-xl leading-tight">{label(item.product.name)}</span>
                <span className="mt-2 block text-sm">{label(item.product.format)} · {money(item.product.price)}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
    </div>
  );
}

function ProductCard({ brand, product, name, note, format, price }: { brand: TerroirBrand; product: TerroirProduct; name: string; note: string; format: string; price: string }) {
  const { t } = useTranslation();
  const colors = brandColors(brand.id);
  return (
    <Link to={`/marques/${brand.slug}/${product.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-card" style={{ borderColor: colors.soft }}>
      <img src={product.image} alt="" className="aspect-square w-full object-cover" />
      <span className="flex flex-1 flex-col p-5 text-center">
        <span className="text-xs" style={{ color: colors.accent }}>{brand.name}</span>
        <span className="mt-1 block font-serif text-2xl leading-tight">{name}</span>
        <span className="mt-2 block text-sm leading-6 text-muted">{note}</span>
        <span className="mt-3 block text-sm">{format}</span>
        <span className="mx-auto mt-4 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: colors.accent }}>{price}</span>
        <span className="mt-3 text-sm" style={{ color: colors.accent }}>{t("atlas.terroirUi.seeProduct")}</span>
      </span>
    </Link>
  );
}

function BrandPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const { label, money } = useCopy();
  const brand = terroirBySlug(slug);
  if (!brand) return <Missing />;
  const colors = brandColors(brand.id);
  return (
    <article>
      <section className="relative isolate overflow-hidden bg-ink text-cream">
        <img src={brand.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/50" />
        <div className="container-page relative py-14">
          <Link className="text-sm text-cream" to="/marques">{t("atlas.terroirUi.backAll")}</Link>
          <BrandLogo id={brand.id} className="mt-6 h-20 w-20" />
          <h1 className="mt-4 font-serif text-5xl text-cream sm:text-6xl">{brand.name}</h1>
          <p className="mt-3 max-w-xl text-xl text-cream/90">{label(brand.slogan)}</p>
          <p className="mt-4 max-w-2xl leading-7 text-cream/85">{label(brand.longDescription)}</p>
          <p className="mt-4 text-sm text-cream/75">{label(brand.domain)}</p>
          <p className="mt-2 text-sm text-cream/70">{t("atlas.terroirUi.demo")}</p>
        </div>
      </section>
      <section className="container-page py-12">
        <h2 className="font-serif text-4xl">{t("atlas.terroirUi.products")}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brand.products.map((product) => (
            <li key={product.id}>
              <ProductCard brand={brand} product={product} name={label(product.name)} note={label(product.shortDescription)} format={label(product.format)} price={money(product.price)} />
            </li>
          ))}
        </ul>
      </section>
      <section className="container-page grid items-center gap-8 py-14 lg:grid-cols-2">
        <img src={brand.cover} alt="" className="h-80 w-full rounded-[1.5rem] object-cover" />
        <div>
          <h2 className="font-serif text-4xl">{t("atlas.terroirUi.craft")}</h2>
          <p className="mt-4 leading-8">{label(brand.heritage)}</p>
          <Link className="btn mt-6" to={`/themes/${brand.ritual}`} style={{ background: colors.accent }}>{t("atlas.terroirUi.readRituals")}</Link>
        </div>
      </section>
    </article>
  );
}

function ProductPage() {
  const { slug = "", product: productSlug = "" } = useParams();
  const { t } = useTranslation();
  const { label, money } = useCopy();
  const found = productBySlug(slug, productSlug);
  if (!found) return <Missing />;
  const { brand, product } = found;
  const colors = brandColors(brand.id);
  const others = brand.products.filter((item) => item.id !== product.id).slice(0, 3);
  return (
    <article className="container-page py-12">
      <Link className="text-sm text-forest" to={`/marques/${brand.slug}`}>{t("atlas.terroirUi.backBrand")}</Link>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-2">
        <div>
          <img src={product.image} alt="" className="w-full rounded-[1.8rem] object-cover" />
        </div>
        <div>
          <BrandLogo id={brand.id} className="h-14 w-14" />
          <p className="mt-3 text-sm" style={{ color: colors.accent }}>{brand.name}</p>
          <h1 className="mt-1 font-serif text-5xl leading-tight">{label(product.name)}</h1>
          <p className="mt-4 text-lg leading-8">{label(product.shortDescription)}</p>
          <p className="mt-3 leading-7 text-muted">{label(product.description)}</p>
          <p className="mt-6 font-serif text-3xl">{money(product.price)}</p>
          <p className="text-sm text-muted">{t("atlas.terroirUi.price")}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-clay-ink">{t("atlas.terroirUi.format")}</dt>
              <dd className="mt-1">{label(product.format)}</dd>
            </div>
            <div>
              <dt className="text-sm text-clay-ink">{t("atlas.terroirUi.origin")}</dt>
              <dd className="mt-1">{label(product.origin)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-clay-ink">{t("atlas.terroirUi.ingredients")}</dt>
              <dd className="mt-1 leading-7">{label(product.ingredients)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.5rem] border border-line bg-paper p-6">
          <h2 className="font-serif text-3xl">{t("atlas.terroirUi.usage")}</h2>
          <p className="mt-3 leading-7">{label(product.usage)}</p>
        </article>
        <article className="rounded-[1.5rem] p-6" style={{ background: colors.paper }}>
          <h2 className="font-serif text-3xl">{t("atlas.terroirUi.heritage")}</h2>
          <p className="mt-3 leading-7">{label(product.heritage)}</p>
          <Link className="mt-4 inline-block text-sm" style={{ color: colors.accent }} to={`/themes/${product.ritual}`}>{t("atlas.terroirUi.readRituals")}</Link>
        </article>
      </section>
      <section className="py-12">
        <h2 className="font-serif text-3xl">{t("atlas.terroirUi.similar")}</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => (
            <li key={item.id}>
              <ProductCard brand={brand} product={item} name={label(item.name)} note={label(item.shortDescription)} format={label(item.format)} price={money(item.price)} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
