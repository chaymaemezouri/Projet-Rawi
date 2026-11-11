"""Points d'entrée data science. Phase 1 : aucun calcul n'est lancé."""

from rawi_analysis.contracts import (
    MEDICAL_DISCLAIMER,
    ComparisonRequest,
    ComparisonResult,
    ConfidenceResult,
    ConsistencyResult,
)

NOT_READY = "not_implemented"


def compare_stories(request: ComparisonRequest) -> ComparisonResult:
    if len(request.stories) < 2:
        raise ValueError("La comparaison demande au moins deux récits.")
    return ComparisonResult(
        status=NOT_READY,
        pairs=None,
        message="La comparaison des récits n'est pas disponible en phase 1.",
    )


def find_contradictions(request: ComparisonRequest) -> ConsistencyResult:
    if len(request.stories) < 2:
        raise ValueError("La recherche de contradictions demande au moins deux récits.")
    return ConsistencyResult(
        status=NOT_READY,
        contradictions=None,
        message="La détection de contradictions n'est pas disponible en phase 1.",
    )


def confidence_indicator(request: ComparisonRequest) -> ConfidenceResult:
    if not request.stories:
        raise ValueError("Aucun récit à évaluer.")
    return ConfidenceResult(status=NOT_READY, value=None, disclaimer=MEDICAL_DISCLAIMER)
