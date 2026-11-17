import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.db.seed import seed_reference_data
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)


def _require_production_secrets(settings) -> None:
    if settings.environment != "production":
        return
    if settings.jwt_secret.startswith("change-me") or len(settings.jwt_secret) < 32:
        raise RuntimeError("JWT_SECRET doit être propre à ce serveur et contenir au moins 32 caractères.")
    password = settings.admin_password or ""
    if not settings.admin_email or password.startswith("change-me") or len(password) < 12:
        raise RuntimeError(
            "ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis. Le mot de passe d'exemple est refusé en production."
        )
    if "://rawi:rawi@" in settings.database_url or "://rawi:change-me" in settings.database_url:
        raise RuntimeError("Le mot de passe PostgreSQL d'exemple ne peut pas être utilisé en production.")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    _require_production_secrets(settings)
    if settings.environment != "test":
        db = SessionLocal()
        try:
            seed_reference_data(db)
        finally:
            db.close()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="RAWI API",
        version="0.1.0",
        summary="API de préservation des savoirs traditionnels.",
        description=(
            "Phase 1 : comptes, récits collectés, catégories et validation humaine. "
            "Les modules d'intelligence artificielle et d'analyse ne produisent aucun résultat. "
            "Aucun indicateur de confiance n'est calculé, et rien dans cette API ne constitue une validation médicale."
        ),
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def add_security_headers(request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        return response

    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
