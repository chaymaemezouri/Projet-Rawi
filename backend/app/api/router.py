from fastapi import APIRouter

from app.api.routes import admin, auth, categories, comparisons, guides, health, me, media, modules, recipes, reviews, stories, users

api_router = APIRouter()
api_router.include_router(health.router, tags=["Santé"])
api_router.include_router(auth.router, tags=["Authentification"])
api_router.include_router(users.router, tags=["Utilisateurs"])
api_router.include_router(admin.router, tags=["Administration"])
api_router.include_router(categories.router, tags=["Catégories"])
api_router.include_router(stories.router, tags=["Récits"])
api_router.include_router(comparisons.router, tags=["Comparaison"])
api_router.include_router(reviews.router, tags=["Validation"])
api_router.include_router(recipes.router, tags=["Recettes"])
api_router.include_router(guides.router, tags=["Guide"])
api_router.include_router(media.router, tags=["Fichiers de récit"])
api_router.include_router(me.router, tags=["Espace utilisateur"])
api_router.include_router(modules.router, tags=["Modules à venir"])
