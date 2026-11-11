# API

Documentation interactive : `http://localhost:8000/docs` après démarrage.

Pour autoriser un appel dans Swagger : `POST /api/auth/login`, copier `access_token`, bouton Authorize, coller le jeton.

| Méthode | Chemin | Accès |
| --- | --- | --- |
| GET | `/api/health` | public |
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | connecté |
| GET | `/api/categories` | public |
| POST, PATCH, DELETE | `/api/categories` | administrateur |
| GET, POST | `/api/stories` | connecté |
| GET, PATCH, DELETE | `/api/stories/{id}` | lecture : connecté ; écriture : auteur ou administrateur |
| PATCH | `/api/stories/{id}/validation` | validateur ou administrateur |
| POST, DELETE | `/api/stories/{id}/favorite` | connecté |
| GET | `/api/me/favorites` | connecté |
| GET | `/api/users` | administrateur |
| PATCH | `/api/users/{id}/role` | administrateur |
| GET | `/api/modules/status` | connecté |

Les rôles acceptés sont `contributor`, `validator` et `admin`. L'inscription crée toujours un contributeur.

Promouvoir un compte en validateur : s'authentifier comme `admin@rawi.local` en local, puis envoyer `{ "role": "validator" }` sur la route de rôle. Le mot de passe local est celui de l'environnement, `change-me-admin` dans l'exemple Docker.
