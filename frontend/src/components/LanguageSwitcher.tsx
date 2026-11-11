import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "ary", label: "الدارجة" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex rounded-full border border-line bg-paper p-1" role="group" aria-label="language">
      {LANGUAGES.map((language) => {
        const active = i18n.language === language.code;
        return (
          <button
            key={language.code}
            type="button"
            className={`rounded-full px-3 py-1 text-sm ${active ? "bg-forest text-white" : "text-muted"}`}
            onClick={() => {
              void i18n.changeLanguage(language.code);
              localStorage.setItem("rawi_lang", language.code);
            }}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
