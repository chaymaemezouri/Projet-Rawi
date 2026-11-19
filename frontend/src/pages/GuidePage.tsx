import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api/client";
import { fetchGuide, fetchGuides, reviewGuideSafety, startGuide } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { ErrorState, SectionHeading } from "../components/ui/Chrome";
import { moveStep, progress, timerTick } from "../guide/steps";
import { formatCount } from "../lib/format";
import type { GuideView } from "../types";

export function GuidePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const client = useQueryClient();
  const [selected, setSelected] = useState("");
  const [practicing, setPracticing] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const guides = useQuery({ queryKey: ["guides"], queryFn: fetchGuides });
  const guide = useQuery({ queryKey: ["guide", selected], queryFn: () => fetchGuide(selected), enabled: Boolean(selected) });
  const begin = useMutation({
    mutationFn: (view: GuideView) => startGuide(view.recipe_id, view.version),
    onSuccess: async (view) => {
      setPracticing(true);
      setError("");
      client.setQueryData(["guide", view.recipe_id], view);
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });
  const safety = useMutation({
    mutationFn: (decision: string) => reviewGuideSafety(selected, decision, note),
    onSuccess: async () => {
      setNote("");
      setError("");
      await client.invalidateQueries({ queryKey: ["guide", selected] });
      await client.invalidateQueries({ queryKey: ["guides"] });
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });
  const canReview = user?.role === "validator" || user?.role === "admin";

  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading as="h1" kicker={t("guide.kicker")} title={t("guide.title")} text={t("guide.lead")} />
      <h2 className="section-title">{t("guide.list")}</h2>
      {guides.isLoading ? <div className="mt-4 h-32 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
      {guides.isError ? <div className="mt-4"><ErrorState label={t("common.error")} /></div> : null}
      {guides.data && guides.data.items.length === 0 ? <p className="mt-4 text-sm text-muted">{t("guide.empty")}</p> : null}
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {guides.data?.items.map((item) => (
          <li key={item.recipe_id}>
            <button className={`card h-full w-full text-start ${selected === item.recipe_id ? "border-forest" : ""}`} type="button" onClick={() => { setSelected(item.recipe_id); setPracticing(false); setError(""); }}>
              <span className="font-serif text-2xl leading-tight text-ink" dir="auto">{item.title}</span>
              <span className="mt-2 block text-sm leading-6 text-muted">{item.practical_allowed ? t("guide.practical") : t("guide.documentary")}</span>
            </button>
          </li>
        ))}
      </ul>
      {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}
      {guide.isLoading ? <div className="mt-6 h-48 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
      {guide.isError ? <div className="mt-6"><ErrorState label={t("common.error")} /></div> : null}
      {guide.data && !practicing ? (
        <Documentary view={guide.data} canReview={canReview} note={note} setNote={setNote} busy={begin.isPending || safety.isPending} onStart={() => begin.mutate(guide.data)} onSafety={(decision) => safety.mutate(decision)} />
      ) : null}
      {guide.data && practicing ? <Practice view={guide.data} onExit={() => setPracticing(false)} /> : null}
    </section>
  );
}

function Ornament() {
  return (
    <svg className="h-24 w-24 text-gold" viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M40 18c8 10 8 18 0 28-8-10-8-18 0-28z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function Documentary({
  view,
  canReview,
  note,
  setNote,
  busy,
  onStart,
  onSafety,
}: {
  view: GuideView;
  canReview: boolean;
  note: string;
  setNote: (value: string) => void;
  busy: boolean;
  onStart: () => void;
  onSafety: (decision: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[auto_1fr]">
      <article className="card flex items-center justify-center">
        <Ornament />
      </article>
      <article className="card">
        <p className="text-sm leading-6 text-muted">{view.notice}</p>
        <h2 className="entry-title" dir="auto">{view.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{t("guide.safety")} : {t(`guide.${view.safety}`, view.safety)}</p>
        <h3 className="block-title">{t("guide.ingredients")}</h3>
        {view.ingredients.map((item) => <p key={item.canonical} className="mt-2 text-sm leading-6" dir="auto">{item.canonical} · {item.stories.map((story) => story.passage).join(" / ")}</p>)}
        <h3 className="block-title">{t("guide.quantities")}</h3>
        <p className="mt-2 text-sm leading-6" dir="auto">{view.quantities.length ? view.quantities.map((item) => item.passage).join(" · ") : t("guide.missing")}</p>
        <h3 className="block-title">{t("guide.precautions")}</h3>
        <p className="mt-2 text-sm leading-6" dir="auto">{view.precautions.length ? view.precautions.map((item) => item.passage).join(" · ") : t("guide.missing")}</p>
        <h3 className="block-title">{t("guide.sources")}</h3>
        {view.sources.map((source) => <p key={source.id} className="mt-2 text-sm leading-6" dir="auto">{source.title} · {t("recipe.version", { version: source.revision })} · {t("recipe.approval", { kind: t(`recipe.${source.approval}`, source.approval) })}</p>)}
        <div className="mt-6 flex flex-wrap gap-2">
          <button className="btn" type="button" disabled={!view.practical_allowed || busy} onClick={onStart}>{t("guide.start")}</button>
          <Link className="btn-secondary" to="/modules/recipes">{t("guide.back")}</Link>
        </div>
        {!view.practical_allowed ? <p className="mt-3 text-sm text-muted">{t("guide.blocked")}</p> : null}
        {canReview && view.status === "published" && !view.stale ? (
          <form className="mt-6 space-y-3" onSubmit={(event) => event.preventDefault()}>
            <label className="block text-sm">
              <span className="text-muted">{t("guide.safetyNote")}</span>
              <textarea className="field mt-2 min-h-24" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" type="button" disabled={busy || note.trim().length < 3} onClick={() => onSafety("approved")}>{t("guide.approve")}</button>
              <button className="btn-secondary" type="button" disabled={busy || note.trim().length < 3} onClick={() => onSafety("rejected")}>{t("guide.reject")}</button>
            </div>
          </form>
        ) : null}
      </article>
    </div>
  );
}

function Practice({ view, onExit }: { view: GuideView; onExit: () => void }) {
  const { t, i18n } = useTranslation();
  const steps = view.steps;
  const [index, setIndex] = useState(0);
  const timed = view.durations.find((item) => item.seconds !== null) ?? null;
  const [remaining, setRemaining] = useState(timed?.seconds ?? 0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setRemaining((current) => timerTick(current, true)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const finished = steps.length > 0 && index === steps.length - 1;
  return (
    <div className="mt-8">
      <article className="card transition-opacity duration-300">
        <div className="flex items-center justify-between gap-4">
          <Ornament />
          <p className="text-sm text-muted">{steps.length ? `${index + 1} / ${steps.length}` : t("guide.missing")}</p>
        </div>
        <div
          className="mt-4 h-2 rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress(index, steps.length)}
          aria-label={t("guide.title")}
        >
          <div className="h-2 rounded-full bg-forest transition-all duration-300" style={{ width: `${progress(index, steps.length)}%` }} />
        </div>
        <h2 className="entry-title" dir="auto">{view.title}</h2>
        {steps.length ? <p className="mt-4 font-serif text-2xl leading-8 text-ink" dir="auto">{steps[index].passage}</p> : <p className="mt-4 text-sm text-muted">{t("guide.missing")}</p>}
        <p className="mt-3 text-sm leading-6 text-muted" dir="auto">{steps[index]?.title}</p>
        {timed ? (
          <div className="mt-6">
            <p className="text-sm" dir="auto">{timed.passage}</p>
            <p className="mt-2 font-serif text-4xl" role="timer" aria-live="polite" aria-atomic="true">
              {formatCount(remaining, i18n.language)} <span className="text-base text-muted">{t("guide.seconds")}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn" type="button" aria-pressed={running} onClick={() => setRunning((current) => !current)}>{running ? t("guide.pause") : t("guide.resume")}</button>
              <button className="btn-secondary" type="button" onClick={() => { setRunning(false); setRemaining(timed.seconds ?? 0); }}>{t("guide.reset")}</button>
            </div>
          </div>
        ) : <p className="mt-6 text-sm text-muted">{t("guide.noTimer")}</p>}
        {view.precautions.length ? <><h3 className="block-title">{t("guide.precautions")}</h3><p className="mt-2 text-sm leading-6" dir="auto">{view.precautions.map((item) => item.passage).join(" · ")}</p></> : null}
      </article>
      <div className="sticky bottom-4 mt-4 flex flex-wrap gap-2 rounded-[1.5rem] border border-line bg-paper p-3">
        <button className="btn-secondary" type="button" onClick={() => setIndex((current) => moveStep(current, steps.length, -1))}>{t("guide.previous")}</button>
        <button className="btn" type="button" onClick={() => setIndex((current) => moveStep(current, steps.length, 1))}>{t("guide.next")}</button>
        {finished ? <button className="btn-secondary" type="button" onClick={onExit}>{t("guide.finish")}</button> : null}
      </div>
    </div>
  );
}
