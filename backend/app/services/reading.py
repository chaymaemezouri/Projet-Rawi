"""Lecture de documents. Le fichier original n'est jamais modifié ni remplacé."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from pathlib import Path

from app.core.enums import EngineStatus, LanguageCode

logger = logging.getLogger(__name__)

STRONG_REVIEW = (
    "Manuscrit, arabe ou darija : ce texte extrait doit être vérifié. "
    "Il ne remplace pas le document original."
)
PDF_NOTE = "Texte lu dans la couche textuelle du PDF. Il doit être relu et ne remplace pas le fichier."
OCR_NOTE = "Texte reconnu sur l'image. Il doit être relu et ne remplace pas le document."
PDF_OCR_NOTE = "Texte reconnu sur les pages du PDF. Il doit être relu et ne remplace pas le fichier original."
UNAVAILABLE = "Aucun moteur ne peut lire ce fichier ici. Le document original est conservé et aucun texte n'a été produit."
FAILED = "La lecture du document a échoué. Le fichier original est conservé et aucun texte n'a été inventé."
SCANNED_FAILED = "La reconnaissance des pages n'a produit aucun texte. Le PDF original est conservé et rien n'a été inventé."
MAX_PDF_PAGES = 5
MAX_PDF_SECONDS = 20
MAX_PDF_PIXELS = 4_000_000


@dataclass(frozen=True)
class ReadingOutcome:
    status: EngineStatus
    text: str | None
    engine: str | None
    message: str
    needs_strong_review: bool


def _strong(language: LanguageCode, manuscript: bool) -> bool:
    return manuscript or language in (LanguageCode.ar, LanguageCode.ary)


def _pdf_text(path: Path) -> str | None:
    try:
        from pypdf import PdfReader
    except ImportError:
        return None
    try:
        reader = PdfReader(str(path))
        return "\n".join((page.extract_text() or "") for page in reader.pages).strip()
    except Exception:
        logger.exception("Lecture PDF impossible pour %s", path.name)
        return None


def _tess_lang(language: LanguageCode) -> str:
    return "fra+ara" if language != LanguageCode.fr else "fra"


def _ocr_image(image: object, language: LanguageCode) -> tuple[str | None, str | None]:
    try:
        import pytesseract
    except ImportError:
        return None, None
    try:
        text = pytesseract.image_to_string(image, lang=_tess_lang(language)).strip()
    except Exception:
        logger.exception("OCR impossible")
        return None, "failed"
    return text, "pytesseract"


def _image_text(path: Path, language: LanguageCode) -> tuple[str | None, str | None]:
    try:
        from PIL import Image
    except ImportError:
        return None, None
    try:
        with Image.open(path) as image:
            return _ocr_image(image, language)
    except Exception:
        logger.exception("OCR impossible pour %s", path.name)
        return None, "failed"


def _pdf_ocr(path: Path, language: LanguageCode) -> tuple[str | None, str | None]:
    try:
        import pypdfium2 as pdfium
    except ImportError:
        return None, None
    started = time.monotonic()
    parts: list[str] = []
    try:
        document = pdfium.PdfDocument(str(path))
    except Exception:
        logger.exception("Conversion PDF impossible pour %s", path.name)
        return None, "failed"
    try:
        total = min(len(document), MAX_PDF_PAGES)
        for index in range(total):
            if time.monotonic() - started > MAX_PDF_SECONDS:
                break
            page = document[index]
            width, height = page.get_size()
            scale = 2.0
            if width * height * scale * scale > MAX_PDF_PIXELS:
                scale = max(1.0, (MAX_PDF_PIXELS / max(width * height, 1)) ** 0.5)
            bitmap = page.render(scale=scale)
            text, marker = _ocr_image(bitmap.to_pil(), language)
            bitmap.close()
            page.close()
            if marker == "failed":
                return None, "failed"
            if marker is None:
                return None, None
            if text:
                parts.append(text)
    finally:
        document.close()
    if not parts:
        return None, "failed"
    return "\n".join(parts).strip(), "pytesseract"


def extract_document(path: Path, content_type: str, language: LanguageCode, manuscript: bool) -> ReadingOutcome:
    strong = _strong(language, manuscript)
    note = STRONG_REVIEW if strong else PDF_NOTE
    if content_type == "application/pdf":
        text = _pdf_text(path)
        if text:
            return ReadingOutcome(EngineStatus.completed, text, "pypdf", note, strong)
        if text is None:
            return ReadingOutcome(EngineStatus.unavailable, None, None, UNAVAILABLE, strong)
        ocr_text, marker = _pdf_ocr(path, language)
        if marker is None:
            return ReadingOutcome(EngineStatus.unavailable, None, None, UNAVAILABLE, True)
        if marker == "failed" or not ocr_text:
            return ReadingOutcome(EngineStatus.failed, None, "pytesseract", SCANNED_FAILED, True)
        return ReadingOutcome(EngineStatus.completed, ocr_text, "pytesseract", STRONG_REVIEW if strong else PDF_OCR_NOTE, True)
    image_text, marker = _image_text(path, language) if content_type.startswith("image/") else (None, None)
    if marker is None:
        return ReadingOutcome(EngineStatus.unavailable, None, None, UNAVAILABLE, strong)
    if marker == "failed" or not image_text:
        return ReadingOutcome(EngineStatus.failed, None, "pytesseract", FAILED, True)
    return ReadingOutcome(
        EngineStatus.completed,
        image_text,
        "pytesseract",
        STRONG_REVIEW if strong else OCR_NOTE,
        strong or True,
    )
