from fastapi import APIRouter

from app.api.routes import auth, categories, health, me, modules, stories, users

api_router = APIRouter()
api_router.include_router(health.router, tags=["Santé"])
api_router.include_router(auth.router, tags=["Authentification"])
api_router.include_router(users.router, tags=["Utilisateurs"])
api_router.include_router(categories.router, tags=["Catégories"])
api_router.include_router(stories.router, tags=["Récits"])
api_router.include_router(me.router, tags=["Espace utilisateur"])
api_router.include_router(modules.router, tags=["Modules à venir"])
