import json
from pathlib import Path

import pytest

from rawi_analysis import compare_stories, confidence_indicator, find_contradictions
from rawi_analysis.contracts import StorySnapshot, ComparisonRequest

ROOT = Path(__file__).resolve().parents[2]
SAMPLE = ROOT / "datasets" / "samples" / "stories.json"


def _request() -> ComparisonRequest:
    return ComparisonRequest(
        stories=[
            StorySnapshot("a", "Premier récit synthétique suffisamment long.", "masque-visage", "fr"),
            StorySnapshot("b", "Second récit synthétique suffisamment long.", "masque-visage", "fr"),
        ]
    )


def test_comparison_is_not_implemented():
    result = compare_stories(_request())
    assert result.status == "not_implemented"
    assert result.pairs is None


def test_contradictions_are_not_implemented():
    result = find_contradictions(_request())
    assert result.status == "not_implemented"
    assert result.contradictions is None


def test_confidence_has_no_value():
    result = confidence_indicator(_request())
    assert result.status == "not_implemented"
    assert result.value is None
    assert "médicale" in result.disclaimer


def test_too_few_stories_are_rejected():
    request = ComparisonRequest(stories=[StorySnapshot("a", "Un seul récit.", None, "fr")])
    with pytest.raises(ValueError):
        compare_stories(request)


def test_sample_dataset_is_synthetic_and_has_no_score():
    payload = json.loads(SAMPLE.read_text(encoding="utf-8"))
    assert payload["synthetic"] is True
    raw = SAMPLE.read_text(encoding="utf-8").lower()
    assert "score" not in raw
    assert "confidence" not in raw
    assert len(payload["stories"]) >= 3
