import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

function Logo() {
  return (
    <span className="flex items-center gap-3">
      <svg viewBox="0 0 48 48" className="h-10 w-10 text-forest" aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" rx="8" fill="currentColor" />
        <path d="M24 10 28.2 19.8 38 24 28.2 28.2 24 38 19.8 28.2 10 24 19.8 19.8Z" fill="#faf4ea" />
        <path d="M24 18 26 22.2 30.2 24 26 25.8 24 30 22 25.8 17.8 24 22 22.2Z" fill="#c8793a" />
      </svg>
      <span>
        <span className="block font-serif text-xl leading-none tracking-wide">RAWI</span>
        <span className="block text-sm text-clay" lang="ar">
          راوي
        </span>
      </span>
    </span>
  );
}

export function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

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

  const links = user
    ? [
        ["/dashboard", t("nav.dashboard")],
        ["/stories", t("nav.stories")],
        ["/stories/new", t("nav.newStory")],
        ["/categories", t("nav.categories")],
        ["/modules/ai", t("nav.ai")],
        ["/modules/analysis", t("nav.analysis")],
        ["/modules/validation", t("nav.validation")],
        ["/modules/recipes", t("nav.recipes")],
      ]
    : [
        ["/", t("nav.home")],
        ["/categories", t("nav.categories")],
        ["/login", t("nav.login")],
        ["/register", t("nav.register")],
      ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-paper/90 backdrop-blur">
        <div className="h-1 bg-gradient-to-l from-forest via-clay to-forest" />
        <div className="container-page flex items-center justify-between gap-4 py-4">
          <NavLink to="/" className="shrink-0" onClick={() => setOpen(false)}>
            <Logo />
          </NavLink>
          <div className="hidden items-center gap-4 lg:flex">
            <nav className="flex flex-wrap items-center gap-1">
              {links.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-sm ${isActive ? "bg-forest text-white" : "text-ink hover:bg-cream"}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <LanguageSwitcher />
            {user ? (
              <button type="button" className="btn-secondary" onClick={logout}>
                {t("nav.logout")}
              </button>
            ) : null}
          </div>
          <button type="button" className="btn-secondary lg:hidden" onClick={() => setOpen((value) => !value)}>
            Menu
          </button>
        </div>
        {open ? (
          <nav className="container-page flex flex-col gap-2 pb-4 lg:hidden">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-cream">
                {label}
              </NavLink>
            ))}
            <LanguageSwitcher />
            {user ? (
              <button type="button" className="btn-secondary" onClick={logout}>
                {t("nav.logout")}
              </button>
            ) : null}
          </nav>
        ) : null}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-paper">
        <p className="container-page py-6 text-sm text-muted">{t("footer.disclaimer")}</p>
      </footer>
    </div>
  );
}
