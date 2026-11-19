import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PendingFile } from "./AudioCapture";

const ACCEPTED = "image/jpeg,image/png,image/webp,application/pdf";

export function DocumentImport({ onPending }: { onPending?: (file: PendingFile | null) => void }) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [manuscript, setManuscript] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function choose(next: File | null) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next && next.type.startsWith("image/") ? URL.createObjectURL(next) : null;
    setPreview(urlRef.current);
    setFile(next);
    if (next && consent) onPending?.({ blob: next, name: next.name });
    else onPending?.(null);
  }

  return (
    <section className="rounded-[1.75rem] border border-dashed border-forest/30 bg-cream/80 p-5" aria-label={t("collect.importTitle")}>
      <p className="kicker">{t("collect.importTitle")}</p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t("collect.importLead")}</p>
      <label className="mt-4 block">
        <span className="label">{t("collect.chooseFile")}</span>
        <input
          className="field"
          type="file"
          accept={ACCEPTED}
          onChange={(event) => choose(event.target.files?.[0] ?? null)}
        />
      </label>
      {file ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper">
          {preview ? <img src={preview} alt="" className="max-h-72 w-full object-contain" /> : null}
          <p className="px-4 py-3 text-sm">
            {file.name}
            <span className="text-muted"> · {Math.ceil(file.size / 1024)} {t("collect.kilobytes")}</span>
          </p>
        </div>
      ) : null}
      <label className="mt-4 flex items-start gap-3 text-sm">
        <input className="mt-1 h-4 w-4 accent-forest" type="checkbox" checked={manuscript} onChange={(event) => setManuscript(event.target.checked)} />
        <span>{t("collect.manuscript")}</span>
      </label>
      <label className="mt-3 flex items-start gap-3 text-sm">
        <input
          className="mt-1 h-4 w-4 accent-forest"
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            const next = event.target.checked;
            setConsent(next);
            if (file && next) onPending?.({ blob: file, name: file.name });
            else onPending?.(null);
          }}
        />
        <span>
          {t("collect.fileConsent")}
          <span className="mt-1 block text-muted">{t("collect.fileConsentHelp")}</span>
        </span>
      </label>
      {manuscript ? <p className="mt-3 text-sm text-clay-ink">{t("collect.manuscriptNote")}</p> : null}
    </section>
  );
}
