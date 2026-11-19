import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api/client";
import { confirmAction } from "../components/ui/Confirm";
import { categoryName, formatCount, formatDate } from "../lib/format";
import {
  downloadAdminExport,
  fetchAdminCategories,
  fetchAdminDeletions,
  fetchAdminJournal,
  fetchAdminModeration,
  fetchAdminSummary,
  fetchAdminUsers,
  fetchAdminValidators,
  reviewAdminDeletion,
  setAdminActive,
  setAdminCategoryActive,
  setAdminRole,
} from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "../components/ui/Chrome";
import type { Role } from "../types";

function codeLabel(translate: (key: string) => string, code: string) {
  if (!code) return "";
  const key = `admin.codes.${code}`;
  const label = translate(key);
  return label === key ? code : label;
}

function detailLabel(translate: (key: string) => string, detail: string) {
  return detail.split("->").map((part) => {
    const roleKey = `roles.${part}`;
    const role = translate(roleKey);
    return role === roleKey ? codeLabel(translate, part) : role;
  }).join(" → ");
}

const SECTIONS = ["overview", "users", "validators", "categories", "moderation", "deletions", "journal", "exports"] as const;
type Section = (typeof SECTIONS)[number];
const BARS = ["users", "stories", "categories", "pending_validations", "recipes", "deletions", "open_corrections"] as const;

function saveFile(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get("section") || "overview";
  const section: Section = SECTIONS.includes(requested as Section) ? (requested as Section) : "overview";
  const [error, setError] = useState("");
  if (user && user.role !== "admin") {
    return <section className="container-page py-12"><EmptyState title={t("admin.forbidden")} /></section>;
  }
  return (
    <section className="container-page py-10 md:py-14">
      <SectionHeading as="h1" kicker={t("admin.kicker")} title={t("admin.title")} text={t("admin.lead")} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label={t("admin.title")}>
          {SECTIONS.map((item) => (
            <button key={item} type="button" className={`shrink-0 rounded-full px-4 py-2 text-start text-sm ${section === item ? "bg-forest text-cream" : "bg-cream text-ink"}`} onClick={() => { setParams({ section: item }); setError(""); }}>
              {t(`admin.${item}`)}
            </button>
          ))}
        </nav>
        <div>
          {error ? <p role="alert" className="mb-4 text-sm text-danger">{error}</p> : null}
          {section === "overview" ? <Overview /> : null}
          {section === "users" ? <Users onError={setError} /> : null}
          {section === "validators" ? <Validators /> : null}
          {section === "categories" ? <Categories onError={setError} /> : null}
          {section === "moderation" ? <Moderation /> : null}
          {section === "deletions" ? <Deletions onError={setError} /> : null}
          {section === "journal" ? <Journal /> : null}
          {section === "exports" ? <Exports onError={setError} /> : null}
        </div>
      </div>
    </section>
  );
}

function Overview() {
  const { t, i18n } = useTranslation();
  const summary = useQuery({ queryKey: ["admin-summary"], queryFn: fetchAdminSummary });
  const max = Math.max(1, ...BARS.map((key) => summary.data?.[key] ?? 0));
  const labels: Record<(typeof BARS)[number], string> = {
    users: "admin.users",
    stories: "admin.stories",
    categories: "admin.categories",
    pending_validations: "admin.pending",
    recipes: "nav.recipes",
    deletions: "admin.deletions",
    open_corrections: "admin.corrections",
  };
  return (
    <div>
      {summary.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {summary.isError ? <ErrorState label={t("common.error")} /> : null}
      <ul className="space-y-3">
        {BARS.map((key) => (
          <li key={key}>
            <div className="flex justify-between text-sm"><span>{t(labels[key])}</span><span>{summary.data ? formatCount(summary.data[key], i18n.language) : "—"}</span></div>
            <div className="mt-1 h-2 rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={summary.data?.[key] ?? 0} aria-label={t(labels[key])}><div className="h-2 rounded-full bg-forest" style={{ width: `${((summary.data?.[key] ?? 0) / max) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Users({ onError }: { onError: (value: string) => void }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const users = useQuery({ queryKey: ["admin-users", q], queryFn: () => fetchAdminUsers(q) });
  const role = useMutation({
    mutationFn: (item: { id: string; role: Role }) => setAdminRole(item.id, roles[item.id] ?? item.role),
    onSuccess: async () => { onError(""); await client.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  const active = useMutation({
    mutationFn: (item: { id: string; is_active: boolean }) => setAdminActive(item.id, !item.is_active),
    onSuccess: async () => { onError(""); await client.invalidateQueries({ queryKey: ["admin-users"] }); await client.invalidateQueries({ queryKey: ["admin-summary"] }); },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  return (
    <div>
      <form className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); setQ(draft); }}>
        <input className="field min-w-0 flex-1" value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={t("admin.search")} placeholder={t("admin.search")} />
        <button className="btn-secondary" type="submit">{t("space.filter")}</button>
      </form>
      {users.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {users.isError ? <ErrorState label={t("common.error")} /> : null}
      {users.data && users.data.items.length === 0 ? <div className="mt-4"><EmptyState title={t("admin.empty")} /></div> : null}
      <ul className="mt-4 space-y-3">
        {users.data?.items.map((item) => (
          <li key={item.id} className="card">
            <p dir="auto">{item.full_name}</p>
            <p className="text-sm text-muted">{item.email}</p>
            <p className="mt-1 text-sm">{item.is_active ? t("admin.active") : t("admin.inactive")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <select className="field" value={roles[item.id] ?? item.role} onChange={(event) => setRoles((current) => ({ ...current, [item.id]: event.target.value as Role }))}>
                <option value="contributor">{t("roles.contributor")}</option>
                <option value="validator">{t("roles.validator")}</option>
                <option value="admin">{t("roles.admin")}</option>
              </select>
              <button className="btn-secondary" type="button" onClick={() => { void confirmAction(t("admin.confirmRole")).then((ok) => { if (ok) role.mutate(item); }); }}>{t("admin.saveRole")}</button>
              <button className="btn-secondary" type="button" onClick={() => { void confirmAction(t("admin.confirmActive")).then((ok) => { if (ok) active.mutate(item); }); }}>{item.is_active ? t("admin.deactivate") : t("admin.activate")}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Validators() {
  const { t, i18n } = useTranslation();
  const rows = useQuery({ queryKey: ["admin-validators"], queryFn: fetchAdminValidators });
  return (
    <div>
      {rows.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {rows.isError ? <ErrorState label={t("common.error")} /> : null}
      {rows.data && rows.data.items.length === 0 ? <EmptyState title={t("admin.empty")} /> : null}
      <ul className="space-y-3">
        {rows.data?.items.map((item) => (
          <li key={item.id} className="card">
            <p dir="auto">{item.full_name}</p>
            <p className="text-sm text-muted">{item.email}</p>
            <p className="mt-2 text-sm">{t("admin.decisions")} : {formatCount(item.decisions, i18n.language)}{item.latest ? ` · ${codeLabel(t, item.latest)}` : ""}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Categories({ onError }: { onError: (value: string) => void }) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const rows = useQuery({ queryKey: ["admin-categories"], queryFn: fetchAdminCategories });
  const toggle = useMutation({
    mutationFn: (item: { id: string; is_active: boolean }) => setAdminCategoryActive(item.id, !item.is_active),
    onSuccess: async () => { onError(""); await client.invalidateQueries({ queryKey: ["admin-categories"] }); await client.invalidateQueries({ queryKey: ["categories"] }); },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  return (
    <div>
      {rows.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {rows.isError ? <ErrorState label={t("common.error")} /> : null}
      <ul className="space-y-3">
        {rows.data?.items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
            <span><span dir="auto">{categoryName(item, i18n.language)}</span><span className="mt-1 block text-xs text-muted">{item.slug} · {t("admin.stories")} {formatCount(item.stories, i18n.language)}</span></span>
            <button className="btn-secondary" type="button" onClick={() => { void confirmAction(t("admin.confirmCategory")).then((ok) => { if (ok) toggle.mutate(item); }); }}>{item.is_active ? t("admin.deactivate") : t("admin.activate")}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Moderation() {
  const { t } = useTranslation();
  const rows = useQuery({ queryKey: ["admin-moderation"], queryFn: fetchAdminModeration });
  return (
    <div className="space-y-6">
      {rows.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {rows.isError ? <ErrorState label={t("common.error")} /> : null}
      <div>
        <h2 className="section-title mt-0">{t("admin.corrections")}</h2>
        {rows.data && rows.data.corrections.length === 0 ? <div className="mt-3"><EmptyState title={t("admin.empty")} /></div> : null}
        <ul className="mt-3 space-y-2">{rows.data?.corrections.map((item) => <li key={item.id}><Link className="block rounded-2xl border border-line px-4 py-3" to={`/stories/${item.story_id}/edit`} dir="auto">{item.title}</Link></li>)}</ul>
      </div>
      <div>
        <h2 className="section-title">{t("admin.pending")}</h2>
        {rows.data && rows.data.pending.length === 0 ? <div className="mt-3"><EmptyState title={t("admin.empty")} /></div> : null}
        <ul className="mt-3 space-y-2">{rows.data?.pending.map((item) => <li key={item.id}><Link className="block rounded-2xl border border-line px-4 py-3" to={`/stories/${item.id}`} dir="auto">{item.title}</Link></li>)}</ul>
      </div>
    </div>
  );
}

function Deletions({ onError }: { onError: (value: string) => void }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const rows = useQuery({ queryKey: ["admin-deletions"], queryFn: fetchAdminDeletions });
  const [kept, setKept] = useState(false);
  const update = useMutation({
    mutationFn: (item: { id: string; status: string }) => reviewAdminDeletion(item.id, item.status),
    onSuccess: async () => { setKept(true); onError(""); await client.invalidateQueries({ queryKey: ["admin-deletions"] }); },
    onError: (caught) => onError(getErrorMessage(caught, t("common.error"))),
  });
  return (
    <div>
      <p className="text-sm text-muted">{t("admin.policy")}</p>
      {rows.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {rows.isError ? <ErrorState label={t("common.error")} /> : null}
      {rows.data && rows.data.items.length === 0 ? <div className="mt-4"><EmptyState title={t("admin.empty")} /></div> : null}
      <ul className="mt-4 space-y-3">
        {rows.data?.items.map((item) => (
          <li key={item.id} className="card">
            <p>{codeLabel(t, item.scope)} · {codeLabel(t, item.status)}</p>
            <p className="mt-1 text-sm text-muted" dir="auto">{item.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-secondary" type="button" onClick={() => { void confirmAction(t("admin.confirmActive")).then((ok) => { if (ok) update.mutate({ id: item.id, status: "retained" }); }); }}>{t("admin.retain")}</button>
              <button className="btn-secondary" type="button" onClick={() => { void confirmAction(t("admin.confirmActive")).then((ok) => { if (ok) update.mutate({ id: item.id, status: "reviewed" }); }); }}>{t("admin.review")}</button>
            </div>
          </li>
        ))}
      </ul>
      {kept ? <p className="mt-3 text-sm text-forest">{t("admin.kept")}</p> : null}
    </div>
  );
}

function Journal() {
  const { t, i18n } = useTranslation();
  const rows = useQuery({ queryKey: ["admin-journal"], queryFn: fetchAdminJournal });
  return (
    <div>
      {rows.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {rows.isError ? <ErrorState label={t("common.error")} /> : null}
      {rows.data && rows.data.items.length === 0 ? <EmptyState title={t("admin.empty")} /> : null}
      <ul className="space-y-2">
        {rows.data?.items.map((item) => (
          <li key={`${item.kind}-${item.id}`} className="rounded-2xl border border-line px-4 py-3 text-sm">
            <span>{codeLabel(t, item.action)}</span>
            <span className="mt-1 block text-muted">{codeLabel(t, item.kind)} · {formatDate(item.at, i18n.language)}{item.detail ? ` · ${detailLabel(t, item.detail)}` : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Exports({ onError }: { onError: (value: string) => void }) {
  const { t } = useTranslation();
  async function run(format: string, kind: string, name: string) {
    try {
      saveFile(name, await downloadAdminExport(format, kind));
      onError("");
    } catch (caught) {
      onError(getErrorMessage(caught, t("common.error")));
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn" type="button" onClick={() => run("csv", "users", "rawi-users.csv")}>{t("admin.exportUsers")}</button>
      <button className="btn-secondary" type="button" onClick={() => run("json", "stories", "rawi-stories.json")}>{t("admin.exportStories")}</button>
    </div>
  );
}
