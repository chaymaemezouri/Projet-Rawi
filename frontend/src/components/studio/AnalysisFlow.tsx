import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ModuleInfo } from "../../types";

export interface FlowStage {
  id: string;
  label: string;
  moduleKey: string | null;
}

export function AnalysisFlow({
  stages,
  modules,
  disclaimer,
}: {
  stages: FlowStage[];
  modules: Record<string, ModuleInfo> | undefined;
  disclaimer?: string;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const stage = stages[index];
  if (!stage) return null;
  const module = stage.moduleKey ? modules?.[stage.moduleKey] : undefined;

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!forward && !backward) return;
    event.preventDefault();
    const rtl = document.documentElement.dir === "rtl";
    const delta = (forward ? 1 : -1) * (rtl && (event.key === "ArrowRight" || event.key === "ArrowLeft") ? -1 : 1);
    const next = (index + delta + stages.length) % stages.length;
    setIndex(next);
    document.getElementById(`stage-tab-${stages[next].id}`)?.focus();
  }

  return (
    <section className="card" aria-label={t("design.processTitle")}>
      <p className="kicker">{t("design.demoBadge")}</p>
      <h2 className="mt-3 text-4xl">{t("design.processTitle")}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t("design.processLead")}</p>
      <p className="mt-2 text-sm text-muted">{t("design.stageHint")}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-5" role="tablist" aria-label={t("design.processTitle")} onKeyDown={move}>
        {stages.map((item, itemIndex) => {
          const active = itemIndex === index;
          return (
            <button
              key={item.id}
              id={`stage-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              className={`rounded-2xl border px-3 py-4 text-start transition ${active ? "border-forest bg-forest text-cream" : "border-line bg-cream/50 text-ink hover:border-forest"}`}
              onClick={() => setIndex(itemIndex)}
            >
              <span className={`block font-serif text-2xl ${active ? "text-gold" : "text-clay-ink"}`}>
                {String(itemIndex + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 rounded-[1.5rem] border border-line bg-cream/40 p-5" role="tabpanel" aria-labelledby={`stage-tab-${stage.id}`}>
        <h3 className="text-3xl">{stage.label}</h3>
        {module ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-clay-ink">{t("design.realStatus")}</p>
            <p className="text-sm text-muted">{module.status}</p>
            <p>{module.message}</p>
            <p className="text-sm text-muted">{t("module.noScore")}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p>{t("story.validationHelp")}</p>
            <p className="text-sm text-muted">{t("design.noResult")}</p>
            <Link className="btn-secondary" to="/stories?status=pending">
              {t("design.openReview")}
            </Link>
          </div>
        )}
        {disclaimer ? <p className="mt-4 border-s-2 border-gold ps-3 text-sm text-muted">{disclaimer}</p> : null}
      </div>
    </section>
  );
}
