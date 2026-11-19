import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../api/client";
import { fetchCorrections, fetchRevisions, requestCorrection } from "../../api/resources";
import { formatDate } from "../../lib/format";

export function CorrectionDesk({
  storyId,
  canAsk,
  canRead,
  originalContent,
}: {
  storyId: string;
  canAsk: boolean;
  canRead: boolean;
  originalContent: string;
}) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [compareId, setCompareId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const corrections = useQuery({
    queryKey: ["corrections", storyId],
    queryFn: () => fetchCorrections(storyId),
    enabled: canRead,
  });
  const revisions = useQuery({
    queryKey: ["revisions", storyId],
    queryFn: () => fetchRevisions(storyId),
    enabled: canRead,
  });
  const ask = useMutation({
    mutationFn: () => requestCorrection(storyId, comment),
    onSuccess: async () => {
      setComment("");
      setError("");
      setNotice(t("collect.correctionSent"));
      await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      await queryClient.invalidateQueries({ queryKey: ["corrections", storyId] });
      await queryClient.invalidateQueries({ queryKey: ["revisions", storyId] });
      await queryClient.invalidateQueries({ queryKey: ["my-corrections"] });
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  if (!canRead) return null;

  return (
    <section className="card space-y-4" aria-label={t("collect.correctionTitle")}>
      <h2 className="text-3xl">{t("collect.correctionTitle")}</h2>
      <p className="text-sm leading-6 text-muted">{t("collect.correctionLead")}</p>
      {corrections.data?.map((item) => (
        <article key={item.id} className="rounded-2xl bg-cream px-4 py-3 text-sm">
          <p className="font-medium">{item.status === "open" ? t("collect.correctionOpen") : t("collect.correctionAnswered")}</p>
          <p className="mt-2 leading-6">{item.comment}</p>
          <p className="mt-2 text-xs text-muted">{formatDate(item.created_at, i18n.language)}</p>
        </article>
      ))}
      {corrections.data && corrections.data.length === 0 ? <p className="text-sm text-muted">{t("collect.noCorrection")}</p> : null}
      {canAsk ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setNotice("");
            ask.mutate();
          }}
        >
          <label className="block">
            <span className="label">{t("collect.correctionComment")}</span>
            <textarea className="field min-h-28" required minLength={3} value={comment} onChange={(event) => setComment(event.target.value)} />
          </label>
          <button className="btn" type="submit" disabled={ask.isPending}>
            {t("collect.askCorrection")}
          </button>
        </form>
      ) : null}
      {notice ? <p role="status" className="text-sm text-forest">{notice}</p> : null}
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      {revisions.data && revisions.data.length > 0 ? (
        <div>
          <h3 className="block-title">{t("collect.history")}</h3>
          <ol className="mt-3 space-y-3">
            {revisions.data.map((revision) => (
              <li key={revision.id} className="rounded-2xl border border-line px-4 py-3 text-sm">
                <p className="font-medium">
                  {t("collect.version", { number: revision.version_number })} · {t(`collect.reason.${revision.reason}`, { defaultValue: revision.reason })}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {revision.created_by_name} · {formatDate(revision.created_at, i18n.language)}
                </p>
                <p className="mt-2 line-clamp-4 whitespace-pre-wrap leading-6" dir="auto">
                  {revision.snapshot.original_content}
                </p>
              </li>
            ))}
          </ol>
          {revisions.data.length > 0 ? (
            <div className="space-y-3">
              <label className="block">
                <span className="label">{t("library.compare")}</span>
                <select className="field" value={compareId} onChange={(event) => setCompareId(event.target.value)}>
                  <option value="">{t("library.currentOnly")}</option>
                  {revisions.data.map((revision) => (
                    <option key={revision.id} value={revision.id}>
                      {t("collect.version", { number: revision.version_number })}
                    </option>
                  ))}
                </select>
              </label>
              {compareId ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="label">{t("library.selectedVersion")}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6" dir="auto">
                      {revisions.data.find((revision) => revision.id === compareId)?.snapshot.original_content}
                    </p>
                  </div>
                  <div>
                    <p className="label">{t("library.current")}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6" dir="auto">{originalContent}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
