"""Points d'entrée du module NLP. Phase 1 : aucun traitement n'est exécuté."""

from rawi_nlp.contracts import (
    ClassificationRequest,
    ClassificationResult,
    ExtractionRequest,
    ExtractionResult,
    TranscriptionRequest,
    TranscriptionResult,
)

NOT_READY = "not_implemented"


def transcribe(request: TranscriptionRequest) -> TranscriptionResult:
    if not request.audio_reference.strip():
        raise ValueError("La référence audio est vide.")
    return TranscriptionResult(
        status=NOT_READY,
        transcript=None,
        detected_language=None,
        message="La transcription n'est pas disponible en phase 1.",
    )


def extract_structure(request: ExtractionRequest) -> ExtractionResult:
    if not request.text.strip():
        raise ValueError("Le texte du récit est vide.")
    return ExtractionResult(
        status=NOT_READY,
        ingredients=None,
        steps=None,
        message="L'extraction d'ingrédients et d'étapes n'est pas disponible en phase 1.",
    )


def classify_story(request: ClassificationRequest) -> ClassificationResult:
    if not request.text.strip():
        raise ValueError("Le texte du récit est vide.")
    return ClassificationResult(
        status=NOT_READY,
        category_slug=None,
        message="La classification automatique n'est pas disponible en phase 1.",
    )
