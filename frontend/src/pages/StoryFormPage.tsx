import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api/client";
import { createStory, fetchCategories, fetchStory, updateStory } from "../api/resources";
import { AudioCapture } from "../components/studio/AudioCapture";
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
    setConsent(true);
  }, [existing.data]);

  const mutation = useMutation({
    mutationFn: (payload: StoryInput) => (isEdit && storyId ? updateStory(storyId, payload) : createStory(payload)),
    onSuccess: async (story) => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      await queryClient.invalidateQueries({ queryKey: ["story", story.id] });
      navigate(`/stories/${story.id}`);
    },
    onError: (caught) => setError(getErrorMessage(caught, t("common.error"))),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!consent) {
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
    });
  }

  return (
    <section className="container-page py-12 md:py-16">
      <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6" aria-label={t(isEdit ? "story.editTitle" : "story.newTitle")}>
        <SectionHeading as="h1" kicker={t("story.originCollected")} title={t(isEdit ? "story.editTitle" : "story.newTitle")} text={t("story.contentHint")} />
        <AudioCapture />
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
          <label className="block">
            <span className="label">{t("story.content")}</span>
            <textarea className="field min-h-48 font-serif text-lg leading-8" required minLength={10} value={content} onChange={(event) => setContent(event.target.value)} />
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input className="mt-1 h-4 w-4 accent-forest" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>
              {t("story.consent")}
              <span className="mt-1 block text-muted">{t("story.consentHelp")}</span>
            </span>
          </label>
          <p className="text-sm text-muted">{t("design.audioNotSent")}</p>
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <button className="btn" type="submit" disabled={mutation.isPending}>
            {t("story.save")}
          </button>
        </div>
      </form>
    </section>
  );
}
