import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api/client";
import { createStory, fetchCategories, fetchStory, updateStory, uploadStoryMedia } from "../api/resources";
import { AudioCapture, type PendingFile } from "../components/studio/AudioCapture";
import { DocumentImport } from "../components/studio/DocumentImport";
import { SectionHeading } from "../components/ui/Chrome";
import { categoryName } from "../lib/format";
import type { LanguageCode, NarratorRole, StoryInput, StorySource } from "../types";

const NARRATORS: NarratorRole[] = ["grandmother", "achaba", "hammam_practitioner", "practitioner", "other"];
const SOURCES: StorySource[] = ["oral", "written", "digitized"];
const LANGUAGES: LanguageCode[] = ["fr", "ar", "ary"];

export function StoryFormPage() {
  const { t, i18n } = useTranslation();
  const { storyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(storyId);
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const existing = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => fetchStory(storyId as string),
    enabled: isEdit,
  });

  const [title, setTitle] = useState("");
  const [narratorName, setNarratorName] = useState("");
  const [narratorRole, setNarratorRole] = useState<NarratorRole>("grandmother");
  const [source, setSource] = useState<StorySource>("oral");
  const [language, setLanguage] = useState<LanguageCode>("fr");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [consent, setConsent] = useState(false);
  const [originPlace, setOriginPlace] = useState("");
  const [transmissionNote, setTransmissionNote] = useState("");
  const [collectedOn, setCollectedOn] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [publishAuthorized, setPublishAuthorized] = useState(false);
  const [method, setMethod] = useState<"write" | "record" | "import">("write");
  const [pendingAudio, setPendingAudio] = useState<PendingFile | null>(null);
  const [pendingDoc, setPendingDoc] = useState<PendingFile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing.data) return;
    setTitle(existing.data.title);
    setNarratorName(existing.data.narrator_name);
    setNarratorRole(existing.data.narrator_role);
    setSource(existing.data.source);
    setLanguage(existing.data.language);
    setCategoryId(existing.data.category_id ?? "");
    setContent(existing.data.original_content);
    setConsent(existing.data.consent);
    setOriginPlace(existing.data.origin_place ?? "");
    setTransmissionNote(existing.data.transmission_note ?? "");
    setCollectedOn(existing.data.collected_on ?? "");
    setIngredients(existing.data.mentioned_ingredients ?? "");
    setPublishAuthorized(existing.data.publish_authorized);
  }, [existing.data]);

  const mutation = useMutation({
    mutationFn: (payload: StoryInput) => (isEdit && storyId ? updateStory(storyId, payload) : createStory(payload)),
    onSuccess: async (story) => {
      const queued = [pendingAudio, pendingDoc].filter((item): item is PendingFile => item !== null);
      try {
        for (const file of queued) {
          await uploadStoryMedia(story.id, file.blob, file.name);
        }
      } catch (caught) {
        await queryClient.invalidateQueries({ queryKey: ["stories"] });
        navigate(`/stories/${story.id}`, { state: { uploadError: getErrorMessage(caught, t("collect.uploadFailed")) } });
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      await queryClient.invalidateQueries({ queryKey: ["story", story.id] });
      navigate(`/stories/${story.id}`);
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const workflow = submitter instanceof HTMLButtonElement && submitter.value === "draft" ? "draft" : "submitted";
    if (workflow === "submitted" && !consent) {
      setError(t("story.consentMissing"));
      return;
    }
    setError("");
    mutation.mutate({
      title,
      narrator_name: narratorName,
      narrator_role: narratorRole,
      source,
      language,
      original_content: content,
      consent,
      category_id: categoryId || null,
      origin_place: originPlace.trim() || null,
      transmission_note: transmissionNote.trim() || null,
      collected_on: collectedOn || null,
      mentioned_ingredients: ingredients.trim() || null,
      publish_authorized: publishAuthorized,
      workflow_status: workflow,
    });
  }

  return (
    <section className="container-page py-12 md:py-16">
      <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6" aria-label={t(isEdit ? "story.editTitle" : "story.newTitle")} aria-describedby={error ? "story-form-error" : undefined}>
        <SectionHeading as="h1" kicker={t("story.originCollected")} title={t(isEdit ? "story.editTitle" : "story.newTitle")} text={t("story.contentHint")} />
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("collect.methods")}>
          {(["write", "record", "import"] as const).map((item) => (
            <button
              key={item}
              className={method === item ? "btn" : "btn-secondary"}
              type="button"
              role="tab"
              aria-selected={method === item}
              onClick={() => setMethod(item)}
            >
              {t(`collect.method.${item}`)}
            </button>
          ))}
        </div>
        {method === "record" ? <AudioCapture onPending={setPendingAudio} /> : null}
        {method === "import" ? <DocumentImport onPending={setPendingDoc} /> : null}
        <div className="card space-y-4">
          <label className="block">
            <span className="label">{t("story.title")}</span>
            <input className="field" required minLength={3} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">{t("story.narrator")}</span>
              <input className="field" required minLength={2} value={narratorName} onChange={(event) => setNarratorName(event.target.value)} />
            </label>
            <label>
              <span className="label">{t("story.narratorRole")}</span>
              <select className="field" value={narratorRole} onChange={(event) => setNarratorRole(event.target.value as NarratorRole)}>
                {NARRATORS.map((role) => (
                  <option key={role} value={role}>
                    {t(`narrator.${role}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">{t("story.source")}</span>
              <select className="field" value={source} onChange={(event) => setSource(event.target.value as StorySource)}>
                {SOURCES.map((item) => (
                  <option key={item} value={item}>
                    {t(`source.${item}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">{t("story.language")}</span>
              <select className="field" value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGES.map((item) => (
                  <option key={item} value={item}>
                    {t(`lang.${item}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="label">
              {t("story.category")} <span className="font-normal text-muted">({t("common.optional")})</span>
            </span>
            <select className="field" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">{t("category.none")}</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {categoryName(category, i18n.language)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">{t("story.origin")}</span>
              <input className="field" value={originPlace} onChange={(event) => setOriginPlace(event.target.value)} />
              <span className="mt-1 block text-xs text-muted">{t("story.originHint")}</span>
            </label>
            <label>
              <span className="label">{t("story.collectedOn")}</span>
              <input className="field" type="date" value={collectedOn} onChange={(event) => setCollectedOn(event.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="label">{t("story.ingredients")}</span>
            <input className="field" value={ingredients} onChange={(event) => setIngredients(event.target.value)} />
          </label>
          <label className="block">
            <span className="label">{t("story.transmission")}</span>
            <textarea className="field min-h-24" value={transmissionNote} onChange={(event) => setTransmissionNote(event.target.value)} />
          </label>
          <label className="block">
            <span className="label">{t("story.content")}</span>
            <textarea className="field min-h-48 font-serif text-lg leading-8" required minLength={10} value={content} aria-invalid={error ? true : undefined} aria-describedby={error ? "story-form-error" : undefined} onChange={(event) => setContent(event.target.value)} />
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input className="mt-1 h-4 w-4 accent-forest" type="checkbox" checked={publishAuthorized} onChange={(event) => setPublishAuthorized(event.target.checked)} />
            <span>{t("story.publish")}</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input className="mt-1 h-4 w-4 accent-forest" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>
              {t("story.consent")}
              <span className="mt-1 block text-muted">{t("story.consentHelp")}</span>
            </span>
          </label>
          <p className="text-sm text-muted">{t("collect.originalStays")}</p>
          {error ? (
            <p id="story-form-error" role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button className="btn" type="submit" value="submitted" disabled={mutation.isPending}>
              {t("story.save")}
            </button>
            <button className="btn-secondary" type="submit" value="draft" disabled={mutation.isPending}>
              {t("story.saveDraft")}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
