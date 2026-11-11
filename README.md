# RAWI – راوي

Plateforme de collecte et de préservation des savoirs traditionnels marocains et africains liés aux plantes, à la beauté naturelle et aux soins ancestraux. Le nom désigne le conteur : la personne qui transmet, et l'outil qui garde le récit sans le remplacer.

Cette base est la phase 1. Elle est exécutable. Elle ne simule ni transcription, ni extraction, ni score de confiance.

## Objectifs

- Recueillir un récit avec son détenteur, sa source, sa langue, sa catégorie et le consentement de la personne.
- Distinguer le texte collecté, une future proposition d'IA et une validation humaine.
- Permettre à cinq développeurs de travailler en parallèle sans se marcher sur les contrats.

Un statut « validé » signifie qu'un humain a relu la fiche. Ce n'est pas une validation médicale.

## Architecture

Le frontend parle à l'API FastAPI. L'API parle à PostgreSQL. Les modules `ai-nlp` et `data-analysis` exposent des fonctions typées qui répondent `not_implemented`. Le détail est dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```text
frontend/          interface
backend/           API, modèles, migrations, tests
ai-nlp/            contrats NLP
data-analysis/     contrats d'analyse
datasets/samples/  récits fictifs, hors base
security-devops/   sécurité et exploitation
docs/              architecture, équipe, contrats, feuille de route
```

## Technologies

| Zone | Choix de cette phase |
| --- | --- |
| Interface | React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, i18next |
| API | Python, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Données | PostgreSQL |
| Auth | bcrypt et JWT |
| Qualité | pytest, Vitest, ESLint, Prettier |
| Exploitation | Docker Compose, GitHub Actions |

Whisper, spaCy, Transformers, Pandas, NumPy et scikit-learn sont prévus pour les phases suivantes. Ils ne sont pas installés tant qu'ils n'ont rien à calculer.

## Installation locale

Prérequis : Python 3.11 ou 3.12, Node.js 22, PostgreSQL 16. Sous Windows, Node.js doit être dans le `PATH`.

```powershell
cd rawi-platform
copy .env.example .env
docker compose up db -d
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt -r requirements-dev.txt
.\.venv\Scripts\alembic upgrade head
.\.venv\Scripts\uvicorn app.main:app --reload
```

Si le port 5432 est déjà occupé, définissez `$env:POSTGRES_PORT="5434"` avant `docker compose` et pointez `DATABASE_URL` vers `localhost:5434`. Le backend lancé dans Compose joint PostgreSQL par le réseau interne, sans dépendre de ce port.

Dans un second terminal :

```powershell
cd rawi-platform\frontend
npm install
npm run dev
```

- Application : <http://localhost:5173>
- API : <http://localhost:8000/docs>

Le fichier `.env` n'est pas versionné. Les valeurs d'exemple créent, au premier démarrage hors tests, un administrateur `admin@rawi.local` / `change-me-admin`. Changez-les avant tout usage autre que votre machine.

## Démarrage avec Docker Compose

Depuis `rawi-platform` :

```powershell
docker compose up --build
```

PostgreSQL, l'API et l'interface démarrent ensemble. Le premier lancement du frontend installe les paquets dans un volume Docker. L'administrateur local est le même que dans l'exemple ci-dessus.

Arrêt :

```powershell
docker compose down
```

`docker compose down -v` efface aussi la base.

## Parcours de vérification

1. Ouvrir l'accueil.
2. Créer un compte et se connecter.
3. Déposer un récit, cocher le consentement, choisir une catégorie.
4. Retrouver le récit dans la liste et ouvrir sa fiche.
5. Consulter `/docs`.
6. Pour valider un récit : se connecter en administrateur, promouvoir un compte avec `PATCH /api/users/{id}/role` et le corps `{ "role": "validator" }`, puis changer le statut depuis la fiche ou Swagger.

Les pages Intelligence artificielle, Analyse, Validation groupée et Recettes affichent l'état renvoyé par l'API : non disponible, sans résultat.

## Tests

```powershell
cd backend
.\.venv\Scripts\pytest
cd ..\ai-nlp
..\backend\.venv\Scripts\pytest
cd ..\data-analysis
..\backend\.venv\Scripts\pytest
cd ..\frontend
npm test
npm run lint
npm run build
```

Les tests d'API utilisent SQLite en mémoire. La migration Alembic cible PostgreSQL et s'exécute au démarrage Docker.

## Équipe

Cinq responsables : frontend, backend, IA / NLP, data science, sécurité / DevOps. La répartition des dossiers est dans [docs/TEAM.md](docs/TEAM.md). Les règles de branches et de commits sont dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Fonctionnalités présentes

- Accueil, inscription, connexion, tableau de bord.
- Création, lecture, modification et suppression des récits.
- Catégories semées et, pour un administrateur, création.
- Association d'un récit à une catégorie.
- Statut de validation humaine.
- Favoris.
- Interface en français, arabe et darija.
- Documentation OpenAPI.

## Fonctionnalités à venir

Transcription, extraction, classification, comparaison, contradictions, indicateurs, génération de recettes et guide de préparation. Voir [docs/ROADMAP.md](docs/ROADMAP.md) et [docs/CONTRACTS.md](docs/CONTRACTS.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Contrats NLP et data](docs/CONTRACTS.md)
- [Prototypes repris](docs/PROTOTYPES.md)
- [Sécurité](security-devops/SECURITY.md)
