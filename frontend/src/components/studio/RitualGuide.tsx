import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface RitualStep {
  title: string;
  text: string;
  seconds: number;
}

function formatClock(total: number) {
  const safe = Math.max(0, total);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function RitualGuide() {
  const { t } = useTranslation();
  const raw = t("ritual.steps", { returnObjects: true });
  const steps: RitualStep[] = Array.isArray(raw) ? (raw as RitualStep[]) : [];
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 0);
  const [running, setRunning] = useState(false);
  const step = steps[index];

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  function go(next: number) {
    const bounded = Math.min(Math.max(next, 0), Math.max(steps.length - 1, 0));
    setRunning(false);
    setIndex(bounded);
    setRemaining(steps[bounded]?.seconds ?? 0);
  }

  if (!step) return null;
  const progress = steps.length ? (index + 1) / steps.length : 0;

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-line bg-paper shadow-card" aria-label={t("ritual.title")}>
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-64">
          <img src="/images/rawi-ritual.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="p-6 md:p-8">
          <p className="kicker">{t("design.demoBadge")}</p>
          <h2 className="mt-3 text-4xl">{t("ritual.title")}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{t("ritual.lead")}</p>
          <p className="mt-6 text-sm text-clay-ink">{t("ritual.progress", { current: index + 1, total: steps.length })}</p>
          <div className="mt-3 h-px w-full bg-line" aria-hidden="true">
            <div className="h-px origin-left bg-forest rtl:origin-right" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label={t("ritual.title")}>
            {steps.map((item, itemIndex) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                className={`rounded-full px-3 py-1.5 text-sm ${itemIndex === index ? "bg-forest text-cream" : "bg-cream text-ink"}`}
                onClick={() => go(itemIndex)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <h3 className="mt-6 text-3xl">{step.title}</h3>
          <p className="mt-3 max-w-xl leading-7 text-muted">{step.text}</p>
          <p className="mt-6 font-serif text-6xl tabular-nums leading-none text-forest">{formatClock(remaining)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn" type="button" aria-pressed={running} onClick={() => setRunning((value) => !value)}>
              {running ? t("ritual.pause") : t("ritual.start")}
            </button>
            <button className="btn-secondary" type="button" onClick={() => go(index)}>
              {t("ritual.reset")}
            </button>
            <button className="btn-secondary" type="button" onClick={() => go(index - 1)} disabled={index === 0}>
              {t("ritual.prev")}
            </button>
            <button className="btn-secondary" type="button" onClick={() => go(index + 1)} disabled={index === steps.length - 1}>
              {t("ritual.next")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
