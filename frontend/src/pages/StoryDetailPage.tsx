import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { addFavorite, deleteStory, fetchStory, removeFavorite, setValidation } from "../api/resources";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { categoryName, formatDate } from "../lib/format";
import type { ValidationStatus } from "../types";

export function StoryDetailPage() {
  const { t, i18n } = useTranslation();
  const { storyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const story = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => fetchStory(storyId as string),
    enabled: Boolean(storyId),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["story", storyId] });
    await queryClient.invalidateQueries({ queryKey: ["stories"] });
    await queryClient.invalidateQueries({ queryKey: ["favorites"] });
  };

  const favorite = useMutation({
    mutationFn: async () => {
      if (!story.data) return;
      if (story.data.is_favorite) await removeFavorite(story.data.id);
      else await addFavorite(story.data.id);
    },
    onSuccess: invalidate,
  });

  const validation = useMutation({
    mutationFn: (status: ValidationStatus) => setValidation(storyId as string, status),
    onSuccess: async () => {
      setNotice(t("story.validationSaved"));
      setError("");
      await invalidate();
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  const removal = useMutation({
    mutationFn: () => deleteStory(storyId as string),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      navigate("/stories");
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  if (story.isLoading) return <p className="container-page py-16 text-muted">{t("common.loading")}</p>;
  if (story.isError || !story.data) return <p className="container-page py-16 text-danger">{t("common.error")}</p>;

  const current = story.data;
  const canEdit = user?.id === current.created_by.id || user?.role === "admin";
  const canValidate = user?.role === "validator" || user?.role === "admin";

  return (
    <article className="container-page py-10">
      <Link className="text-sm font-semibold text-forest" to="/stories">
        {t("story.back")}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-clay">{t("story.originCollected")}</p>
          <h1 className="mt-2 text-4xl">{current.title}</h1>
          <p className="mt-3 text-muted">{t("story.detailLead")}</p>
        </div>
        <StatusBadge status={current.validation_status} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="card whitespace-pre-wrap leading-7">{current.original_content}</div>
        <aside className="space-y-4">
          <div className="card space-y-2 text-sm">
            <p>
              <span className="font-semibold">{t("story.by")}</span> {current.narrator_name}
            </p>
            <p>{t(`narrator.${current.narrator_role}`)}</p>
            <p>{t(`source.${current.source}`)}</p>
            <p>{t(`lang.${current.language}`)}</p>
            <p>{current.category ? categoryName(current.category, i18n.language) : t("category.none")}</p>
            <p>
              {t("story.accountAuthor")} {current.created_by.full_name}
            </p>
            <p>{formatDate(current.created_at, i18n.language)}</p>
            {current.validated_by ? (
              <p>
                {current.validated_by.full_name}
                {current.validated_at ? ` · ${formatDate(current.validated_at, i18n.language)}` : ""}
              </p>
            ) : null}
          </div>
          <p className="rounded-2xl border border-clay/40 bg-clay/10 p-4 text-sm">{t("story.notMedical")}</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" type="button" onClick={() => favorite.mutate()}>
              {current.is_favorite ? t("story.favoriteRemove") : t("story.favoriteAdd")}
            </button>
            {canEdit ? (
              <Link className="btn-secondary" to={`/stories/${current.id}/edit`}>
                {t("story.edit")}
              </Link>
            ) : null}
            {canEdit ? (
              <button
                className="btn-danger"
                type="button"
                onClick={() => {
                  if (window.confirm(t("common.confirmDelete"))) removal.mutate();
                }}
              >
                {t("story.delete")}
              </button>
            ) : null}
          </div>
          {canValidate ? (
            <form
              className="card space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                validation.mutate(String(data.get("status")) as ValidationStatus);
              }}
            >
              <p className="text-sm text-muted">{t("story.validationHelp")}</p>
              <select className="field" name="status" defaultValue={current.validation_status}>
                <option value="pending">{t("status.pending")}</option>
                <option value="validated">{t("status.validated")}</option>
                <option value="rejected">{t("status.rejected")}</option>
              </select>
              <button className="btn" type="submit">
                {t("story.validationAction")}
              </button>
            </form>
          ) : null}
          {notice ? <p className="text-sm text-forest">{notice}</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </aside>
      </div>
    </article>
  );
}
