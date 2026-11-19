"""Transcription audio. Aucun texte n'est produit si le moteur est absent ou en échec."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

from app.core.config import get_settings
from app.core.enums import EngineStatus, LanguageCode

logger = logging.getLogger(__name__)

DARIJA_LIMIT = (
    "La darija n'a pas de modèle dédié. Le moteur, lorsqu'il est disponible, "
    "est lancé avec l'arabe. Le texte doit être relu et ne remplace pas l'audio."
)
REVIEW_LIMIT = "La transcription automatique doit être relue. Elle ne remplace pas l'enregistrement."
UNAVAILABLE = (
    "Le moteur de transcription n'est pas disponible sur ce serveur. "
    "Aucun texte n'a été produit."
)
FAILED = "La transcription a échoué. L'audio est conservé et aucun texte n'a été inventé."


@dataclass(frozen=True)
class SpeechOutcome:
    status: EngineStatus
    text: str | None
    engine: str | None
    message: str


def transcribe_path(path: Path, language: LanguageCode) -> SpeechOutcome:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return SpeechOutcome(EngineStatus.unavailable, None, None, UNAVAILABLE)

    whisper_language = "fr" if language == LanguageCode.fr else "ar"
    message = DARIJA_LIMIT if language == LanguageCode.ary else REVIEW_LIMIT
    settings = get_settings()
    model_dir = Path(settings.whisper_model_dir)
    if not _model_present(model_dir, settings.whisper_model):
        return SpeechOutcome(EngineStatus.unavailable, None, None, UNAVAILABLE)
    try:
        model = WhisperModel(
            settings.whisper_model,
            device="cpu",
            compute_type="int8",
            download_root=str(model_dir),
            local_files_only=True,
        )
        segments, _info = model.transcribe(str(path), language=whisper_language)
        text = "".join(segment.text for segment in segments).strip()
    except Exception:
        logger.exception("Transcription indisponible pour %s", path.name)
        return SpeechOutcome(EngineStatus.failed, None, "faster-whisper", FAILED)
    if not text:
        return SpeechOutcome(EngineStatus.failed, None, "faster-whisper", FAILED)
    return SpeechOutcome(EngineStatus.completed, text, "faster-whisper", message)


def _model_present(model_dir: Path, name: str) -> bool:
    snapshots = model_dir / f"models--Systran--faster-whisper-{name}" / "snapshots"
    return snapshots.is_dir() and any(snapshots.glob("*/model.bin"))
