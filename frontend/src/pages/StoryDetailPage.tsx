import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { addFavorite, deleteStory, fetchStory, removeFavorite } from "../api/resources";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { CorrectionDesk } from "../components/studio/CorrectionDesk";
import { SimilarStories } from "../components/studio/SimilarStories";
import { StoryFiles } from "../components/studio/StoryFiles";
import { ErrorState, LoadingState } from "../components/ui/Chrome";
import { confirmAction } from "../components/ui/Confirm";
import { categoryName, formatDate } from "../lib/format";

export function StoryDetailPage() {
  const { t, i18n } = useTranslation();
  const { storyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const uploadError = (location.state as { uploadError?: string } | null)?.uploadError;
  const queryClient = useQueryClient();
  const { user } = useAuth();
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

  const removal = useMutation({
    mutationFn: () => deleteStory(storyId as string),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      navigate("/stories");
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  if (story.isLoading) {
    return (
      <div className="container-page">
        <LoadingState label={t("common.loading")} />
      </div>
    );
  }
  if (story.isError || !story.data) return <div className="container-page py-16"><ErrorState label={t("common.error")} /></div>;

  const current = story.data;
  const canEdit = user?.id === current.created_by.id || user?.role === "admin";
  const canReadFiles = canEdit || ((user?.role === "validator" || user?.role === "admin") && current.workflow_status !== "draft");
  const canValidate = (user?.role === "validator" || user?.role === "admin") && user.id !== current.created_by.id && current.workflow_status !== "draft";
  const readingDir = current.language === "fr" ? "ltr" : "rtl";

  return (
    <article className="container-page py-12 md:py-16">
      <Link className="text-sm font-medium text-forest" to="/stories">
        {t("story.back")}
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div className="max-w-3xl">
          <p className="kicker">{t("story.originCollected")}</p>
          <h1 className="mt-3 text-5xl leading-[0.95] md:text-6xl">{current.title}</h1>
          <p className="mt-4 text-muted">{t("story.detailLead")}</p>
        </div>
        <StatusBadge status={current.validation_status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.7fr)]">
        <div className="space-y-6">
          {uploadError ? <p role="alert" className="text-sm text-danger">{uploadError}</p> : null}
          <div
            className="card whitespace-pre-wrap font-serif text-xl leading-9"
            dir={readingDir}
            lang={current.language === "ary" ? "ar" : current.language}
          >
            {current.original_content}
          </div>
          {canReadFiles ? <StoryFiles storyId={current.id} canManage={Boolean(canEdit)} /> : null}
          <CorrectionDesk
            storyId={current.id}
            canAsk={Boolean(canValidate)}
            canRead={Boolean(canEdit || canValidate)}
            originalContent={current.original_content}
          />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-3 text-sm">
            <p>
              <span className="font-medium">{t("story.by")}</span> {current.narrator_name}
            </p>
            <p>{t(`narrator.${current.narrator_role}`)}</p>
            <p>{t(`source.${current.source}`)}</p>
            <p>{t(`lang.${current.language}`)}</p>
            <p>{current.category ? categoryName(current.category, i18n.language) : t("category.none")}</p>
            <p>
              <span className="font-medium">{t("story.origin")}</span> {current.origin_place || t("story.unknown")}
            </p>
            <p>
              <span className="font-medium">{t("story.collectedOn")}</span>{" "}
              {current.collected_on ? formatDate(current.collected_on, i18n.language) : t("story.unknown")}
            </p>
            <p>
              <span className="font-medium">{t("story.ingredients")}</span> {current.mentioned_ingredients || t("story.unknown")}
            </p>
            {current.transmission_note ? <p>{current.transmission_note}</p> : null}
            <p>{current.workflow_status === "draft" ? t("story.draft") : t("story.submitted")}</p>
            {canEdit || user?.role === "validator" ? (
              <p>
                {t("story.accountAuthor")} {current.created_by.full_name}
              </p>
            ) : null}
            <p>{formatDate(current.created_at, i18n.language)}</p>
            {current.validated_by ? (
              <p>
                {current.validated_by.full_name}
                {current.validated_at ? ` · ${formatDate(current.validated_at, i18n.language)}` : ""}
              </p>
            ) : null}
          </div>
          <p className="rounded-[1.5rem] border border-gold/70 bg-gold/15 p-4 text-sm leading-6">{t("story.notMedical")}</p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" to={`/stories/${current.id}/lab`}>{t("lab.open")}</Link>
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
                  void confirmAction(t("common.confirmDelete")).then((ok) => {
                    if (ok) removal.mutate();
                  });
                }}
              >
                {t("story.delete")}
              </button>
            ) : null}
          </div>
          {canValidate ? (
            <div className="card space-y-3">
              <p className="text-sm text-muted">{t("story.validationHelp")}</p>
              <Link className="btn" to="/modules/validation">{t("review.open")}</Link>
            </div>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </aside>
      </div>
      <SimilarStories storyId={current.id} />
    </article>
  );
}
