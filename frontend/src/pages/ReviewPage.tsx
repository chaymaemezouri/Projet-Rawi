import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api/client";
import { fetchReviewDossier, fetchReviewQueue, requestCorrection, submitReview } from "../api/resources";
import { ErrorState, SectionHeading } from "../components/ui/Chrome";
import type { ReviewDossier } from "../types";

const FILTERS = ["", "pending", "correction_requested", "validated", "rejected"] as const;

export function ReviewPage() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [selected, setSelected] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const queue = useQuery({ queryKey: ["review-queue", filter], queryFn: () => fetchReviewQueue(filter) });
  const dossier = useQuery({
    queryKey: ["review-dossier", selected],
    queryFn: () => fetchReviewDossier(selected),
    enabled: Boolean(selected),
  });
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: ["review-queue"] });
    if (selected) await client.invalidateQueries({ queryKey: ["review-dossier", selected] });
  };
  const action = useMutation({
    mutationFn: (decision: string) => submitReview(selected, decision, comment),
    onSuccess: async () => {
      setComment("");
      setError("");
      await refresh();
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });
  const correction = useMutation({
    mutationFn: () => requestCorrection(selected, comment),
    onSuccess: async () => {
      setComment("");
      setError("");
      await refresh();
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading as="h1" kicker={t("review.kicker")} title={t("review.title")} text={t("review.lead")} />
      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button key={item || "all"} className={filter === item ? "btn" : "btn-secondary"} type="button" onClick={() => setFilter(item)}>
            {item ? t(`review.${item}`) : t("compare.all")}
            {item && queue.data ? ` ${queue.data.counts[item] ?? 0}` : ""}
          </button>
        ))}
      </div>
      <h2 className="section-title">{t("review.queue")}</h2>
      {queue.isLoading ? <div className="mt-4 h-40 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
      {queue.isError ? <div className="mt-4"><ErrorState label={t("common.error")} /></div> : null}
      {queue.data && queue.data.items.length === 0 ? <p className="mt-4 text-sm text-muted">{t("review.empty")}</p> : null}
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {queue.data?.items.map((item) => (
          <li key={item.id}>
            <button className={`card h-full w-full text-start ${selected === item.id ? "border-forest" : ""}`} type="button" onClick={() => { setSelected(item.id); setError(""); }}>
              <span className="font-medium" dir="auto">{item.title}</span>
              <span className="mt-2 block text-sm text-muted">{t(`review.${item.validation_status}`, item.validation_status)} · {t("review.approvals", { count: item.approvals })} · {t("review.rejections", { count: item.rejections })}</span>
              {item.disagreement ? <span className="mt-2 block text-sm text-danger">{t("review.disagreement")}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}
      {dossier.isLoading ? <div className="mt-6 h-48 animate-pulse rounded-[1.75rem] bg-line/80" /> : null}
      {dossier.isError ? <div className="mt-6"><ErrorState label={t("common.error")} /></div> : null}
      {dossier.data ? <Dossier data={dossier.data} comment={comment} setComment={setComment} busy={action.isPending || correction.isPending} onDecision={(decision) => action.mutate(decision)} onCorrection={() => correction.mutate()} /> : null}
    </section>
  );
}

function Dossier({
  data,
  comment,
  setComment,
  busy,
  onDecision,
  onCorrection,
}: {
  data: ReviewDossier;
  comment: string;
  setComment: (value: string) => void;
  busy: boolean;
  onDecision: (decision: string) => void;
  onCorrection: () => void;
}) {
  const { t } = useTranslation();
  const story = data.story;
  const ingredients = data.analysis?.extractions.ingredients.map((item) => item.surface || item.canonical).filter(Boolean) ?? [];
  const shared = data.comparison.common?.ingredients?.map((item) => item.canonical) ?? [];
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      <article className="card lg:col-span-2">
        <p className="text-sm">{data.notice}</p>
        {data.disagreement ? <p role="status" className="mt-3 text-sm text-danger">{t("review.disagreement")}</p> : null}
        <p className="mt-2 text-sm text-muted">{t("review.revision", { version: data.revision })} · {t("review.approvals", { count: data.approvals })} · {t("review.rejections", { count: data.rejections })}</p>
      </article>
      <article className="card">
        <h2 className="section-title mt-0">{t("review.original")}</h2>
        <p className="mt-4 whitespace-pre-wrap leading-7" dir="auto">{story.original_content}</p>
      </article>
      <article className="card">
        <h2 className="section-title mt-0">{t("review.provenance")}</h2>
        <p className="mt-4 text-sm" dir="auto">{story.origin_place || t("review.unknown")}</p>
        <p className="mt-2 text-sm" dir="auto">{story.transmission_note || t("review.unknown")}</p>
        <p className="mt-2 text-sm">{story.collected_on || t("review.unknown")}</p>
        <h2 className="section-title">{t("review.files")}</h2>
        {data.media.length ? data.media.map((item) => <p key={item.id} className="mt-3 text-sm" dir="auto">{item.kind} · {item.original_name}</p>) : <p className="mt-3 text-sm text-muted">{t("review.noFiles")}</p>}
      </article>
      <article className="card">
        <h2 className="section-title mt-0">{t("review.analysis")}</h2>
        {data.analysis ? <p className="mt-4 text-sm" dir="auto">{data.analysis.classification.status}{ingredients.length ? ` · ${ingredients.join(", ")}` : ""}</p> : <p className="mt-4 text-sm text-muted">{t("review.noAnalysis")}</p>}
        <h2 className="section-title">{t("review.comparison")}</h2>
        <p className="mt-3 text-sm">{data.comparison.status === "insufficient" ? t("compare.insufficient") : shared.join(", ") || t("review.empty")}</p>
      </article>
      <article className="card">
        <h2 className="section-title mt-0">{t("review.history")}</h2>
        {data.reviews.length === 0 ? <p className="mt-4 text-sm text-muted">{t("review.noHistory")}</p> : null}
        <ul className="mt-4 space-y-3 text-sm">
          {data.reviews.map((item) => (
            <li key={item.id} dir="auto">
              <span className="font-medium">{t(`review.${item.decision === "approved" ? "approve" : item.decision === "rejected" ? "reject" : item.decision === "comment" ? "comment" : "correct"}`)}</span>
              {" · "}{item.reviewer_name} · {t("review.revision", { version: item.story_revision })} · {item.current ? t("review.current") : t("review.previous")}
              {item.comment ? <span className="mt-1 block">« {item.comment} »</span> : null}
            </li>
          ))}
        </ul>
        <form className="mt-6 space-y-3" onSubmit={(event) => event.preventDefault()}>
          <label className="block text-sm">
            <span className="text-muted">{t("review.note")}</span>
            <textarea className="field mt-2 min-h-24" value={comment} onChange={(event) => setComment(event.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className="btn" type="button" disabled={busy} onClick={() => onDecision("approved")}>{t("review.approve")}</button>
            <button className="btn-secondary" type="button" disabled={busy} onClick={() => onDecision("rejected")}>{t("review.reject")}</button>
            <button className="btn-secondary" type="button" disabled={busy || comment.trim().length < 3} onClick={onCorrection}>{t("review.correct")}</button>
            <button className="btn-secondary" type="button" disabled={busy || comment.trim().length < 3} onClick={() => onDecision("comment")}>{t("review.comment")}</button>
          </div>
        </form>
      </article>
    </div>
  );
}
