import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api/client";
import {
  exportAccount,
  exportRecipe,
  fetchConsents,
  fetchFavorites,
  fetchHistory,
  fetchLibrary,
  fetchMyCorrections,
  fetchNotes,
  fetchNotifications,
  fetchSpaceSummary,
  markNotificationRead,
  removeFavorite,
  requestDeletion,
  saveNote,
  updateProfile,
} from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "../components/ui/Chrome";
import i18n from "../i18n";
import { formatCount } from "../lib/format";
import type { LanguageCode, ValidationStatus } from "../types";

const SECTIONS = ["overview", "stories", "corrections", "recipes", "favorites", "activity", "notifications", "profile", "consent"] as const;
type Section = (typeof SECTIONS)[number];

const COUNTS = [
  ["stories", "stories", ""],
  ["drafts", "stories", "draft"],
  ["submitted", "stories", "submitted"],
  ["corrections", "corrections", ""],
  ["recipes", "recipes", ""],
  ["favorites", "favorites", ""],
  ["notifications", "notifications", ""],
] as const;

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SpacePage() {
  const { t } = useTranslation();
  const { user, replaceUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get("section") || "overview";
  const section: Section = SECTIONS.includes(requested as Section) ? (requested as Section) : "overview";
  const status = params.get("status") || "";
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  function open(next: string, nextStatus = "") {
    const values = new URLSearchParams();
    values.set("section", next);
    if (nextStatus) values.set("status", nextStatus);
    setParams(values);
    setError("");
  }

  return (
    <section className="container-page py-10 md:py-14">
      <SectionHeading as="h1" kicker={t("space.kicker")} title={t("space.title")} text={t("space.lead")} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label={t("space.title")}>
          {SECTIONS.map((item) => (
            <button
              key={item}
              type="button"
              className={`shrink-0 rounded-full px-4 py-2 text-start text-sm ${section === item ? "bg-forest text-cream" : "bg-cream text-ink"}`}
              onClick={() => open(item)}
            >
              {t(`space.${item}`)}
            </button>
          ))}
        </nav>
        <div>
          {error ? <p role="alert" className="mb-4 text-sm text-danger">{error}</p> : null}
          {section === "overview" ? <Overview onOpen={open} name={user?.full_name || ""} /> : null}
          {section === "stories" ? <Library kind="stories" query={query} setQuery={setQuery} status={status} onError={setError} /> : null}
          {section === "corrections" ? <Corrections /> : null}
          {section === "recipes" ? <Recipes onError={setError} /> : null}
          {section === "favorites" ? <Favorites onError={setError} /> : null}
          {section === "activity" ? <Activity /> : null}
          {section === "notifications" ? <Notifications onError={setError} /> : null}
          {section === "profile" && user ? <Profile name={user.full_name} language={user.preferred_language} email={user.email} role={user.role} onError={setError} onSaved={replaceUser} /> : null}
          {section === "consent" ? <Consent onError={setError} /> : null}
        </div>
      </div>
    </section>
  );
}

function Overview({ onOpen, name }: { onOpen: (section: string, status?: string) => void; name: string }) {
  const { t } = useTranslation();
  const summary = useQuery({ queryKey: ["space-summary"], queryFn: fetchSpaceSummary });
  const history = useQuery({ queryKey: ["space-history"], queryFn: () => fetchHistory() });
  return (
    <div>
      <h2 className="entry-title mt-0">{t("dashboard.hello", { name })}</h2>
      {summary.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {summary.isError ? <ErrorState label={t("common.error")} /> : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {COUNTS.map(([key, target, filter]) => (
          <button key={key} type="button" className="card lift text-start" onClick={() => onOpen(target, filter)}>
            <span className="text-sm text-muted">{t(`space.${key}`)}</span>
            <span className="mt-3 block font-serif text-5xl text-forest">{summary.data ? formatCount(summary.data[key], i18n.language) : "—"}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link className="btn" to="/stories/new">{t("nav.newStory")}</Link>
        <Link className="btn-secondary" to="/stories">{t("nav.stories")}</Link>
        <Link className="btn-secondary" to="/modules/recipes">{t("nav.recipes")}</Link>
        <Link className="btn-secondary" to="/modules/guide">{t("nav.guide")}</Link>
      </div>
      <h3 className="section-title">{t("space.activity")}</h3>
      {history.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {history.data && history.data.items.length === 0 ? <div className="mt-4"><EmptyState title={t("space.empty")} /></div> : null}
      <ul className="mt-4 space-y-3">
        {history.data?.items.slice(0, 5).map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <Link className="block rounded-2xl border border-line px-4 py-3 hover:border-forest" to={item.href}>
              <span dir="auto">{item.title}</span>
              <span className="mt-1 block text-xs text-muted">{t(`space.kind.${item.kind}`)} · {t(item.kind === "recipe" ? `recipe.${item.status}` : `status.${item.status}`, item.status)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Library({ kind, query, setQuery, status, onError }: { kind: string; query: string; setQuery: (value: string) => void; status: string; onError: (value: string) => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(query);
  const items = useQuery({
    queryKey: ["space-library", kind, query, status],
    queryFn: () => fetchLibrary({ q: query, kind, status }),
  });
  return (
    <div>
      <form className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); setQuery(draft); onError(""); }}>
        <input className="field min-w-0 flex-1" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t("space.search")} aria-label={t("space.search")} />
        <button className="btn-secondary" type="submit">{t("space.filter")}</button>
      </form>
      {status ? <p className="mt-3 text-sm text-muted">{t("space.status")} : {t(`story.${status}`, t(`recipe.${status}`, status))}</p> : null}
      {items.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {items.isError ? <ErrorState label={t("common.error")} /> : null}
      {items.data && items.data.items.length === 0 ? <div className="mt-4"><EmptyState title={t("space.empty")} action={<Link className="btn-secondary" to="/stories/new">{t("nav.newStory")}</Link>} /></div> : null}
      <ul className="mt-4 space-y-3">
        {items.data?.items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <Link className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 hover:border-forest" to={item.href}>
              <span dir="auto">{item.title}</span>
              {item.kind === "recipe" ? <span className="text-xs text-muted">{t(`recipe.${item.status}`, item.status)}</span> : <StatusBadge status={item.status as ValidationStatus} />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Corrections() {
  const { t } = useTranslation();
  const corrections = useQuery({ queryKey: ["my-corrections"], queryFn: fetchMyCorrections });
  return (
    <div>
      <h2 className="section-title mt-0">{t("space.corrections")}</h2>
      {corrections.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {corrections.isError ? <ErrorState label={t("common.error")} /> : null}
      {corrections.data && corrections.data.length === 0 ? <div className="mt-4"><EmptyState title={t("collect.noCorrection")} /></div> : null}
      <ul className="mt-4 space-y-3">
        {corrections.data?.map((item) => (
          <li key={item.id}>
            <Link className="block rounded-2xl border border-line px-4 py-3 hover:border-forest" to={`/stories/${item.story_id}/edit`}>
              <span dir="auto">{item.story_title}</span>
              <span className="mt-1 block text-sm text-muted" dir="auto">{item.comment}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Recipes({ onError }: { onError: (value: string) => void }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const recipes = useQuery({ queryKey: ["space-library", "recipes"], queryFn: () => fetchLibrary({ kind: "recipes" }) });
  const notes = useQuery({ queryKey: ["space-notes"], queryFn: fetchNotes });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: (recipeId: string) => saveNote(recipeId, drafts[recipeId] ?? ""),
    onSuccess: async () => {
      onError("");
      await client.invalidateQueries({ queryKey: ["space-notes"] });
    },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  async function onPdf(id: string, title: string) {
    try {
      download(`${title}.pdf`, await exportRecipe(id));
      onError("");
    } catch (caught) {
      onError(getErrorMessage(caught, t("common.error")));
    }
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title mt-0">{t("space.recipes")}</h2>
        <Link className="btn-secondary" to="/modules/recipes">{t("space.open")}</Link>
      </div>
      {recipes.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {recipes.isError ? <ErrorState label={t("common.error")} /> : null}
      {recipes.data && recipes.data.items.length === 0 ? <div className="mt-4"><EmptyState title={t("space.empty")} action={<Link className="btn" to="/modules/recipes">{t("nav.recipes")}</Link>} /></div> : null}
      <ul className="mt-4 space-y-4">
        {recipes.data?.items.map((item) => {
          const note = notes.data?.items.find((entry) => entry.recipe_id === item.id);
          return (
            <li key={item.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-serif text-2xl leading-tight text-ink" dir="auto">{item.title}</p>
                <span className="text-sm text-muted">{t(`recipe.${item.status}`, item.status)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className="btn-secondary" to="/modules/recipes">{t("space.open")}</Link>
                <button className="btn-secondary" type="button" onClick={() => onPdf(item.id, item.title)}>{t("space.exportPdf")}</button>
              </div>
              <label className="mt-4 block text-sm">
                <span className="text-muted">{t("space.note")}</span>
                <textarea className="field mt-2 min-h-24" dir="auto" value={drafts[item.id] ?? note?.body ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))} />
              </label>
              <button className="btn mt-3" type="button" disabled={save.isPending || !(drafts[item.id] ?? note?.body ?? "").trim()} onClick={() => save.mutate(item.id)}>{t("space.noteSave")}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Favorites({ onError }: { onError: (value: string) => void }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const favorites = useQuery({ queryKey: ["favorites"], queryFn: fetchFavorites });
  const remove = useMutation({
    mutationFn: removeFavorite,
    onSuccess: async () => {
      onError("");
      await client.invalidateQueries({ queryKey: ["favorites"] });
      await client.invalidateQueries({ queryKey: ["space-summary"] });
    },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  return (
    <div>
      <h2 className="section-title mt-0">{t("space.favorites")}</h2>
      {favorites.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {favorites.isError ? <ErrorState label={t("common.error")} /> : null}
      {favorites.data && favorites.data.items.length === 0 ? <div className="mt-4"><EmptyState title={t("dashboard.emptyFavorites")} action={<Link className="btn-secondary" to="/stories">{t("nav.stories")}</Link>} /></div> : null}
      <ul className="mt-4 space-y-3">
        {favorites.data?.items.map((story) => (
          <li key={story.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
            <Link dir="auto" to={`/stories/${story.id}`}>{story.title}</Link>
            <button className="btn-secondary" type="button" onClick={() => remove.mutate(story.id)}>{t("space.removeFavorite")}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Activity() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const history = useQuery({ queryKey: ["space-history", q], queryFn: () => fetchHistory(q) });
  return (
    <div>
      <form className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); setQ(draft); }}>
        <input className="field min-w-0 flex-1" value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={t("space.search")} placeholder={t("space.search")} />
        <button className="btn-secondary" type="submit">{t("space.filter")}</button>
      </form>
      {history.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {history.isError ? <ErrorState label={t("common.error")} /> : null}
      {history.data && history.data.items.length === 0 ? <div className="mt-4"><EmptyState title={t("space.empty")} /></div> : null}
      <ol className="mt-4 space-y-3">
        {history.data?.items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <Link className="block rounded-2xl border border-line px-4 py-3 hover:border-forest" to={item.href}>
              <span dir="auto">{item.title}</span>
              <span className="mt-1 block text-xs text-muted">{t(`space.kind.${item.kind}`)} · {t(item.kind === "recipe" ? `recipe.${item.status}` : `status.${item.status}`, item.status)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Notifications({ onError }: { onError: (value: string) => void }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const notes = useQuery({ queryKey: ["space-notifications"], queryFn: fetchNotifications });
  const read = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      onError("");
      await client.invalidateQueries({ queryKey: ["space-notifications"] });
      await client.invalidateQueries({ queryKey: ["space-summary"] });
    },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  return (
    <div>
      <h2 className="section-title mt-0">{t("space.notifications")}</h2>
      {notes.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {notes.isError ? <ErrorState label={t("common.error")} /> : null}
      {notes.data && notes.data.items.length === 0 ? <div className="mt-4"><EmptyState title={t("space.noNotify")} /></div> : null}
      <ul className="mt-4 space-y-3">
        {notes.data?.items.map((item) => (
          <li key={item.key} className="rounded-2xl border border-line px-4 py-3">
            <Link to={item.href} className="block">
              <span className="text-sm text-muted">{t(`space.kind.${item.kind}`)} · {t(`space.code.${item.code}`, item.code)}</span>
              <span className="mt-1 block" dir="auto">{item.title}</span>
              {item.comment ? <span className="mt-1 block text-sm text-muted" dir="auto">{item.comment}</span> : null}
            </Link>
            <button className="btn-secondary mt-3" type="button" disabled={item.read || read.isPending} onClick={() => read.mutate(item.key)}>
              {item.read ? t("space.read") : t("space.markRead")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Profile({
  name,
  language,
  email,
  role,
  onError,
  onSaved,
}: {
  name: string;
  language: LanguageCode;
  email: string;
  role: string;
  onError: (value: string) => void;
  onSaved: (user: { id: string; email: string; full_name: string; role: "contributor" | "validator" | "admin"; preferred_language: LanguageCode; created_at: string }) => void;
}) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(name);
  const [preferred, setPreferred] = useState<LanguageCode>(language);
  const [saved, setSaved] = useState(false);
  const save = useMutation({
    mutationFn: () => updateProfile(fullName, preferred),
    onSuccess: (next) => {
      onSaved(next);
      void i18n.changeLanguage(next.preferred_language);
      localStorage.setItem("rawi_lang", next.preferred_language);
      setSaved(true);
      onError("");
    },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  async function onExport() {
    try {
      download("rawi-espace.json", new Blob([JSON.stringify(await exportAccount(), null, 2)], { type: "application/json" }));
      onError("");
    } catch (caught) {
      onError(getErrorMessage(caught, t("common.error")));
    }
  }
  return (
    <form className="card max-w-xl space-y-4" onSubmit={(event) => { event.preventDefault(); setSaved(false); save.mutate(); }}>
      <p className="text-sm text-muted">{email}</p>
      <p className="text-sm">{t("dashboard.role")} : {t(`roles.${role}`)}</p>
      <label className="block text-sm">
        <span className="text-muted">{t("space.name")}</span>
        <input className="field mt-2" value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} />
      </label>
      <label className="block text-sm">
        <span className="text-muted">{t("space.language")}</span>
        <select className="field mt-2" value={preferred} onChange={(event) => setPreferred(event.target.value as LanguageCode)}>
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
          <option value="ary">الدارجة</option>
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="btn" type="submit" disabled={save.isPending}>{t("space.save")}</button>
        <button className="btn-secondary" type="button" onClick={onExport}>{t("space.exportJson")}</button>
      </div>
      {saved ? <p className="text-sm text-forest">{t("space.saved")}</p> : null}
    </form>
  );
}

function Consent({ onError }: { onError: (value: string) => void }) {
  const { t } = useTranslation();
  const consents = useQuery({ queryKey: ["space-consents"], queryFn: fetchConsents });
  const [reason, setReason] = useState("");
  const [scope, setScope] = useState("account");
  const [kept, setKept] = useState(false);
  const ask = useMutation({
    mutationFn: () => requestDeletion(scope === "account" ? "account" : "story", reason, scope === "account" ? undefined : scope),
    onSuccess: () => {
      setKept(true);
      setReason("");
      onError("");
    },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-muted">{t("space.consentLead")}</p>
      {consents.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {consents.isError ? <ErrorState label={t("common.error")} /> : null}
      {consents.data && consents.data.items.length === 0 ? <EmptyState title={t("dashboard.emptyStories")} /> : null}
      <ul className="space-y-3">
        {consents.data?.items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-line px-4 py-3">
            <p dir="auto">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.consent ? t("space.consentYes") : t("space.consentNo")} · {item.publish_authorized ? t("space.publishYes") : t("space.publishNo")}</p>
            <Link className="mt-2 inline-block text-sm text-forest" to={item.href}>{t("space.editStory")}</Link>
          </li>
        ))}
      </ul>
      <form className="card space-y-3" onSubmit={(event) => { event.preventDefault(); setKept(false); ask.mutate(); }}>
        <h2 className="section-title mt-0">{t("space.deleteAsk")}</h2>
        <label className="block text-sm">
          <span className="text-muted">{t("space.status")}</span>
          <select className="field mt-2" value={scope} onChange={(event) => setScope(event.target.value)}>
            <option value="account">{t("space.account")}</option>
            {consents.data?.items.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">{t("space.deleteReason")}</span>
          <textarea className="field mt-2 min-h-24" value={reason} onChange={(event) => setReason(event.target.value)} required minLength={3} />
        </label>
        <button className="btn-secondary" type="submit" disabled={ask.isPending || reason.trim().length < 3}>{t("space.deleteAsk")}</button>
        {kept ? <p className="text-sm text-muted">{t("space.deleteKept")}</p> : null}
      </form>
    </div>
  );
}
