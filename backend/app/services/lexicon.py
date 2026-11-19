"""Lexique RAWI 1.0.0.

Repère uniquement des formes présentes dans le texte. Ce n'est pas un modèle
entraîné et aucun score n'est calculé.
"""

from __future__ import annotations

import re
import unicodedata

ENGINE = "rawi-lexicon"
VERSION = "1.0.0"
NOTE = "Lexique de formes attestées. Ce n'est pas un modèle entraîné. Aucun score n'est calculé."

_INGREDIENTS = (
    ("rhassoul", ("rhassoul", "ghassoul", "الغاسول", "غاسول")),
    ("savon beldi", ("savon beldi", "beldi", "البلدي", "بلدي")),
    ("henné", ("henne", "henna", "الحناء", "حناء", "حنا")),
    ("argan", ("argan", "أركان", "الاركان", "اركان")),
    ("huile d'olive", ("huile d'olive", "huile dolive", "زيت الزيتون")),
    ("eau de rose", ("eau de rose", "ماء الورد")),
    ("kessa", ("kessa", "الكيسة", "كيسة")),
)

_CATEGORIES = {
    "gommage-hammam": ("hammam", "kessa", "beldi", "حمام", "كيسة", "بلدي"),
    "masque-visage": ("masque", "visage", "rhassoul", "ghassoul", "ماسك", "وجه", "غاسول", "الغاسول"),
    "huile-massage": ("huile", "massage", "argan", "زيت", "تدليك", "أركان", "اركان"),
    "soin-cheveux": ("cheveux", "cheveu", "henne", "henna", "شعر", "حناء", "الحناء", "حنا"),
}

_NUMBERS = ("deux", "trois", "quatre", "cinq", "six", "quelques", "جوج", "ثلاثة", "ثلاث", "واحدة")
_UNITS = ("cuilleres", "cuillere", "gouttes", "goutte", "ملعقة", "ملاعق", "قطرات", "قطرة")
_STEP = ("melang", "poser", "rinc", "appliqu", "laisse", "خلط", "غسل", "كيت")
_CAUTION = ("eviter", "ne pas", "attention", "ما خاصش", "لا تضع")
_DURATION = re.compile(
    r"(\d+|quelques|une|un)\s+(minutes?|heures?)|(\d+)\s*(دقيقة|دقائق|ساعة|ساعات)|نص ساعة",
    re.IGNORECASE,
)


def _fold_char(char: str) -> str:
    if "\u064b" <= char <= "\u0652" or char == "\u0640":
        return ""
    table = str.maketrans(
        {
            "أ": "ا",
            "إ": "ا",
            "آ": "ا",
            "ى": "ي",
            "ة": "ه",
            "é": "e",
            "è": "e",
            "ê": "e",
            "ë": "e",
            "à": "a",
            "â": "a",
            "ù": "u",
            "û": "u",
            "ô": "o",
            "î": "i",
            "ï": "i",
            "ç": "c",
        }
    )
    stripped = unicodedata.normalize("NFKD", char.translate(table))
    return "".join(item for item in stripped if not unicodedata.combining(item)).casefold()


def _fold(text: str) -> tuple[str, list[int]]:
    chars: list[str] = []
    indexes: list[int] = []
    for index, char in enumerate(text):
        folded = _fold_char(char)
        for item in folded:
            chars.append(item)
            indexes.append(index)
    return "".join(chars), indexes


def _spans(text: str, needle: str, occupied: list[tuple[int, int]], *, bounded: bool = True) -> list[tuple[int, int]]:
    folded, indexes = _fold(text)
    target = _fold(needle)[0]
    if not target:
        return []
    arabic = any("\u0600" <= char <= "\u06ff" for char in target)
    if not bounded:
        pattern = re.compile(re.escape(target))
    elif arabic:
        pattern = re.compile(rf"(?<![\u0600-\u06ff]){re.escape(target)}(?![\u0600-\u06ff])")
    else:
        pattern = re.compile(rf"(?<![0-9a-z]){re.escape(target)}(?![0-9a-z])")
    found: list[tuple[int, int]] = []
    for match in pattern.finditer(folded):
        start = indexes[match.start()]
        end = indexes[match.end() - 1] + 1
        if any(not (end <= left or start >= right) for left, right in occupied):
            continue
        found.append((start, end))
        occupied.append((start, end))
    return found


def _sentences(text: str) -> list[tuple[int, int]]:
    bounds: list[tuple[int, int]] = []
    start = 0
    for index, char in enumerate(text):
        if char in ".!?\n؟":
            bounds.append((start, index + 1))
            start = index + 1
    if start < len(text):
        bounds.append((start, len(text)))
    return bounds


def analyse(text: str) -> dict:
    occupied: list[tuple[int, int]] = []
    ingredients = []
    for canonical, variants in _INGREDIENTS:
        for variant in sorted(variants, key=len, reverse=True):
            for start, end in _spans(text, variant, occupied):
                ingredients.append(
                    {
                        "id": f"ing-{len(ingredients) + 1}",
                        "surface": text[start:end],
                        "canonical": canonical,
                        "start": start,
                        "end": end,
                    }
                )
    sentences = _sentences(text)
    quantities = []
    for start, end in sentences:
        sentence = text[start:end]
        numbers = []
        for word in (*_NUMBERS,):
            numbers.extend((start + left, start + right) for left, right in _spans(sentence, word, []))
        numbers.extend((match.start() + start, match.end() + start) for match in re.finditer(r"\d+(?:[.,]\d+)?", sentence))
        units = []
        for word in _UNITS:
            units.extend((start + left, start + right) for left, right in _spans(sentence, word, []))
        if not numbers and not units:
            continue
        linked = next((item["id"] for item in ingredients if start <= item["start"] < end), None)
        if linked is None and not units:
            continue
        number = numbers[0] if numbers else None
        unit = units[0] if units else None
        quantities.append(
            {
                "id": f"qty-{len(quantities) + 1}",
                "surface": None if number is None else text[number[0] : number[1]],
                "unit_surface": None if unit is None else text[unit[0] : unit[1]],
                "ingredient_id": linked,
                "start": (number or unit)[0],
                "end": (unit or number)[1],
            }
        )
    steps = _marked(text, sentences, _STEP, "step")
    precautions = _marked(text, sentences, _CAUTION, "caution")
    durations = []
    for match in _DURATION.finditer(text):
        durations.append(
            {
                "id": f"dur-{len(durations) + 1}",
                "surface": match.group(0),
                "start": match.start(),
                "end": match.end(),
            }
        )
    passages = []
    scores: dict[str, int] = {}
    for slug, cues in _CATEGORIES.items():
        hits = []
        for cue in sorted(cues, key=len, reverse=True):
            hits.extend(_spans(text, cue, []))
        unique = {(left, right) for left, right in hits}
        scores[slug] = len(unique)
        for left, right in sorted(unique):
            passages.append({"category_slug": slug, "text": text[left:right], "start": left, "end": right})
    ranked = sorted(scores, key=lambda slug: scores[slug], reverse=True)
    best = ranked[0]
    uncertain = scores[best] == 0 or scores[best] == scores[ranked[1]]
    kept = [item for item in passages if item["category_slug"] == best] if not uncertain else passages
    if uncertain:
        justification = "Aucune catégorie ne se détache des formes trouvées dans le texte." if scores[best] else "Aucune forme du lexique ne correspond à une catégorie."
        slug = None
    else:
        quoted = "، ".join(dict.fromkeys(item["text"] for item in kept))
        justification = f"Les formes « {quoted} » correspondent à la catégorie {best}. Le rapprochement est lexical."
        slug = best
    return {
        "engine": ENGINE,
        "engine_version": VERSION,
        "engine_kind": "lexicon",
        "note": NOTE,
        "classification": {
            "status": "uncertain" if uncertain else "proposed",
            "category_slug": slug,
            "justification": justification,
            "passages": [{key: item[key] for key in ("text", "start", "end")} for item in kept],
        },
        "extractions": {
            "ingredients": ingredients,
            "quantities": quantities,
            "steps": steps,
            "durations": durations,
            "precautions": precautions,
        },
    }


def _marked(text: str, sentences: list[tuple[int, int]], cues: tuple[str, ...], prefix: str) -> list[dict]:
    rows = []
    for start, end in sentences:
        sentence = text[start:end]
        if not any(_spans(sentence, cue, [], bounded=False) for cue in cues):
            continue
        rows.append({"id": f"{prefix}-{len(rows) + 1}", "surface": sentence.strip(), "start": start, "end": end})
    return rows
