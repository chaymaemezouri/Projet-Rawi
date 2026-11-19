import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../api/client";
import {
  correctExtraction,
  correctTranscript,
  deleteStoryMedia,
  extractDocument,
  fetchMediaBlob,
  fetchStoryMedia,
  transcribeMedia,
  uploadStoryMedia,
} from "../../api/resources";
import type { StoryMedia } from "../../types";
import { confirmAction } from "../ui/Confirm";

function EngineBlock({
  title,
  status,
  message,
  raw,
  corrected,
  strong,
  onSave,
  canEdit,
}: {
  title: string;
  status: string;
  message: string;
  raw: string | null;
  corrected: string | null;
  strong: boolean;
  onSave: (value: string) => Promise<void>;
  canEdit: boolean;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(corrected ?? "");
  const succeeded = status === "completed" && Boolean(raw);
  useEffect(() => setDraft(corrected ?? ""), [corrected]);

  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      <p className="text-sm font-medium">{title}</p>
      <p className={`text-sm leading-6 ${succeeded ? "text-ink" : "text-clay-ink"}`} role={succeeded ? "status" : "alert"}>
        {message}
      </p>
      {strong ? <p className="text-sm text-clay-ink">{t("collect.strongReview")}</p> : null}
      {raw ? (
        <div>
          <p className="label">{t("collect.rawText")}</p>
          <p className="mt-1 whitespace-pre-wrap rounded-2xl bg-cream px-4 py-3 text-sm leading-6" dir="auto">
            {raw}
          </p>
        </div>
      ) : null}
      {canEdit && (raw || corrected !== null) ? (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave(draft);
          }}
        >
          <label className="block">
            <span className="label">{t("collect.correctedText")}</span>
            <textarea className="field min-h-28" dir="auto" value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <button className="btn-secondary" type="submit">
            {t("collect.saveCorrection")}
          </button>
        </form>
      ) : corrected ? (
        <p className="whitespace-pre-wrap text-sm leading-6" dir="auto">
          {corrected}
        </p>
      ) : null}
    </div>
  );
}

function FileCard({ item, storyId, canManage }: { item: StoryMedia; storyId: string; canManage: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [manuscript, setManuscript] = useState(false);

  useEffect(() => {
    let active = true;
    let current: string | null = null;
    if (item.kind === "document") return;
    void fetchMediaBlob(storyId, item.id)
      .then((blob) => {
        if (!active) return;
        current = URL.createObjectURL(blob);
        setUrl(current);
      })
      .catch((caught) => {
        if (active) setError(getErrorMessage(caught, t("common.error")));
      });
    return () => {
      active = false;
      if (current) URL.revokeObjectURL(current);
    };
  }, [item.id, item.kind, storyId, t]);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["story-media", storyId] });
  }

  async function run(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
      await refresh();
    } catch (caught) {
      setError(getErrorMessage(caught, t("common.error")));
    }
  }

  return (
    <article className="rounded-[1.5rem] border border-line bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{item.original_name}</p>
          <p className="mt-1 text-xs text-muted">
            {t(`collect.kind.${item.kind}`)} · {Math.ceil(item.byte_size / 1024)} {t("collect.kilobytes")}
          </p>
        </div>
        {canManage ? (
          <button
            className="btn-danger"
            type="button"
            onClick={() => {
              void confirmAction(t("collect.deleteFile")).then((ok) => {
                if (ok) void run(() => deleteStoryMedia(storyId, item.id));
              });
            }}
          >
            {t("story.delete")}
          </button>
        ) : null}
      </div>
      {url && item.kind === "audio" ? <audio controls src={url} aria-label={item.original_name} className="mt-3 w-full" /> : null}
      {url && item.kind === "image" ? <img src={url} alt={item.original_name} className="mt-3 max-h-80 w-full rounded-2xl object-contain" /> : null}
      {item.kind === "document" ? (
        <button
          className="btn-secondary mt-3"
          type="button"
          onClick={() => {
            void fetchMediaBlob(storyId, item.id).then((blob) => {
              const objectUrl = URL.createObjectURL(blob);
              window.open(objectUrl, "_blank", "noopener");
            });
          }}
        >
          {t("collect.openOriginal")}
        </button>
      ) : null}
      {canManage && item.kind === "audio" ? (
        <button className="btn mt-4" type="button" onClick={() => void run(() => transcribeMedia(storyId, item.id))}>
          {t("collect.transcribe")}
        </button>
      ) : null}
      {canManage && item.kind !== "audio" ? (
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <input className="mt-1 h-4 w-4 accent-forest" type="checkbox" checked={manuscript} onChange={(event) => setManuscript(event.target.checked)} />
            <span>{t("collect.manuscript")}</span>
          </label>
          <button className="btn" type="button" onClick={() => void run(() => extractDocument(storyId, item.id, manuscript))}>
            {t("collect.readDocument")}
          </button>
        </div>
      ) : null}
      {item.transcript ? (
        <EngineBlock
          title={t("collect.transcriptTitle")}
          status={item.transcript.status}
          message={item.transcript.message}
          raw={item.transcript.raw_text}
          corrected={item.transcript.corrected_text}
          strong={item.transcript.needs_strong_review}
          canEdit={canManage}
          onSave={(value) => correctTranscript(storyId, item.id, value).then(refresh)}
        />
      ) : null}
      {item.extraction ? (
        <EngineBlock
          title={t("collect.extractionTitle")}
          status={item.extraction.status}
          message={item.extraction.message}
          raw={item.extraction.raw_text}
          corrected={item.extraction.corrected_text}
          strong={item.extraction.needs_strong_review}
          canEdit={canManage}
          onSave={(value) => correctExtraction(storyId, item.id, value).then(refresh)}
        />
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </article>
  );
}

export function StoryFiles({ storyId, canManage }: { storyId: string; canManage: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const media = useQuery({ queryKey: ["story-media", storyId], queryFn: () => fetchStoryMedia(storyId) });
  const upload = useMutation({
    mutationFn: (file: File) => uploadStoryMedia(storyId, file, file.name, setProgress),
    onSuccess: async () => {
      setProgress(null);
      setError("");
      setMessage(t("collect.uploaded"));
      await queryClient.invalidateQueries({ queryKey: ["story-media", storyId] });
    },
    onError: (caught) => {
      setProgress(null);
      setMessage("");
      setError(getErrorMessage(caught, t("collect.uploadFailed")));
    },
  });

  return (
    <section className="space-y-4" aria-label={t("collect.filesTitle")}>
      <h2 className="text-3xl">{t("collect.filesTitle")}</h2>
      {canManage ? (
        <label className="block">
          <span className="label">{t("collect.addFile")}</span>
          <input
            className="field"
            type="file"
            accept="audio/*,image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void confirmAction(t("collect.confirmStore")).then((ok) => {
                if (!ok) return;
                setMessage("");
                upload.mutate(file);
              });
            }}
          />
          <span className="mt-1 block text-xs text-muted">{t("collect.confirmStore")}</span>
        </label>
      ) : null}
      {progress !== null ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-forest" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {message ? <p role="status" className="text-sm text-forest">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      {media.isLoading ? <p className="text-sm text-muted">{t("common.loading")}</p> : null}
      {media.isError ? <p role="alert" className="text-sm text-danger">{t("common.error")}</p> : null}
      {media.data && media.data.length === 0 ? <p className="text-sm text-muted">{t("collect.noFiles")}</p> : null}
      <div className="space-y-4">
        {media.data?.map((item) => (
          <FileCard key={item.id} item={item} storyId={storyId} canManage={canManage} />
        ))}
      </div>
    </section>
  );
}
