from fastapi import APIRouter

from app.api.deps import CurrentUser

router = APIRouter(prefix="/modules")

DISCLAIMER = (
    "Aucun indicateur de confiance n'est calculé dans cette phase. "
    "Un futur indicateur ne constituera jamais une validation médicale ni une preuve scientifique."
)


def _pending(message: str) -> dict:
    return {"status": "not_implemented", "result": None, "message": message}


@router.get("/status")
def module_status(_user: CurrentUser) -> dict:
    return {
        "phase": "1",
        "disclaimer": DISCLAIMER,
        "modules": {
            "transcription": _pending("La transcription audio n'est pas disponible."),
            "extraction": _pending("L'extraction d'ingrédients et d'étapes n'est pas disponible."),
            "classification": _pending("La classification automatique n'est pas disponible."),
            "comparison": _pending("La comparaison de récits n'est pas disponible."),
            "contradictions": _pending("La détection de contradictions n'est pas disponible."),
            "confidence": _pending("Aucun indicateur de confiance n'est produit."),
            "recipe_generation": _pending("La génération de recettes n'est pas disponible."),
        },
    }
