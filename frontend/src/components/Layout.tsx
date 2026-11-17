import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { Wordmark } from "./brand/Mark";
import { PageTransition } from "./motion/Motion";
import { LanguageSwitcher } from "./LanguageSwitcher";

function itemClass(active: boolean, onVideo: boolean) {
  if (active) return "rounded-full px-3 py-2 text-sm transition bg-forest text-cream";
  if (onVideo) return "rounded-full px-3 py-2 text-sm transition text-cream hover:bg-cream/15";
  return "rounded-full px-3 py-2 text-sm transition text-ink hover:bg-cream";
}

function linkIsCurrent(to: string, pathname: string, isActive: boolean) {
  if (to === "/stories") {
    return pathname === "/stories" || (pathname.startsWith("/stories/") && !pathname.startsWith("/stories/new"));
  }
  return isActive;
}

function Links({
  items,
  pathname,
  onVideo,
  onNavigate,
}: {
  items: readonly (readonly [string, string])[];
  pathname: string;
  onVideo: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {items.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className={({ isActive }) => itemClass(linkIsCurrent(to, pathname, isActive), onVideo)}
        >
          {label}
        </NavLink>
      ))}
    </>
  );
}

export function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const home = location.pathname === "/";
  const onVideo = home && !scrolled && !open;

  useEffect(() => {
    const apply = (language: string) => {
      const rtl = language === "ar" || language === "ary";
      document.documentElement.dir = rtl ? "rtl" : "ltr";
      document.documentElement.lang = language === "fr" ? "fr" : "ar";
    };
    apply(i18n.resolvedLanguage || i18n.language);
    i18n.on("languageChanged", apply);
    return () => {
      i18n.off("languageChanged", apply);
    };
  }, [i18n]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!home) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const primary = loading
    ? ([] as const)
    : user
      ? ([
          ["/dashboard", t("nav.dashboard")],
          ["/stories", t("nav.stories")],
          ["/categories", t("nav.categories")],
        ] as const)
      : ([["/", t("nav.home")]] as const);
  const transmitTo = user ? "/stories/new" : "/register";

  const atelier = [
    ["/modules/ai", t("nav.ai")],
    ["/modules/analysis", t("nav.analysis")],
    ["/modules/validation", t("nav.validation")],
    ["/modules/recipes", t("nav.recipes")],
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#content">
        {t("design.skip")}
      </a>
      <header className={`sticky top-0 z-30 transition-colors duration-300 ${onVideo ? "bg-transparent" : "border-b border-line bg-paper"}`}>
        <div className={onVideo ? "h-0" : "h-px bg-gold"} />
        <div className="container-page flex items-center justify-between gap-4 py-3 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-center">
          <NavLink to="/" className="shrink-0 justify-self-start" onClick={() => setOpen(false)}>
            <Wordmark />
          </NavLink>
          <div className="hidden items-center justify-center gap-2 xl:flex">
            <nav className="flex items-center gap-1" aria-label="RAWI">
              <Links items={primary} pathname={location.pathname} onVideo={onVideo} />
              <a href="/#savoirs" className={itemClass(location.hash === "#savoirs", onVideo)}>
                {t("nav.explore")}
              </a>
              <a href="/#parcours" className={itemClass(location.hash === "#parcours", onVideo)}>
                {t("nav.how")}
              </a>
              {user ? (
                <details className="group relative">
                  <summary className={`cursor-pointer list-none rounded-full px-3 py-2 text-sm [&::-webkit-details-marker]:hidden ${onVideo ? "text-cream hover:bg-cream/15" : "text-ink hover:bg-cream"}`}>
                    {t("design.atelier")}
                  </summary>
                  <div className="absolute end-0 z-20 mt-2 w-64 rounded-3xl border border-line bg-paper p-2 shadow-card">
                    {atelier.map(([to, label]) => (
                      <NavLink
                        key={to}
                        to={to}
                        className="block rounded-2xl px-3 py-2 text-sm hover:bg-cream"
                        onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </details>
              ) : null}
            </nav>
            <LanguageSwitcher compact />
            {!loading && user ? (
              <NavLink to="/profile" className={({ isActive }) => itemClass(isActive, onVideo)}>
                {t("design.profile")}
              </NavLink>
            ) : null}
            {!loading && !user ? (
              <NavLink to="/login" className={({ isActive }) => itemClass(isActive, onVideo)}>
                {t("nav.login")}
              </NavLink>
            ) : null}
            {!loading && user ? (
              <button type="button" className={`rounded-full px-3 py-2 text-sm ${onVideo ? "text-cream hover:bg-cream/15" : "text-ink hover:bg-cream"}`} onClick={logout}>
                {t("nav.logout")}
              </button>
            ) : null}
            {!loading ? (
              <Link className="btn" to={transmitTo}>
                {t("nav.transmit")}
              </Link>
            ) : null}
          </div>
          <button
            type="button"
            className="btn-secondary shrink-0 px-4 xl:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? t("design.closeMenu") : t("design.openMenu")}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t("design.closeShort") : t("design.menuShort")}
          </button>
        </div>
        {open ? (
          <nav id="site-menu" className="container-page flex flex-col gap-1 pb-5 xl:hidden">
            <Links items={primary} pathname={location.pathname} onVideo={false} onNavigate={() => setOpen(false)} />
            <a href="/#savoirs" className={itemClass(location.hash === "#savoirs", false)} onClick={() => setOpen(false)}>
              {t("nav.explore")}
            </a>
            <a href="/#parcours" className={itemClass(location.hash === "#parcours", false)} onClick={() => setOpen(false)}>
              {t("nav.how")}
            </a>
            {!loading && user ? <Links items={atelier} pathname={location.pathname} onVideo={false} onNavigate={() => setOpen(false)} /> : null}
            {!loading && user ? (
              <NavLink to="/profile" onClick={() => setOpen(false)} className={({ isActive }) => itemClass(isActive, false)}>
                {t("design.profile")}
              </NavLink>
            ) : null}
            {!loading && !user ? (
              <NavLink to="/login" onClick={() => setOpen(false)} className={({ isActive }) => itemClass(isActive, false)}>
                {t("nav.login")}
              </NavLink>
            ) : null}
            <div className="pt-3">
              <LanguageSwitcher />
            </div>
            {!loading ? (
              <Link className="btn mt-3" to={transmitTo} onClick={() => setOpen(false)}>
                {t("nav.transmit")}
              </Link>
            ) : null}
            {user ? (
              <button type="button" className="mt-2 rounded-full px-3 py-2 text-start text-sm" onClick={logout}>
                {t("nav.logout")}
              </button>
            ) : null}
          </nav>
        ) : null}
      </header>
      <main id="content" className="flex-1">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="bg-forest text-cream">
        <div className="h-px bg-gold" />
        <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[auto_1.3fr_0.8fr_0.9fr] lg:items-start lg:gap-10">
          <div className="rounded-[1.6rem] bg-cream px-5 py-2.5 sm:col-span-2 lg:col-span-1 lg:justify-self-start">
            <img src="/images/rawi-logo.png" alt="RAWI راوي" className="h-20 w-auto" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold rtl:tracking-normal">{t("footer.aboutTitle")}</p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-cream/90">{t("footer.about")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold rtl:tracking-normal">{t("footer.browseTitle")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="text-cream/90 hover:text-cream" href="/#savoirs">
                  {t("nav.explore")}
                </a>
              </li>
              <li>
                <a className="text-cream/90 hover:text-cream" href="/#parcours">
                  {t("nav.how")}
                </a>
              </li>
              <li>
                <a className="text-cream/90 hover:text-cream" href="/#botanique">
                  {t("footer.botanical")}
                </a>
              </li>
              <li>
                <Link className="text-cream/90 hover:text-cream" to="/categories">
                  {t("nav.categories")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold rtl:tracking-normal">{t("footer.shareTitle")}</p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-cream/90">{t("footer.share")}</p>
            <Link className="btn-light mt-4" to={transmitTo}>
              {t("nav.transmit")}
            </Link>
          </div>
        </div>
        <div className="border-t border-cream/15">
          <p className="container-page py-4 text-center text-xs leading-6 text-cream/75">{t("footer.disclaimer")}</p>
        </div>
      </footer>
    </div>
  );
}
