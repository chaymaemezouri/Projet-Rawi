from fastapi import APIRouter

from app.api.deps import CurrentUser
from app.services.speech import UNAVAILABLE

router = APIRouter(prefix="/modules")

DISCLAIMER = (
    "Aucun indicateur de confiance n'est calculé dans cette phase. "
    "Un futur indicateur ne constituera jamais une validation médicale ni une preuve scientifique."
)


def _pending(message: str) -> dict:
    return {"status": "not_implemented", "result": None, "message": message}


def _lexical(message: str) -> dict:
    return {"status": "available", "result": None, "message": message}


def _transcription() -> dict:
    try:
        import faster_whisper  # noqa: F401
    except ImportError:
        return {"status": "unavailable", "result": None, "message": UNAVAILABLE}
    return {
        "status": "available",
        "result": None,
        "message": "faster-whisper transcrit un fichier déjà conservé. Le texte brut reste séparé du récit.",
    }


@router.get("/status")
def module_status(_user: CurrentUser) -> dict:
    return {
        "phase": "1",
        "disclaimer": DISCLAIMER,
        "modules": {
            "transcription": _transcription(),
            "extraction": _lexical("L'extraction utilise le lexique RAWI. Elle ne modifie pas le récit et n'invente aucune quantité."),
            "classification": _lexical("La classification propose une catégorie seulement si des formes du lexique la distinguent. Sinon le statut est incertain."),
            "comparison": _lexical("La comparaison applique des règles documentaires sur les passages relevés. Elle n'invente ni similarité ni contradiction."),
            "contradictions": _lexical("Une contradiction n'est signalée que par une règle explicite sur deux valeurs présentes. Une valeur absente n'en est pas une."),
            "confidence": _pending("Aucun indicateur de confiance n'est produit."),
            "recipe_generation": _lexical("La fiche reprend uniquement les passages relevés. Une valeur absente reste vide."),
        },
    }
