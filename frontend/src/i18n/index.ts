import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import ary from "./locales/ary.json";
import fr from "./locales/fr.json";

const stored = localStorage.getItem("rawi_lang");
const initial = stored === "ar" || stored === "ary" || stored === "fr" ? stored : "fr";

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
    ary: { translation: ary },
  },
  lng: initial,
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
