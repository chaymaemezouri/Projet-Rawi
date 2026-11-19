import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export type PendingFile = { blob: Blob; name: string };

type CaptureState = "idle" | "recording" | "paused" | "ready" | "unsupported";

export function AudioCapture({ onPending }: { onPending?: (file: PendingFile | null) => void }) {
  const { t } = useTranslation();
  const [state, setState] = useState<CaptureState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function rememberUrl(next: string | null) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setAudioUrl(next);
  }

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        rememberUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setState("ready");
        blobRef.current = blob;
        if (consent) onPending?.({ blob, name: "recit.webm" });
      };
      recorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setState("unsupported");
    }
  }

  function pause() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording" && typeof recorder.pause === "function") {
      recorder.pause();
      setState("paused");
    }
  }

  function resume() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "paused" && typeof recorder.resume === "function") {
      recorder.resume();
      setState("recording");
    }
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  const statusLabel =
    state === "recording"
      ? t("collect.recording")
      : state === "paused"
        ? t("collect.paused")
        : state === "ready"
          ? t("collect.ready")
          : state === "unsupported"
            ? t("design.audioUnsupported")
            : t("collect.micIdle");

  return (
    <section className="rounded-[1.75rem] border border-line bg-cream/80 p-5" aria-label={t("design.audioTitle")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">{t("design.audioTitle")}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t("collect.audioLead")}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`flex h-16 w-16 items-center justify-center ${state === "recording" ? "audio-live" : ""}`} aria-hidden="true">
            <span className={`h-4 w-4 rounded-full ${state === "recording" ? "bg-clay" : state === "paused" ? "bg-gold" : "bg-forest"}`} />
          </span>
          <p className="text-sm font-medium" aria-live="polite">
            {statusLabel}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {state === "recording" || state === "paused" ? (
          <>
            {state === "recording" ? (
              <button className="btn-secondary" type="button" onClick={pause}>
                {t("collect.pause")}
              </button>
            ) : (
              <button className="btn-secondary" type="button" onClick={resume}>
                {t("collect.resume")}
              </button>
            )}
            <button className="btn" type="button" onClick={stop}>
              {t("design.audioStop")}
            </button>
          </>
        ) : (
          <button className="btn" type="button" onClick={() => void start()}>
            {state === "ready" ? t("collect.recordAgain") : t("design.audioStart")}
          </button>
        )}
      </div>
      {audioUrl ? (
        <audio controls src={audioUrl} aria-label={t("design.audioPlay")} className="mt-4 w-full">
          {t("design.audioPlay")}
        </audio>
      ) : null}
      <label className="mt-4 flex items-start gap-3 text-sm">
        <input
          className="mt-1 h-4 w-4 accent-forest"
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            const next = event.target.checked;
            setConsent(next);
            if (blobRef.current && next) onPending?.({ blob: blobRef.current, name: "recit.webm" });
            else onPending?.(null);
          }}
        />
        <span>
          {t("collect.audioConsent")}
          <span className="mt-1 block text-muted">{t("collect.audioConsentHelp")}</span>
        </span>
      </label>
      <p className="mt-3 text-sm text-muted">{t("collect.audioLocalUntilSend")}</p>
    </section>
  );
}
