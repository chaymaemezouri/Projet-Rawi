import { useTranslation } from "react-i18next";

export function HeritageAudio() {
  const { t } = useTranslation();
  return (
    <div className="mt-8 border border-cream/20 p-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cream/30 text-cream/50"
          disabled
          aria-disabled="true"
          aria-label={t("heritage.audioEmpty")}
        >
          <span className="ms-0.5 border-y-[6px] border-s-[9px] border-y-transparent border-s-current" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="h-px bg-cream/25" aria-hidden="true" />
          <p className="mt-3 text-sm leading-6 text-cream/80">{t("heritage.audioEmpty")}</p>
        </div>
      </div>
    </div>
  );
}
