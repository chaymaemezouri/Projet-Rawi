import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchHealth } from "../api/resources";
import { HeritageAudio } from "../components/home/HeritageAudio";
import { IngredientExplorer } from "../components/home/IngredientExplorer";
import { KnowledgeJourney } from "../components/home/KnowledgeJourney";
import { motion, useReducedMotion } from "framer-motion";

const UNIVERSES = [
  { key: "face", image: "/images/rawi-rose.jpg", alt: "heritage.roseAlt", href: "/themes/visage", area: "area-face", frame: "min-h-[24rem] md:min-h-[34rem]", position: "object-[28%_center]" },
  { key: "hair", image: "/images/rawi-hair.jpg", alt: "heritage.hairAlt", href: "/themes/cheveux", area: "area-hair", frame: "min-h-[16rem]", position: "object-[center_35%]" },
  { key: "hammam", image: "/images/rawi-ritual.jpg", alt: "heritage.hammamAlt", href: "/themes/hammam", area: "area-hammam", frame: "min-h-[16rem] md:min-h-0", position: "object-center" },
  { key: "oils", image: "/images/rawi-hands.jpg", alt: "heritage.oilsAlt", href: "/themes/huiles", area: "area-oils", frame: "min-h-[16rem]", position: "object-center" },
  { key: "plants", image: "/images/rawi-botanical.jpg", alt: "heritage.plantsAlt", href: "/themes", area: "area-plants", frame: "min-h-[16rem]", position: "object-center" },
] as const;

export function HomePage() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const health = useQuery({ queryKey: ["health"], queryFn: fetchHealth, retry: false });

  return (
    <div>
      <section className="relative -mt-24 overflow-hidden bg-ink text-cream lg:min-h-[88vh]">
        <div className="relative aspect-video w-full sm:h-[52vh] sm:aspect-auto lg:absolute lg:inset-0 lg:h-full">
          {reduce === false ? (
            <video
              className="absolute inset-0 h-full w-full object-cover object-[12%_center] lg:object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/rawi-hero-poster.jpg"
              aria-hidden="true"
              ref={(node) => {
                if (node) node.muted = true;
              }}
            >
              <source src="/videos/rawi-hero.mp4" type="video/mp4" />
            </video>
          ) : (
            <img
              src="/images/rawi-hero-poster.jpg"
              alt={t("heritage.heroVideoAlt")}
              className="absolute inset-0 h-full w-full object-cover object-[12%_center] lg:object-center"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10 lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/45 lg:to-ink/10 lg:rtl:bg-gradient-to-l" />
        </div>
        <div className="container-page relative z-10 -mt-8 pb-12 sm:-mt-12 lg:mt-0 lg:flex lg:min-h-[88vh] lg:items-center lg:py-24">
          <motion.div
            className="max-w-xl"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: "easeOut" }}
          >
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-gold rtl:tracking-normal">{t("home.kicker")}</p>
            <h1 className="mt-4 text-5xl leading-[0.98] text-cream sm:text-6xl lg:text-7xl">{t("home.title")}</h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-cream/85">{t("home.lead")}</p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <Link className="btn-light" to="/explorer">
                {t("nav.explore")}
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-cream/80 px-6 py-3 text-sm font-medium text-cream transition hover:bg-cream hover:text-forest"
                to="/transmettre"
              >
                {t("nav.transmit")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="savoirs" className="container-page scroll-mt-24 py-16 md:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="kicker">{t("heritage.universesKicker")}</p>
            <h2 className="mt-3 text-4xl md:text-5xl">{t("heritage.universesTitle")}</h2>
          </div>
        </div>
        <div className="universe-grid mt-8">
          {UNIVERSES.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={`zoom-frame group relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${item.area} ${item.frame}`}
            >
              <img src={item.image} alt={t(item.alt)} className={`absolute inset-0 h-full w-full object-cover ${item.position}`} />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-5 font-serif text-3xl leading-tight text-cream lg:text-4xl">{t(`heritage.${item.key}`)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="voix" className="scroll-mt-24 grid bg-ink text-cream lg:grid-cols-2">
        <div className="relative min-h-[26rem]">
          <img src="/images/rawi-library.jpg" alt={t("heritage.notebookAlt")} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{t("heritage.voicesKicker")}</p>
          <h2 className="mt-4 max-w-lg text-4xl leading-tight text-cream md:text-5xl">{t("heritage.voicesTitle")}</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-cream/75">{t("heritage.voicesLead")}</p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-gold">{t("heritage.consentMark")}</dt>
              <dd className="mt-2 text-sm leading-6 text-cream/80">{t("heritage.voiceNote")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-gold">{t("heritage.provenanceMark")}</dt>
              <dd className="mt-2 text-sm leading-6 text-cream/80">{t("heritage.voiceRegion")}</dd>
            </div>
          </dl>
          <HeritageAudio />
        </div>
      </section>

      <section id="parcours" className="container-page scroll-mt-24 py-16 md:py-20">
        <p className="kicker">{t("heritage.journeyKicker")}</p>
        <h2 className="mt-3 max-w-xl text-4xl md:text-5xl">{t("heritage.journeyTitle")}</h2>
        <div className="mt-10">
          <KnowledgeJourney />
        </div>
      </section>

      <section id="botanique" className="container-page scroll-mt-24 pb-16 md:pb-20">
        <p className="kicker">{t("heritage.botanicalKicker")}</p>
        <h2 className="mt-3 max-w-xl text-4xl md:text-5xl">{t("heritage.botanicalTitle")}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{t("heritage.botanicalLead")}</p>
        <div className="mt-8">
          <IngredientExplorer />
        </div>
      </section>

      <section className="grid lg:grid-cols-5">
        <div className="relative min-h-[16rem] lg:col-span-2">
          <img src="/images/rawi-linen.jpg" alt={t("heritage.linenAlt")} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center bg-forest px-5 py-12 text-cream sm:px-10 lg:col-span-3 lg:px-14 lg:py-16">
          <h2 className="max-w-xl text-4xl leading-tight md:text-5xl">{t("heritage.closingTitle")}</h2>
          <p className="mt-4 max-w-lg text-cream/80">{t("heritage.closingText")}</p>
          <Link className="btn-light mt-8 w-fit" to="/transmettre">
            {t("nav.share")}
          </Link>
        </div>
      </section>
      <p className="container-page py-3 text-xs text-muted">
        {health.isLoading ? t("common.loading") : health.data?.status === "ok" ? t("home.apiOk") : t("home.apiDown")}
      </p>
    </div>
  );
}
