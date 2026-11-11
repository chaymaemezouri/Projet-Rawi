# Contrats entre modules

Ces formes sont la frontière entre le backend, l'IA et la data. Tant que `status` vaut `not_implemented`, `result` ou les champs équivalents restent `null`. Une liste vide ne doit pas être utilisée à la place de cet état.

## Récit collecté

Produit par `POST /api/stories`.

```json
{
  "content_origin": "collected",
  "validation_status": "pending",
  "original_content": "texte déposé",
  "consent": true
}
```

`validation_status` peut devenir `validated` ou `rejected` uniquement par `PATCH /api/stories/{id}/validation`.

## Transcription

Entrée : référence du fichier audio, langue facultative (`fr`, `ar`, `ary`).

Sortie :

```json
{
  "status": "not_implemented",
  "transcript": null,
  "detected_language": null,
  "message": "La transcription n'est pas disponible en phase 1."
}
```

## Extraction

Entrée : texte et langue.

Sortie : `ingredients` et `steps` à `null` tant que le moteur n'existe pas. Plus tard, chaque élément portera `origin: "ai_proposal"`.

## Classification

Entrée : texte, langue, slugs de catégories connus.

Sortie : `category_slug` à `null`. Une suggestion future ne change pas `category_id` du récit.

## Comparaison et contradictions

Entrée : au moins deux instantanés `{ story_id, text, category_slug, language }`.

Sortie : `pairs` ou `contradictions` à `null`.

## Confiance

```json
{
  "status": "not_implemented",
  "value": null,
  "disclaimer": "Aucun indicateur de confiance n'est calculé. Un futur indicateur ne constituera jamais une validation médicale."
}
```

L'API reflète le même principe sur `GET /api/modules/status` : chaque module a `result: null`.

## Génération de recette

Hors phase 1. Elle ne pourra consommer que des éléments dont l'origine et le statut sont connus. Elle ne remplace pas le texte original.
