# Sécurité et exploitation — phase 1

Responsable : développeur Sécurité / DevOps.

## Déjà en place

- Mots de passe hashés avec bcrypt. Le champ `hashed_password` n'est jamais renvoyé par l'API.
- Jetons JWT signés, durée limitée, secret lu depuis l'environnement.
- Refus de démarrer si `ENVIRONMENT=production` et si `JWT_SECRET` garde la valeur d'exemple.
- Routes privées : récits, favoris, espace personnel, statut des modules.
- Contrôle d'autorisation côté serveur : un contributeur ne modifie que ses récits ; seul un validateur ou un administrateur change le statut ; seul un administrateur gère les catégories et les rôles.
- Un administrateur ne peut pas retirer son propre rôle.
- Consentement obligatoire pour créer ou modifier un récit.
- En-têtes `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
- `.env` ignoré par Git. Le fichier suivi est `.env.example`.
- Tests d'authentification, d'autorisation et d'absence de score.
- Pipeline GitHub Actions : pytest, contrats NLP et data, lint, tests et build frontend.

## À faire avant tout déploiement partagé

- Remplacer `JWT_SECRET`, `ADMIN_PASSWORD` et le mot de passe PostgreSQL.
- Ne pas publier le port 5432.
- Servir le frontend compilé derrière un reverse proxy HTTPS.
- Retirer `--reload` de la commande Uvicorn.
- Prévoir une sauvegarde de la base et une politique de conservation des récits.

## Ce que cette phase ne fait pas

Pas de dépôt de fichier audio, pas de scan, pas de transcription, pas de calcul de risque. Le statut `validated` signifie seulement qu'un humain a relu la fiche.
