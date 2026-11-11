import pytest

from rawi_nlp.contracts import ClassificationRequest, ExtractionRequest, TranscriptionRequest
from rawi_nlp import classify_story, extract_structure, transcribe


def test_transcription_is_not_implemented():
    result = transcribe(TranscriptionRequest(audio_reference="samples/recit.wav", language_hint="ary"))
    assert result.status == "not_implemented"
    assert result.transcript is None
    assert not hasattr(result, "confidence")


def test_extraction_returns_no_structure():
    result = extract_structure(ExtractionRequest(text="Un récit assez long pour le contrat.", language="fr"))
    assert result.status == "not_implemented"
    assert result.ingredients is None
    assert result.steps is None


def test_classification_returns_no_category():
    result = classify_story(
        ClassificationRequest(text="Récit de soin au rhassoul.", language="fr", category_slugs=["masque-visage"])
    )
    assert result.status == "not_implemented"
    assert result.category_slug is None


def test_empty_input_is_rejected():
    with pytest.raises(ValueError):
        extract_structure(ExtractionRequest(text="   ", language="fr"))
