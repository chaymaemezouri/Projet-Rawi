# Intelligence artificielle et NLP

Ce module appartient au développeur IA / NLP.

## Rôle

Préparer, puis implémenter plus tard :

- la transcription audio (Whisper ou équivalent open source) ;
- l'extraction des ingrédients, quantités et étapes ;
- la classification vers une catégorie de soins ;
- la génération structurée, seulement après une validation humaine.

## Phase 1

`rawi_nlp` expose des fonctions typées. Elles refusent un texte vide et répondent `status="not_implemented"` avec des champs de résultat à `None`.

Aucun score n'existe dans ces objets. Une liste vide ne doit pas être interprétée comme une extraction réussie : tant que `status` n'est pas `completed`, le résultat n'a pas été produit.

## Contrat

Voir `docs/CONTRACTS.md` à la racine du dépôt.

Les futurs résultats devront porter une origine `ai_proposal`, distincte du récit collecté et du contenu validé par un humain.
