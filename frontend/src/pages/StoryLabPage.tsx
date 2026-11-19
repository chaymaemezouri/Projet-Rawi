import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ApiError } from "../api/client";
import { correctAnalysis, fetchAnalysis, fetchStory, fetchStoryMedia, runAnalysis, transcribeMedia } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { ErrorState, SectionHeading } from "../components/ui/Chrome";
import type { AnalysisSpan, StoryAnalysis } from "../types";

function line(item: AnalysisSpan) {
  const label = item.corrected || item.canonical || item.surface || item.text || "";
  const quote = item.surface && item.surface !== label ? ` « ${item.surface} »` : "";
  const unit = item.unit_surface ? ` ${item.unit_surface}` : "";
  return `${label}${unit}${quote}`;
}

export function StoryLabPage() {
  const { t } = useTranslation();
  const { storyId = "" } = useParams();
  const { user } = useAuth();
  const client = useQueryClient();
  const [target, setTarget] = useState("classification");
  const [action, setAction] = useState("reject");
  const [replacement, setReplacement] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const story = useQuery({ queryKey: ["story", storyId], queryFn: () => fetchStory(storyId), enabled: Boolean(storyId) });
  const analysis = useQuery({
    queryKey: ["analysis", storyId],
    enabled: Boolean(storyId),
    queryFn: async () => {
      try {
        return await fetchAnalysis(storyId);
      } catch (reason) {
        if (reason instanceof ApiError && reason.status === 404) return null;
        throw reason;
      }
    },
  });
  const canReview = Boolean(user && story.data && (user.id === story.data.created_by.id || user.role === "admin" || (user.role === "validator" && story.data.workflow_status !== "draft")));
  const canFiles = Boolean(user && story.data && (user.id === story.data.created_by.id || user.role === "admin" || (user.role === "validator" && story.data.workflow_status !== "draft")));
  const media = useQuery({ queryKey: ["media", storyId], queryFn: () => fetchStoryMedia(storyId), enabled: canFiles });
  const refresh = () => client.invalidateQueries({ queryKey: ["analysis", storyId] });
  const run = useMutation({
    mutationFn: () => runAnalysis(storyId),
    onSuccess: () => {
      setError("");
      refresh();
    },
    onError: () => setError(t("common.error")),
  });
  const save = useMutation({
    mutationFn: () => correctAnalysis(storyId, { target_id: target, action, replacement: replacement || undefined, note }),
    onSuccess: () => {
      setNote("");
      setReplacement("");
      setError("");
      refresh();
    },
    onError: () => setError(t("common.error")),
  });
  const transcribe = useMutation({
    mutationFn: (mediaId: string) => transcribeMedia(storyId, mediaId),
    onSuccess: () => client.invalidateQueries({ queryKey: ["media", storyId] }),
  });

  const data = analysis.data;
  const options = data ? targets(data) : [];

  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading as="h1" kicker={t("lab.kicker")} title={story.data?.title || t("lab.title")} text={t("lab.lead")} />
      <Link className="mt-4 inline-block text-sm text-forest" to={`/stories/${storyId}`}>{t("story.back")}</Link>
      {story.isLoading || analysis.isLoading ? <div className="mt-6 h-64 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
      {story.isError || analysis.isError ? <div className="mt-6"><ErrorState label={t("common.error")} /></div> : null}
      {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}
      {story.data ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="card">
            <h2 className="section-title mt-0">{t("lab.original")}</h2>
            <p className="mt-4 whitespace-pre-wrap leading-7" dir="auto">{story.data.original_content}</p>
            {canFiles ? (
              <div className="mt-6 space-y-3">
                <h3 className="block-title">{t("lab.audio")}</h3>
                {media.data?.filter((item) => item.kind === "audio").map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line p-3 text-sm">
                    <p>{item.original_name}</p>
                    <p className="mt-1 text-muted">{item.transcript?.status || t("module.unavailable")}</p>
                    {item.transcript?.message ? <p className="mt-1" role={item.transcript.status === "unavailable" || item.transcript.status === "failed" ? "alert" : "status"}>{item.transcript.message}</p> : null}
                    {item.transcript?.raw_text ? <p className="mt-2" dir="auto"><span className="text-muted">{t("lab.raw")} : </span>{item.transcript.raw_text}</p> : null}
                    {item.transcript?.corrected_text ? <p className="mt-2" dir="auto"><span className="text-muted">{t("lab.corrected")} : </span>{item.transcript.corrected_text}</p> : null}
                    <button className="btn-secondary mt-3" type="button" onClick={() => transcribe.mutate(item.id)}>{t("lab.transcribe")}</button>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
          <article className="card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title mt-0">{t("lab.findings")}</h2>
              {canReview ? <button className="btn" type="button" disabled={run.isPending} onClick={() => run.mutate()}>{t("lab.run")}</button> : null}
            </div>
            {!data ? <p className="mt-4 text-sm text-muted">{t("lab.empty")}</p> : <Findings analysis={data} />}
          </article>
          <article className="card">
            <h2 className="section-title mt-0">{t("lab.review")}</h2>
            {data && canReview ? (
              <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
                <label className="block"><span className="label">{t("lab.target")}</span>
                  <select className="field" value={target} onChange={(event) => setTarget(event.target.value)}>
                    <option value="classification">{t("lab.classification")}</option>
                    {options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label className="block"><span className="label">{t("lab.action")}</span>
                  <select className="field" value={action} onChange={(event) => setAction(event.target.value)}>
                    <option value="reject">{t("lab.reject")}</option>
                    <option value="replace">{t("lab.replace")}</option>
                  </select>
                </label>
                {action === "replace" ? (
                  <label className="block"><span className="label">{t("lab.replacement")}</span>
                    <input className="field" value={replacement} onChange={(event) => setReplacement(event.target.value)} />
                  </label>
                ) : null}
                <label className="block"><span className="label">{t("lab.note")}</span>
                  <textarea className="field min-h-24" required minLength={3} value={note} onChange={(event) => setNote(event.target.value)} />
                </label>
                <button className="btn" type="submit" disabled={save.isPending}>{t("lab.save")}</button>
              </form>
            ) : null}
            {data && data.corrections.length > 0 ? (
              <div className="mt-6">
                <h3 className="block-title">{t("lab.history")}</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {data.corrections.map((item) => (
                    <li key={item.id} className="rounded-2xl border border-line p-3">{item.action} · {item.target_id} · {item.note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        </div>
      ) : null}
    </section>
  );
}

function targets(analysis: StoryAnalysis) {
  const groups = [
    ...analysis.extractions.ingredients,
    ...analysis.extractions.quantities,
    ...analysis.extractions.steps,
    ...analysis.extractions.durations,
    ...analysis.extractions.precautions,
  ];
  return groups.map((item) => ({ id: item.id, label: line(item) }));
}

function Findings({ analysis }: { analysis: StoryAnalysis }) {
  const { t } = useTranslation();
  const blocks = [
    [t("lab.ingredients"), analysis.extractions.ingredients],
    [t("lab.quantities"), analysis.extractions.quantities],
    [t("lab.steps"), analysis.extractions.steps],
    [t("lab.durations"), analysis.extractions.durations],
    [t("lab.precautions"), analysis.extractions.precautions],
  ] as const;
  return (
    <div className="mt-4 space-y-4 text-sm leading-6">
      <p className="text-muted">{analysis.note} · {analysis.engine} {analysis.engine_version} · {t("collect.version", { number: analysis.story_revision })}</p>
      <p>
        {analysis.classification.status === "uncertain" ? t("lab.uncertain") : t("lab.proposed")}
        {analysis.classification.category_slug ? ` · ${analysis.classification.category_slug}` : ""}
      </p>
      <p>{analysis.classification.justification}</p>
      {analysis.classification.passages.length > 0 ? <p className="text-muted">{t("lab.passages")} : {analysis.classification.passages.map((item) => item.text).join("، ")}</p> : null}
      {blocks.map(([title, items]) => (
        <div key={title}>
          <h3 className="block-title mt-0">{title}</h3>
          {items.length === 0 ? <p className="text-muted">{t("lab.none")}</p> : (
            <ul>{items.map((item) => <li key={item.id} dir="auto">{line(item)}</li>)}</ul>
          )}
        </div>
      ))}
    </div>
  );
}
