"""Stockage local des fichiers de récit. Le nom enregistré ne vient jamais du client."""

from __future__ import annotations

import re
import uuid
from pathlib import Path

from app.core.config import get_settings

_SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")
_SUFFIX = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}


def media_root() -> Path:
    root = Path(get_settings().media_root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def detect_content_type(data: bytes) -> str | None:
    if data.startswith(b"%PDF"):
        return "application/pdf"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"OggS"):
        return "audio/ogg"
    if data.startswith(b"\x1a\x45\xdf\xa3"):
        return "audio/webm"
    if data.startswith(b"ID3") or (len(data) > 1 and data[0] == 0xFF and (data[1] & 0xE0) == 0xE0):
        return "audio/mpeg"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WAVE":
        return "audio/wav"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    if len(data) >= 12 and data[4:8] == b"ftyp":
        return "audio/mp4"
    return None


def kind_for(content_type: str) -> str:
    if content_type.startswith("audio/"):
        return "audio"
    if content_type.startswith("image/"):
        return "image"
    return "document"


def safe_original_name(filename: str | None, content_type: str) -> str:
    raw = Path(filename or "document").name
    cleaned = _SAFE_NAME.sub("-", raw).strip(".-") or "document"
    suffix = _SUFFIX[content_type]
    if not cleaned.lower().endswith(suffix):
        cleaned = f"{cleaned[:160]}{suffix}"
    return cleaned[:180]


def allocate_path(story_id: uuid.UUID, content_type: str) -> tuple[str, Path]:
    stored_name = f"{uuid.uuid4().hex}{_SUFFIX[content_type]}"
    directory = (media_root() / str(story_id)).resolve()
    directory.mkdir(parents=True, exist_ok=True)
    if media_root() not in directory.parents and directory != media_root():
        raise ValueError("Le dossier de stockage sort de la racine autorisée.")
    path = directory / stored_name
    return stored_name, path


def resolve_stored(story_id: uuid.UUID, stored_name: str) -> Path:
    if Path(stored_name).name != stored_name or stored_name.startswith("."):
        raise ValueError("Nom de fichier refusé.")
    path = (media_root() / str(story_id) / stored_name).resolve()
    if media_root() not in path.parents:
        raise ValueError("Chemin refusé.")
    return path


def remove_file(story_id: uuid.UUID, stored_name: str) -> None:
    try:
        path = resolve_stored(story_id, stored_name)
    except ValueError:
        return
    if path.is_file():
        path.unlink()
