import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Pending = { message: string; resolve: (accepted: boolean) => void };

let ask: ((message: string) => Promise<boolean>) | null = null;

export function confirmAction(message: string) {
  return ask ? ask(message) : Promise.resolve(window.confirm(message));
}

export function ConfirmRoot() {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    ask = (message) => new Promise((resolve) => setPending({ message, resolve }));
    return () => {
      ask = null;
    };
  }, []);

  useEffect(() => {
    if (!pending) return undefined;
    cancelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>("button")];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending]);

  function close(accepted: boolean) {
    pending?.resolve(accepted);
    setPending(null);
  }

  if (!pending) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/40 p-4" onClick={() => close(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        className="card w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-2xl">{pending.message}</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          <button className="btn" type="button" onClick={() => close(true)}>{t("common.confirm")}</button>
          <button ref={cancelRef} className="btn-secondary" type="button" onClick={() => close(false)}>{t("common.cancel")}</button>
        </div>
      </div>
    </div>
  );
}
