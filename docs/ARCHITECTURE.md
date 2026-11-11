# Architecture — phase 1

RAWI est un monorepo. Chaque équipe avance dans son dossier, derrière des contrats stables.

```text
frontend  →  /api  →  backend FastAPI  →  PostgreSQL
                ↘
                 modules/status (état réel : non implémenté)
ai-nlp et data-analysis restent des bibliothèques Python séparées.
Elles ne sont pas appelées par l'API tant qu'elles ne produisent pas de résultat.
```

## Découpage

| Dossier | Rôle en phase 1 |
| --- | --- |
| `frontend/` | Interface React, français, arabe et darija |
| `backend/` | Comptes, récits, catégories, validation humaine, favoris |
| `ai-nlp/` | Contrats de transcription, extraction et classification |
| `data-analysis/` | Contrats de comparaison, contradictions et confiance |
| `datasets/samples/` | Récits fictifs, hors base |
| `security-devops/` | Règles de sécurité et exploitation |
| `.github/` | CI, issues, pull requests |

## Données

Un récit garde :

- le détenteur du savoir (`narrator_name`, `narrator_role`) ;
- le compte qui l'a déposé (`created_by`) ;
- la source, la langue, la catégorie, la date ;
- le texte original ;
- le consentement ;
- le statut de validation humaine, avec l'auteur et la date de la décision.

Le champ de réponse `content_origin` vaut toujours `collected`. Les futures propositions d'IA seront une autre ressource, pas une réécriture silencieuse du récit.

## Ce qui est volontairement absent

Les prototypes HTML calculaient un indice local et animaient huit agents. Cette base ne reprend pas ce comportement. L'API répond `not_implemented` et `result: null`. L'interface affiche cet état et n'invente pas de pourcentage.

## Identité visuelle

Reprise des prototypes : fond crème `#faf4ea`, vert `#2f6b4f`, terre cuite `#c8793a`, encre `#2b2118`. L'interface est une application de bureau responsive, plus un écran mobile unique.
