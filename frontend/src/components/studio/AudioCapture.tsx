import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type CaptureState = "idle" | "recording" | "ready" | "unsupported";

export function AudioCapture() {
  const { t } = useTranslation();
  const [state, setState] = useState<CaptureState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);

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
      };
      recorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setState("unsupported");
    }
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  const statusLabel =
    state === "recording" ? t("design.audioRecording") : state === "ready" ? t("design.audioReady") : t("design.audioIdle");

  return (
    <section className="rounded-[1.75rem] border border-line bg-cream/80 p-5" aria-label={t("design.audioTitle")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">{t("design.audioTitle")}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t("design.audioLead")}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`flex h-16 w-16 items-center justify-center ${state === "recording" ? "audio-live" : ""}`}>
            <span className={`h-4 w-4 rounded-full ${state === "recording" ? "bg-clay" : "bg-forest"}`} />
          </span>
          <p className="text-sm font-medium" aria-live="polite">
            {statusLabel}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {state === "recording" ? (
          <button className="btn" type="button" onClick={stop}>
            {t("design.audioStop")}
          </button>
        ) : (
          <button className="btn" type="button" onClick={() => void start()}>
            {state === "ready" ? t("design.audioAgain") : t("design.audioStart")}
          </button>
        )}
        {audioUrl ? (
          <audio controls src={audioUrl} className="max-w-full">
            {t("design.audioPlay")}
          </audio>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-muted">{state === "unsupported" ? t("design.audioUnsupported") : t("design.audioLocal")}</p>
    </section>
  );
}
