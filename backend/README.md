# Backend

API FastAPI de la phase 1. Les commandes se lancent depuis ce dossier.

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt -r requirements-dev.txt
copy ..\.env.example ..\.env
.\.venv\Scripts\alembic upgrade head
.\.venv\Scripts\uvicorn app.main:app --reload
.\.venv\Scripts\pytest
```

PostgreSQL doit écouter sur `localhost:5432`, ou bien seul le service `db` de Docker Compose est démarré.

Swagger : <http://localhost:8000/docs>.
