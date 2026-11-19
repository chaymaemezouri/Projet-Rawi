"""Comparaison documentaire déterministe.

Règles :
- ingrédient commun : le nom canonique est dans chaque récit.
- étape commune : un indice d'action du lexique est dans chaque récit.
- atypique : ingrédient dans un seul récit, et au moins trois récits.
- manquant : ingrédient dans au moins deux récits et absent de celui-ci, à partir de trois récits.
- conflit de quantité : deux nombres explicites différents pour le même ingrédient.
- conflit d'unité : deux unités normalisées différentes pour le même ingrédient.
- conflit de durée : deux durées explicites dont les minutes diffèrent.
- contradiction quantity_same_unit : même ingrédient, même unité, nombres différents.
- contradiction duration_values : deux durées explicites en minutes différentes.
Une valeur absente n'est pas une contradiction. La cohérence compte des accords documentaires, pas une sécurité médicale.
"""

from __future__ import annotations

import re

_NUMBERS = {
    "deux": 2,
    "trois": 3,
    "quatre": 4,
    "cinq": 5,
    "six": 6,
    "جوج": 2,
    "ثلاثة": 3,
    "ثلاث": 3,
    "واحدة": 1,
}
_UNIT = {
    "cuillere": "cuillere",
    "cuilleres": "cuillere",
    "goutte": "goutte",
    "gouttes": "goutte",
    "ملعقة": "ملعقة",
    "ملاعق": "ملعقة",
    "قطرة": "قطرة",
    "قطرات": "قطرة",
}
_STEP = ("melang", "poser", "rinc", "appliqu", "laisse", "خلط", "غسل", "كيت")
_FOLD = str.maketrans({
    0x00E9: "e", 0x00E8: "e", 0x00EA: "e", 0x00EB: "e",
    0x00E0: "a", 0x00E2: "a", 0x00F9: "u", 0x00FB: "u",
    0x00F4: "o", 0x00EE: "i", 0x00EF: "i", 0x00E7: "c",
})


def _fold(value: str) -> str:
    return value.translate(_FOLD).casefold()


def _number(surface: str | None) -> float | None:
    if not surface:
        return None
    folded = _fold(surface)
    if folded in _NUMBERS:
        return float(_NUMBERS[folded])
    match = re.fullmatch(r"\d+(?:[.,]\d+)?", folded)
    if not match:
        return None
    return float(folded.replace(",", "."))


def _unit(surface: str | None) -> str | None:
    if not surface:
        return None
    return _UNIT.get(_fold(surface))


def _minutes(surface: str) -> float | None:
    folded = _fold(surface)
    if folded == "نص ساعة":
        return 30
    match = re.search(r"(\d+(?:[.,]\d+)?)\s*(minute|heure|دقيقة|دقائق|ساعة|ساعات)", folded)
    if not match:
        return None
    amount = float(match.group(1).replace(",", "."))
    return amount * 60 if match.group(2).startswith("heure") or match.group(2).startswith("ساع") else amount


def _cues(text: str) -> set[str]:
    folded = _fold(text)
    return {cue for cue in _STEP if cue in folded}


def _source(row: dict) -> dict:
    return {key: row[key] for key in ("id", "title", "revision", "content_sha256", "category_slug")}


def _insufficient(detail: str) -> dict:
    return {"value": None, "detail": detail}


def compare_documents(rows: list[dict]) -> dict:
    if len(rows) < 2:
        return {"status": "insufficient", "reason": "données insuffisantes", "sources": [_source(row) for row in rows], "indicators": {}, "common": {}, "divergences": [], "anomalies": [], "conflicts": [], "contradictions": []}
    slugs = {row["category_slug"] for row in rows}
    if None in slugs or len(slugs) != 1:
        return {"status": "insufficient", "reason": "données insuffisantes", "sources": [_source(row) for row in rows], "indicators": {}, "common": {}, "divergences": [], "anomalies": [], "conflicts": [], "contradictions": []}
    names: dict[str, set[str]] = {}
    for row in rows:
        for item in row["ingredients"]:
            names.setdefault(item["canonical"], set()).add(row["id"])
    common = sorted(name for name, owners in names.items() if len(owners) == len(rows))
    partial = sorted(name for name, owners in names.items() if len(owners) != len(rows))
    cue_owners: dict[str, set[str]] = {}
    for row in rows:
        for cue in row["step_cues"]:
            cue_owners.setdefault(cue, set()).add(row["id"])
    common_steps = sorted(cue for cue, owners in cue_owners.items() if len(owners) == len(rows))
    anomalies = []
    if len(rows) >= 3:
        for name, owners in sorted(names.items()):
            if len(owners) == 1:
                story = next(row for row in rows if row["id"] in owners)
                anomalies.append({"kind": "atypical", "canonical": name, "story_id": story["id"], "passage": _passage(story, name)})
            elif len(owners) < len(rows):
                for row in rows:
                    if row["id"] not in owners:
                        anomalies.append({"kind": "missing", "canonical": name, "story_id": row["id"], "passage": None})
    for row in rows:
        if row["uncertain"]:
            anomalies.append({"kind": "uncertain", "canonical": None, "story_id": row["id"], "passage": row["justification"]})
    conflicts, contradictions = _values(rows)
    coverage_hits = sum(1 for row in rows if row["ingredients"])
    comparisons, agreements = _coherence(rows)
    return {
        "status": "compared",
        "reason": None,
        "category_slug": next(iter(slugs)),
        "sources": [_source(row) for row in rows],
        "indicators": {
            "sources": {"value": str(len(rows)), "detail": "Nombre de récits lisibles comparés."},
            "coverage": {"value": f"{coverage_hits}/{len(rows)}", "detail": "Récits où le lexique a trouvé au moins un ingrédient."},
            "coherence": {"value": f"{agreements}/{comparisons}", "detail": "Accords entre quantités explicites de même ingrédient et de même unité."} if comparisons else _insufficient("données insuffisantes"),
            "anomalies": {"value": None, "detail": "données insuffisantes"} if len(rows) < 3 else {"value": str(len(anomalies)), "detail": "Écarts atypiques, manquants ou incertains. Ce n'est pas une sécurité médicale."},
        },
        "common": {"ingredients": [_group(rows, name) for name in common], "steps": [_step_group(rows, cue) for cue in common_steps]},
        "divergences": [_group(rows, name) for name in partial],
        "anomalies": anomalies,
        "conflicts": conflicts,
        "contradictions": contradictions,
        "notice": "Cohérence documentaire uniquement. Aucune conclusion médicale.",
    }


def _passage(row: dict, canonical: str) -> str | None:
    found = next((item["surface"] for item in row["ingredients"] if item["canonical"] == canonical), None)
    return found


def _group(rows: list[dict], canonical: str) -> dict:
    return {
        "canonical": canonical,
        "stories": [
            {"id": row["id"], "title": row["title"], "revision": row["revision"], "passage": _passage(row, canonical)}
            for row in rows
            if _passage(row, canonical)
        ],
    }


def _step_group(rows: list[dict], cue: str) -> dict:
    stories = []
    for row in rows:
        passage = next((item for item in row["steps"] if cue in _fold(item)), None)
        if passage:
            stories.append({"id": row["id"], "title": row["title"], "revision": row["revision"], "passage": passage})
    return {"cue": cue, "stories": stories}


def _value(row: dict, item: dict) -> dict:
    passage = " ".join(part for part in (item.get("surface"), item.get("unit_surface")) if part)
    return {"id": row["id"], "title": row["title"], "revision": row["revision"], "passage": passage}


def _values(rows: list[dict]) -> tuple[list[dict], list[dict]]:
    conflicts = []
    contradictions = []
    by_name: dict[str, list[tuple[dict, dict]]] = {}
    for row in rows:
        for item in row["quantities"]:
            if item.get("canonical"):
                by_name.setdefault(item["canonical"], []).append((row, item))
    for canonical, pairs in by_name.items():
        numbers = [(row, item, _number(item.get("surface"))) for row, item in pairs]
        units = [(row, item, _unit(item.get("unit_surface"))) for row, item in pairs]
        known_numbers = [(row, item, number) for row, item, number in numbers if number is not None]
        known_units = [(row, item, unit) for row, item, unit in units if unit is not None]
        if len({number for _, _, number in known_numbers}) > 1:
            conflicts.append({"kind": "quantity", "canonical": canonical, "values": [_value(row, item) for row, item, _ in known_numbers]})
        if len({unit for _, _, unit in known_units}) > 1:
            conflicts.append({"kind": "unit", "canonical": canonical, "values": [_value(row, item) for row, item, _ in known_units]})
        comparable: dict[str, list[tuple[dict, dict, float]]] = {}
        for row, item, number in known_numbers:
            unit = _unit(item.get("unit_surface"))
            if unit is None:
                continue
            comparable.setdefault(unit, []).append((row, item, number))
        for unit, group in comparable.items():
            if len({number for _, _, number in group}) > 1:
                contradictions.append({"rule": "quantity_same_unit", "canonical": canonical, "unit": unit, "values": [_value(row, item) for row, item, _ in group]})
    durations = [(row, surface, _minutes(surface)) for row in rows for surface in row["durations"]]
    known = [(row, surface, minutes) for row, surface, minutes in durations if minutes is not None]
    if len({minutes for _, _, minutes in known}) > 1:
        conflicts.append({"kind": "duration", "canonical": None, "values": [{"id": row["id"], "title": row["title"], "revision": row["revision"], "passage": surface} for row, surface, _ in known]})
        contradictions.append({"rule": "duration_values", "canonical": None, "unit": "minute", "values": [{"id": row["id"], "title": row["title"], "revision": row["revision"], "passage": surface} for row, surface, _ in known]})
    return conflicts, contradictions


def _coherence(rows: list[dict]) -> tuple[int, int]:
    grouped: dict[tuple[str, str], set[float]] = {}
    owners: dict[tuple[str, str], set[str]] = {}
    for row in rows:
        for item in row["quantities"]:
            number = _number(item.get("surface"))
            unit = _unit(item.get("unit_surface"))
            canonical = item.get("canonical")
            if number is None or unit is None or not canonical:
                continue
            key = (canonical, unit)
            grouped.setdefault(key, set()).add(number)
            owners.setdefault(key, set()).add(row["id"])
    real = {key: values for key, values in grouped.items() if len(owners.get(key, ())) >= 2}
    return len(real), sum(1 for values in real.values() if len(values) == 1)


def compare_stories(db, user, story_ids: list) -> dict:
    import hashlib

    from sqlalchemy import func, select

    from app.models import StoryRevision
    from app.services.lexicon import analyse
    from app.services.story_service import ensure_visible, get_story

    if len(story_ids) != len(set(story_ids)) or not 2 <= len(story_ids) <= 6:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Indiquez de deux à six récits distincts.")
    rows = []
    for story_id in story_ids:
        story = get_story(db, story_id)
        ensure_visible(user, story)
        result = analyse(story.original_content)
        names = {item["id"]: item["canonical"] for item in result["extractions"]["ingredients"]}
        quantities = []
        for item in result["extractions"]["quantities"]:
            quantities.append({**item, "canonical": names.get(item.get("ingredient_id"))})
        steps = [item["surface"] for item in result["extractions"]["steps"]]
        revision = db.scalar(select(func.max(StoryRevision.version_number)).where(StoryRevision.story_id == story.id)) or 0
        editorial = story.category.slug if story.category else None
        proposed = result["classification"]["category_slug"]
        rows.append({
            "id": str(story.id),
            "title": story.title,
            "revision": int(revision),
            "content_sha256": hashlib.sha256(story.original_content.encode()).hexdigest(),
            "category_slug": editorial,
            "ingredients": result["extractions"]["ingredients"],
            "quantities": quantities,
            "steps": steps,
            "step_cues": set().union(*(_cues(step) for step in steps)) if steps else set(),
            "durations": [item["surface"] for item in result["extractions"]["durations"]],
            "uncertain": result["classification"]["status"] == "uncertain" or (proposed is not None and proposed != editorial),
            "justification": result["classification"]["justification"],
        })
    return compare_documents(rows)
