"""Contrats du module d'analyse. Phase 1 : pas de calcul."""

from dataclasses import dataclass


@dataclass(frozen=True)
class StorySnapshot:
    story_id: str
    text: str
    category_slug: str | None
    language: str


@dataclass(frozen=True)
class ComparisonRequest:
    stories: list[StorySnapshot]


@dataclass(frozen=True)
class ComparisonResult:
    status: str
    pairs: list[dict] | None
    message: str


@dataclass(frozen=True)
class ConsistencyResult:
    status: str
    contradictions: list[dict] | None
    message: str


@dataclass(frozen=True)
class ConfidenceResult:
    status: str
    value: None
    disclaimer: str


MEDICAL_DISCLAIMER = (
    "Aucun indicateur de confiance n'est calculé. "
    "Un futur indicateur ne constituera jamais une validation médicale."
)
