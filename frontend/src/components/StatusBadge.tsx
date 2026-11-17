import { useTranslation } from "react-i18next";
import type { ValidationStatus } from "../types";

const STYLES: Record<ValidationStatus, string> = {
  pending: "bg-gold/30 text-clay-ink",
  validated: "bg-forest/10 text-forest",
  rejected: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: ValidationStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
}
