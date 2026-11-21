import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
const STEPS = ["collect", "compare", "review", "recipe", "guide"] as const;

function stepHref(step: (typeof STEPS)[number]) {
  if (step === "collect") return "/transmettre";
  if (step === "compare") return "/modules/analysis";
  if (step === "review") return "/modules/validation";
  if (step === "recipe") return "/modules/recipes";
  return "/modules/guide";
}

function StageVisual({ step }: { step: (typeof STEPS)[number] }) {
  const { t } = useTranslation();
  if (step === "collect") {
    return (
      <div className="space-y-3" aria-hidden="true">
        <div className="h-3 w-2/3 bg-line" />
        <div className="h-16 border border-line" />
        <p className="flex items-center gap-2 text-sm text-forest">
          <span className="inline-block h-4 w-4 border border-forest bg-forest" />
          {t("heritage.stepCollectVisual")}
        </p>
      </div>
    );
  }
  if (step === "compare") {
    return (
      <div className="grid grid-cols-2 gap-3" aria-hidden="true">
        {["A", "B"].map((mark) => (
          <div key={mark} className="border border-line p-3">
            <p className="text-xs text-clay-ink">{t("heritage.stepCompareVisual")} {mark}</p>
            <div className="mt-3 space-y-2">
              <div className="h-2 bg-line" />
              <div className="h-2 w-4/5 bg-line" />
              <div className="h-2 w-2/3 bg-line" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (step === "review") {
    return (
      <div aria-hidden="true">
        <span className="inline-block bg-gold/40 px-3 py-1 text-sm text-clay-ink">{t("status.pending")}</span>
        <div className="mt-4 h-2 w-1/2 bg-line" />
      </div>
    );
  }
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="h-3 w-1/2 bg-forest/30" />
      <div className="h-2 bg-line" />
      <div className="h-2 w-4/5 bg-line" />
      <div className="h-2 w-3/5 bg-line" />
    </div>
  );
}

export function KnowledgeJourney() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!forward && !backward) return;
    event.preventDefault();
    const rtl = document.documentElement.dir === "rtl";
    const delta = (forward ? 1 : -1) * (rtl && event.key.startsWith("Arrow") && event.key !== "ArrowDown" && event.key !== "ArrowUp" ? -1 : 1);
    const next = (index + delta + STEPS.length) % STEPS.length;
    setIndex(next);
    document.getElementById(`journey-tab-${next}`)?.focus();
  }

  return (
    <div>
      <div className="relative" role="tablist" aria-label={t("heritage.journeyTitle")} onKeyDown={onKey}>
        <div className="absolute inset-x-0 top-5 hidden h-px bg-line lg:block" aria-hidden="true">
          <div
            className="h-px origin-left bg-forest rtl:origin-right"
            style={{ transform: `scaleX(${index / (STEPS.length - 1)})` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((item, stepIndex) => {
            const active = stepIndex === index;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                id={`journey-tab-${stepIndex}`}
                aria-selected={active}
                aria-controls="journey-panel"
                tabIndex={active ? 0 : -1}
                className="relative px-2 py-3 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                onClick={() => setIndex(stepIndex)}
              >
                <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm ${active ? "border-forest bg-forest text-cream" : "border-line bg-cream text-ink"}`}>
                  {String(stepIndex + 1).padStart(2, "0")}
                </span>
                <span className={`mt-3 block text-sm ${active ? "font-semibold text-forest" : "text-ink"}`}>{t(`heritage.step${item[0].toUpperCase()}${item.slice(1)}`)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          id="journey-panel"
          role="tabpanel"
          aria-labelledby={`journey-tab-${index}`}
          className="mt-8 grid items-center gap-8 border border-line bg-paper p-5 sm:p-8 lg:grid-cols-2"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.28 }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-clay-ink rtl:tracking-normal">{t("heritage.demoMark")}</p>
            <div className="mt-5">
              <StageVisual step={step} />
            </div>
          </div>
          <div>
            <h3 className="entry-title mt-0">{t(`heritage.step${step[0].toUpperCase()}${step.slice(1)}`)}</h3>
            <p className="mt-4 text-base leading-7 text-muted">{t(`heritage.step${step[0].toUpperCase()}${step.slice(1)}Text`)}</p>
            <Link className="btn mt-6" to={stepHref(step)}>{t("heritage.openStep")}</Link>
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="mt-6 max-w-xl text-sm leading-6 text-muted">{t("heritage.reviewNote")}</p>
    </div>
  );
}
