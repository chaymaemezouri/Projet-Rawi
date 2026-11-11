# Contribuer à RAWI

## Branches

- `main` : version stable. On n'y pousse pas de travail en cours.
- `develop` : intégration de l'équipe.
- `feature/<domaine>-<sujet>` : une évolution, par exemple `feature/backend-audio-upload`.
- `fix/<domaine>-<sujet>` : une correction.

Domaines : `frontend`, `backend`, `ai`, `data`, `devops`.

Partez de `develop` à jour. Ouvrez la pull request vers `develop`. `main` ne reçoit que ce qui a déjà été intégré et vérifié.

Aucun dépôt distant n'est configuré dans cette base. Créez-le quand l'équipe le décide, puis poussez `main` et `develop`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), en français, avec un périmètre :

```text
feat(backend): exiger le consentement à la création d'un récit
fix(frontend): garder la darija de droite à gauche
docs(data): préciser qu'un indicateur nul n'est pas un score
test(backend): couvrir le refus de validation par un contributeur
chore(devops): ajouter le healthcheck PostgreSQL
```

Types : `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

## Pull requests

Le modèle du dépôt rappelle les vérifications : tests, absence de secret, distinction entre contenu collecté, proposition d'IA et validation humaine.

## Qualité

```powershell
cd backend
.\.venv\Scripts\pytest

cd ..\ai-nlp
..\.venv\Scripts\pytest.exe
# ou, depuis le venv du backend :
..\backend\.venv\Scripts\pytest.exe

cd ..\frontend
npm run lint
npm test
npm run build
```

## Règles de contenu

- Ne pas insérer de récits présentés comme réels s'ils sont fictifs.
- Ne pas renvoyer de score tant que la méthode n'est pas écrite et testée.
- Ne jamais présenter un statut ou un indicateur comme une validation médicale.
- Ne pas committer `.env`, de mots de passe ou de jetons.
