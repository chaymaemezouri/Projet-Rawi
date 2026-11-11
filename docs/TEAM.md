# Équipe

Cinq responsables, un dépôt. Les branches de fonctionnalité partent de `develop` et y reviennent par pull request.

| Responsable | Dossiers | Phase 1 | Suite |
| --- | --- | --- | --- |
| 1 — Frontend | `frontend/` | Pages, i18n, appels API, tests d'interface | Guide de préparation, historique plus riche |
| 2 — Backend | `backend/app` hors durcissement auth | Modèles, CRUD, migrations, Swagger | Fichiers audio, versions de récit |
| 3 — IA / NLP | `ai-nlp/` | Contrats et jeux d'exemples | Transcription, extraction, classification, génération |
| 4 — Data science | `data-analysis/`, `datasets/` | Contrats, échantillon synthétique | Comparaison, contradictions, indicateurs explicites |
| 5 — Sécurité / DevOps | `security-devops/`, Docker, `.github/` | Auth, autorisations, CI, Compose | HTTPS, sauvegardes, durcissement |

Le développeur 5 reste propriétaire des décisions d'authentification dans `backend/app/core/security.py`, `backend/app/api/deps.py` et des workflows. Le développeur 2 fait évoluer les ressources métier en respectant ces contrôles.

Aucun nom GitHub n'est imposé ici : complétez `CODEOWNERS` quand les comptes existent.
