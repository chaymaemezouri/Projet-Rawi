"""Contrats d'entrée et de sortie du module IA / NLP.

Phase 1 : les fonctions décrivent le futur échange avec le backend.
Elles ne transcrivent rien, n'extraient rien et ne calculent aucun indicateur.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class TranscriptionRequest:
    audio_reference: str
    language_hint: str | None = None


@dataclass(frozen=True)
class TranscriptionResult:
    status: str
    transcript: str | None
    detected_language: str | None
    message: str


@dataclass(frozen=True)
class ExtractionRequest:
    text: str
    language: str


@dataclass(frozen=True)
class ExtractionResult:
    status: str
    ingredients: list[dict] | None
    steps: list[dict] | None
    message: str


@dataclass(frozen=True)
class ClassificationRequest:
    text: str
    language: str
    category_slugs: list[str]


@dataclass(frozen=True)
class ClassificationResult:
    status: str
    category_slug: str | None
    message: str
