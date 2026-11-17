import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "fr", label: "Français", short: "FR" },
  { code: "ar", label: "العربية", short: "AR" },
  { code: "ary", label: "الدارجة", short: "Darija" },
] as const;

function EarthMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.75c2.15 2.35 3.25 5.15 3.25 8.25S14.15 17.9 12 20.25C9.85 17.9 8.75 15.1 8.75 12S9.85 6.1 12 3.75Z" />
    </svg>
  );
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = i18n.resolvedLanguage || i18n.language;
  const currentLabel = LANGUAGES.find((language) => language.code === current)?.label ?? LANGUAGES[0].label;

  function choose(code: string) {
    void i18n.changeLanguage(code);
    localStorage.setItem("rawi_lang", code);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!compact) {
    return (
      <div className="flex rounded-full border border-line bg-cream p-1" role="group" aria-label={t("design.language")}>
        {LANGUAGES.map((language) => {
          const active = current === language.code;
          return (
            <button
              key={language.code}
              type="button"
              aria-label={language.label}
              aria-pressed={active}
              className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-forest text-cream" : "text-muted"}`}
              onClick={() => choose(language.code)}
            >
              {language.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-forest"
        aria-label={`${t("design.language")} : ${currentLabel}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <EarthMark />
      </button>
      {open ? (
        <div className="absolute end-0 z-20 mt-2 min-w-36 rounded-2xl border border-line bg-paper p-1 shadow-card" role="listbox" aria-label={t("design.language")}>
          {LANGUAGES.map((language) => {
            const active = current === language.code;
            return (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={active}
                className={`block w-full rounded-xl px-3 py-2 text-start text-sm ${active ? "bg-forest text-cream" : "text-ink hover:bg-cream"}`}
                onClick={() => choose(language.code)}
              >
                {language.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
