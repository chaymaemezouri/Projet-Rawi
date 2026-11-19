import { useTranslation } from "react-i18next";

interface ModuleStatusPanelProps {
  status: string;
  message: string;
  disclaimer: string;
}

export function ModuleStatusPanel({ status, message, disclaimer }: ModuleStatusPanelProps) {
  const { t } = useTranslation();
  const kicker = status === "available" ? "module.ready" : status === "unavailable" ? "module.unavailable" : "module.notReady";
  return (
    <article className="card space-y-3">
      <p className="kicker">{t(kicker)}</p>
      <p data-testid="module-status" className="text-sm text-muted">
        {status}
      </p>
      <p>{message}</p>
      <p className="text-sm text-muted">{t(status === "not_implemented" ? "module.noScore" : "module.lexical")}</p>
      <p className="border-s-4 border-clay ps-3 text-sm">{disclaimer}</p>
    </article>
  );
}
