import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../api/client";
import { login, register } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import type { LanguageCode } from "../types";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const session = await login(email, password);
      setSession(session.access_token, session.user);
      navigate("/dashboard");
    } catch (caught) {
      setError(getErrorMessage(caught, t("common.error")));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="grid min-h-[70vh] lg:grid-cols-2">
      <div className="relative hidden min-h-[28rem] lg:block">
        <img src="/images/rawi-library.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex items-center px-5 py-14">
        <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md space-y-4" aria-label={t("auth.loginTitle")}>
          <p className="kicker">RAWI</p>
          <h1 className="text-4xl">{t("auth.loginTitle")}</h1>
          <label className="block">
            <span className="label">{t("auth.email")}</span>
            <input className="field" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block">
            <span className="label">{t("auth.password")}</span>
            <input className="field" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <button className="btn w-full" type="submit" disabled={pending}>
            {t("auth.loginAction")}
          </button>
          <p className="text-sm text-muted">
            {t("auth.needAccount")}{" "}
            <Link className="font-medium text-forest" to="/register">
              {t("nav.register")}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setSession } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("fr");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError(t("auth.mismatch"));
      return;
    }
    setPending(true);
    setError("");
    try {
      const session = await register({
        email,
        password,
        full_name: fullName,
        preferred_language: language,
      });
      setSession(session.access_token, session.user);
      navigate("/dashboard");
    } catch (caught) {
      setError(getErrorMessage(caught, t("common.error")));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="grid min-h-[70vh] lg:grid-cols-2">
      <div className="relative hidden min-h-[28rem] lg:block">
        <img src="/images/rawi-botanical.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex items-center px-5 py-14">
        <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md space-y-4" aria-label={t("auth.registerTitle")}>
          <p className="kicker">RAWI</p>
          <h1 className="text-4xl">{t("auth.registerTitle")}</h1>
          <p className="text-sm text-muted">{t("auth.helper")}</p>
          <label className="block">
            <span className="label">{t("auth.fullName")}</span>
            <input className="field" required minLength={2} value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label className="block">
            <span className="label">{t("auth.email")}</span>
            <input className="field" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block">
            <span className="label">{t("auth.password")}</span>
            <input className="field" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className="block">
            <span className="label">{t("auth.confirm")}</span>
            <input className="field" type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </label>
          <label className="block">
            <span className="label">{t("auth.language")}</span>
            <select className="field" value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
              <option value="fr">{t("lang.fr")}</option>
              <option value="ar">{t("lang.ar")}</option>
              <option value="ary">{t("lang.ary")}</option>
            </select>
          </label>
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <button className="btn w-full" type="submit" disabled={pending}>
            {t("auth.registerAction")}
          </button>
          <p className="text-sm text-muted">
            {t("auth.haveAccount")}{" "}
            <Link className="font-medium text-forest" to="/login">
              {t("nav.login")}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
