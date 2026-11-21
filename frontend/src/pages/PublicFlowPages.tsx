import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AudioCapture } from "../components/studio/AudioCapture";

const PIPELINE = ["received", "waiting", "processing", "proposed", "human", "published"] as const;

function ChoiceIcon({ kind }: { kind: "write" | "speak" }) {
  return (
    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest text-cream">
      {kind === "write" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
          <path d="M13.5 6.5l3 3" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="9" y="3.5" width="6" height="11" rx="3" />
          <path d="M6.5 11a5.5 5.5 0 0 0 11 0" />
          <path d="M12 16.5V20" />
          <path d="M8.5 20h7" />
        </svg>
      )}
    </span>
  );
}

export function HowItWorksPage() {
  const { t } = useTranslation();
  return (
    <section className="container-page py-12 md:py-16">
      <p className="kicker">{t("nav.how")}</p>
      <h1 className="mt-3 max-w-3xl text-5xl">{t("atlas.howTitle")}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{t("atlas.howLead")}</p>
      <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PIPELINE.map((step, index) => (
          <li key={step} className="rounded-[1.5rem] border border-line bg-paper p-5">
            <p className="font-serif text-3xl text-gold">{String(index + 1).padStart(2, "0")}</p>
            <h2 className="mt-3 text-2xl">{t(`atlas.pipeline.${step}`)}</h2>
          </li>
        ))}
      </ol>
      <p className="mt-8 max-w-2xl leading-7">{t("atlas.pipelineNote")}</p>
      <p className="mt-3 max-w-2xl leading-7 text-muted">{t("atlas.unavailable")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn" to="/transmettre">{t("nav.transmit")}</Link>
        <Link className="btn-secondary" to="/themes">{t("nav.themes")}</Link>
      </div>
    </section>
  );
}

export function TransmitFlow({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [method, setMethod] = useState<"write" | "speak" | "">("");
  const [body, setBody] = useState("");
  const [audioReady, setAudioReady] = useState(false);
  const [sent, setSent] = useState(false);
  const ready = method === "write" ? body.trim().length > 1 : method === "speak" && audioReady;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={t("nav.transmit")}>
      <button type="button" className="absolute inset-0 bg-ink/30 backdrop-blur-xl" aria-label={t("design.closeShort")} onClick={onClose} />
      <div className="relative z-10 flex min-h-full items-center justify-center p-5">
        <button type="button" className="absolute end-5 top-5 rounded-full bg-cream/90 px-4 py-2 text-sm text-ink" onClick={onClose}>
          {t("design.closeShort")}
        </button>
        {sent ? (
          <div className="w-full max-w-xl rounded-[2rem] bg-cream/90 p-8 text-ink shadow-card">
            <h2 className="font-serif text-4xl">{t("atlas.receivedSimple")}</h2>
            <p className="mt-4 leading-7">{t("atlas.treatLead")}</p>
            {method === "write" ? (
              <blockquote className="mt-6 border-s-2 border-gold ps-4 text-lg leading-8">{body}</blockquote>
            ) : (
              <p className="mt-6 leading-7">{t("atlas.audioKept")}</p>
            )}
            <button className="btn mt-8" type="button" onClick={() => { setSent(false); setMethod(""); setBody(""); setAudioReady(false); }}>
              {t("common.back")}
            </button>
          </div>
        ) : method === "" ? (
          <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
            {(["write", "speak"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-[2rem] bg-cream/90 px-8 py-14 text-center text-ink shadow-card transition hover:bg-cream"
                onClick={() => setMethod(item)}
              >
                <ChoiceIcon kind={item} />
                <span className="mt-5 block font-serif text-5xl">{t(item === "write" ? "atlas.write" : "atlas.speak")}</span>
                <span className="mt-3 block text-sm text-muted">{t(item === "write" ? "atlas.writeLead" : "atlas.speakLead")}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-xl rounded-[2rem] bg-cream/90 p-8 text-ink shadow-card">
            <button type="button" className="text-sm text-muted" onClick={() => { setMethod(""); setAudioReady(false); }}>
              {t("common.back")}
            </button>
            {method === "write" ? (
              <label className="mt-4 block">
                <span className="label">{t("atlas.fieldBody")}</span>
                <textarea className="field min-h-36" value={body} onChange={(event) => setBody(event.target.value)} />
              </label>
            ) : (
              <div className="mt-4">
                <AudioCapture onPending={(file) => setAudioReady(Boolean(file))} />
              </div>
            )}
            <button className="btn mt-6" type="button" disabled={!ready} onClick={() => ready && setSent(true)}>
              {t("atlas.treat")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TransmitPage() {
  const navigate = useNavigate();
  return <TransmitFlow onClose={() => navigate("/")} />;
}
