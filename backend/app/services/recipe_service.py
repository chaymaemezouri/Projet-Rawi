"""Fiche documentaire. Aucune quantité absente n'est complétée."""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import UserRole, ValidationStatus, WorkflowStatus
from app.models import Recipe, RecipeRevision, Story, StoryReview, StoryRevision, User
from app.services.compare import _cues, compare_documents
from app.services.lexicon import analyse
from app.services.story_service import can_read_story, ensure_visible, get_story

NOTICE = "Fiche documentaire. Les valeurs absentes restent vides. Ce n'est pas une recommandation médicale."
DECISIVE = {"approved", "rejected", "correction_requested"}


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def _revision(db: Session, story: Story) -> int:
    return int(db.scalar(select(func.max(StoryRevision.version_number)).where(StoryRevision.story_id == story.id)) or 0)


def approval_kind(db: Session, story: Story) -> str:
    if story.validation_status != ValidationStatus.validated:
        return "none"
    digest = _hash(story.original_content)
    rows = list(
        db.scalars(
            select(StoryReview).where(StoryReview.story_id == story.id, StoryReview.content_sha256 == digest)
        ).all()
    )
    decisive = [row for row in rows if row.decision in DECISIVE]
    if any(row.decision != "approved" for row in decisive):
        return "none"
    approvers = {row.reviewer_id for row in decisive}
    if len(approvers) >= 2:
        return "double"
    return "inherited"


def _publishable(story: Story, kind: str) -> bool:
    return story.workflow_status == WorkflowStatus.submitted and bool(story.publish_authorized) and kind in {"double", "inherited"}


def _load(db: Session, user: User, story_ids: list[uuid.UUID]) -> list[Story]:
    if len(story_ids) != len(set(story_ids)) or not 1 <= len(story_ids) <= 6:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Indiquez de un à six récits distincts.")
    stories = []
    for story_id in story_ids:
        story = get_story(db, story_id)
        ensure_visible(user, story)
        stories.append(story)
    return stories


def _source_row(db: Session, story: Story) -> dict:
    result = analyse(story.original_content)
    names = {item["id"]: item["canonical"] for item in result["extractions"]["ingredients"]}
    quantities = [{**item, "canonical": names.get(item.get("ingredient_id"))} for item in result["extractions"]["quantities"]]
    steps = [item["surface"] for item in result["extractions"]["steps"]]
    return {
        "id": str(story.id),
        "title": story.title,
        "revision": _revision(db, story),
        "content_sha256": _hash(story.original_content),
        "category_slug": story.category.slug if story.category else None,
        "origin_place": story.origin_place,
        "transmission_note": story.transmission_note,
        "approval": approval_kind(db, story),
        "ingredients": result["extractions"]["ingredients"],
        "quantities": quantities,
        "steps": steps,
        "step_cues": set().union(*(_cues(step) for step in steps)) if steps else set(),
        "durations": [item["surface"] for item in result["extractions"]["durations"]],
        "precautions": [item["surface"] for item in result["extractions"]["precautions"]],
        "uncertain": result["classification"]["status"] == "uncertain",
        "justification": result["classification"]["justification"],
    }


def _sheet(rows: list[dict]) -> dict:
    slugs = {row["category_slug"] for row in rows}
    category = next(iter(slugs)) if len(slugs) == 1 else None
    ingredients: dict[str, list[dict]] = {}
    for row in rows:
        for item in row["ingredients"]:
            ingredients.setdefault(item["canonical"], []).append(_cite(row, item["surface"]))
    quantities = []
    seen = set()
    for row in rows:
        for item in row["quantities"]:
            if not item.get("canonical") or not item.get("surface"):
                continue
            key = (row["id"], item["canonical"], item.get("surface"), item.get("unit_surface"))
            if key in seen:
                continue
            seen.add(key)
            passage = " ".join(part for part in (item.get("surface"), item.get("unit_surface")) if part)
            quantities.append({"canonical": item["canonical"], **_cite(row, passage), "unit": item.get("unit_surface")})
    contexts = [_cite(row, row["origin_place"]) for row in rows if row["origin_place"]]
    notes = [_cite(row, row["transmission_note"]) for row in rows if row["transmission_note"]]
    places = {item["passage"] for item in contexts}
    comparison = compare_documents(rows) if len(rows) >= 2 else {"status": "insufficient", "reason": "données insuffisantes", "conflicts": [], "contradictions": [], "common": {"ingredients": []}}
    missing = []
    if not quantities:
        missing.append("quantity")
    if not any(row["steps"] for row in rows):
        missing.append("step")
    if not any(row["durations"] for row in rows):
        missing.append("duration")
    if category is None:
        missing.append("category")
    return {
        "category_slug": category,
        "context": contexts,
        "transmission": notes,
        "context_divergence": len(places) > 1,
        "ingredients": [{"canonical": name, "stories": cites} for name, cites in sorted(ingredients.items())],
        "quantities": quantities,
        "steps": [_cite(row, step) for row in rows for step in row["steps"]],
        "durations": [_cite(row, duration) for row in rows for duration in row["durations"]],
        "precautions": [_cite(row, item) for row in rows for item in row["precautions"]],
        "divergences": comparison.get("conflicts", []),
        "contradictions": comparison.get("contradictions", []),
        "comparison_status": comparison.get("status"),
        "missing": missing,
        "corrections": [],
        "notice": NOTICE,
    }


def _cite(row: dict, passage: str) -> dict:
    return {"story_id": row["id"], "title": row["title"], "revision": row["revision"], "passage": passage}


def _public_source(row: dict) -> dict:
    return {key: row[key] for key in ("id", "title", "revision", "content_sha256", "category_slug", "approval")}


def _snapshot(db: Session, user: User, recipe: Recipe, reason: str) -> None:
    latest = db.scalar(select(func.max(RecipeRevision.version_number)).where(RecipeRevision.recipe_id == recipe.id)) or 0
    db.add(
        RecipeRevision(
            recipe_id=recipe.id,
            version_number=int(latest) + 1,
            snapshot={"title": recipe.title, "status": recipe.status, "body": recipe.body, "sources": recipe.sources},
            reason=reason,
            created_by_id=user.id,
            created_at=datetime.now(timezone.utc),
        )
    )


def create_recipe(db: Session, user: User, title: str, story_ids: list[uuid.UUID]) -> dict:
    rows = [_source_row(db, story) for story in _load(db, user, story_ids)]
    recipe = Recipe(
        title=" ".join(title.split()),
        category_slug=_sheet(rows)["category_slug"],
        status="draft",
        body=_sheet(rows),
        sources=[_public_source(row) for row in rows],
        created_by_id=user.id,
        updated_at=datetime.now(timezone.utc),
    )
    db.add(recipe)
    db.flush()
    _snapshot(db, user, recipe, "generated")
    db.commit()
    return _read(db, user, recipe.id)


def _get(db: Session, recipe_id: uuid.UUID) -> Recipe:
    recipe = db.get(Recipe, recipe_id)
    if recipe is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche introuvable.")
    return recipe


def _visible(db: Session, user: User, recipe: Recipe) -> None:
    if user.role == UserRole.admin or recipe.created_by_id == user.id:
        return
    if recipe.status != "published":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche introuvable.")


def _refresh(db: Session, user: User, recipe: Recipe) -> bool:
    stale = False
    for source in recipe.sources:
        story = db.get(Story, uuid.UUID(source["id"]))
        if story is None or not can_read_story(user, story) or _hash(story.original_content) != source["content_sha256"]:
            stale = True
            continue
        if recipe.status == "published" and not _publishable(story, approval_kind(db, story)):
            stale = True
    if stale and recipe.status == "published":
        _snapshot(db, user, recipe, "source_changed")
        recipe.status = "obsolete"
        recipe.updated_at = datetime.now(timezone.utc)
        db.commit()
    return stale


def _payload(db: Session, user: User, recipe: Recipe) -> dict:
    stale = _refresh(db, user, recipe)
    version = db.scalar(select(func.max(RecipeRevision.version_number)).where(RecipeRevision.recipe_id == recipe.id)) or 1
    return {
        "id": str(recipe.id),
        "title": recipe.title,
        "category_slug": recipe.category_slug,
        "status": recipe.status,
        "stale": stale or recipe.status == "obsolete",
        "body": recipe.body,
        "sources": recipe.sources,
        "version": int(version),
        "notice": NOTICE,
    }


def _read(db: Session, user: User, recipe_id: uuid.UUID) -> dict:
    recipe = _get(db, recipe_id)
    _refresh(db, user, recipe)
    _visible(db, user, recipe)
    return _payload(db, user, recipe)


def read_recipe(db: Session, user: User, recipe_id: uuid.UUID) -> dict:
    return _read(db, user, recipe_id)


def list_recipes(db: Session, user: User, mine: bool) -> dict:
    query = select(Recipe).order_by(Recipe.created_at.desc())
    if mine:
        query = query.where(Recipe.created_by_id == user.id)
    else:
        query = query.where(Recipe.status == "published")
    items = []
    for recipe in db.scalars(query).all():
        payload = _payload(db, user, recipe)
        if not mine and payload["status"] != "published":
            continue
        items.append({key: payload[key] for key in ("id", "title", "status", "stale", "category_slug", "version")})
    return {"items": items, "notice": NOTICE}


def correct_recipe(db: Session, user: User, recipe_id: uuid.UUID, field: str, replacement: str, note: str) -> dict:
    recipe = _get(db, recipe_id)
    if user.role != UserRole.admin and recipe.created_by_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche introuvable.")
    if field not in {"title", "context", "precaution"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Ce champ ne peut pas être corrigé.")
    cleaned = " ".join(replacement.split())
    comment = " ".join(note.split())
    if len(cleaned) < 2 or len(comment) < 3:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La correction doit citer la valeur et une note.")
    previous = recipe.title if field == "title" else None
    _snapshot(db, user, recipe, "correction")
    recipe.body = {**recipe.body, "corrections": [*recipe.body.get("corrections", []), {"field": field, "previous": previous, "replacement": cleaned, "note": comment}]}
    if field == "title":
        recipe.title = cleaned
    recipe.updated_at = datetime.now(timezone.utc)
    db.commit()
    return _read(db, user, recipe.id)


def publish_recipe(db: Session, user: User, recipe_id: uuid.UUID) -> dict:
    recipe = _get(db, recipe_id)
    if user.role != UserRole.admin and recipe.created_by_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche introuvable.")
    if recipe.status != "draft":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Seule une fiche brouillon peut être publiée.")
    for source in recipe.sources:
        story = get_story(db, uuid.UUID(source["id"]))
        ensure_visible(user, story)
        if _hash(story.original_content) != source["content_sha256"]:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Une source a changé. La fiche doit être régénérée.")
        if not _publishable(story, approval_kind(db, story)):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Une source n'est pas autorisée à la publication ou n'a pas la validation documentaire requise.")
    _snapshot(db, user, recipe, "published")
    recipe.status = "published"
    recipe.updated_at = datetime.now(timezone.utc)
    db.commit()
    return _read(db, user, recipe.id)


def revisions(db: Session, user: User, recipe_id: uuid.UUID) -> list[dict]:
    recipe = _get(db, recipe_id)
    _visible(db, user, recipe)
    rows = db.scalars(select(RecipeRevision).where(RecipeRevision.recipe_id == recipe.id).order_by(RecipeRevision.version_number)).all()
    return [
        {"version": row.version_number, "reason": row.reason, "title": row.snapshot.get("title"), "status": row.snapshot.get("status"), "created_at": row.created_at.isoformat()}
        for row in rows
    ]


def export_pdf(db: Session, user: User, recipe_id: uuid.UUID) -> bytes:
    payload = _read(db, user, recipe_id)
    if payload["status"] == "obsolete":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cette fiche est obsolète. L'export est interrompu.")
    lines = [
        payload["title"],
        f"Statut documentaire : {payload['status']}",
        payload["notice"],
        f"Categorie : {payload['category_slug'] or 'donnees insuffisantes'}",
    ]
    for source in payload["sources"]:
        lines.append(f"Source {source['title']} | version {source['revision']} | validation {source['approval']}")
    if payload["body"].get("context_divergence"):
        lines.append("Contextes divergents, non resolus :")
    for item in payload["body"].get("context", []):
        lines.append(f"Contexte : {item['passage']} ({item['title']})")
    if "quantity" in payload["body"].get("missing", []):
        lines.append("Quantites : donnees insuffisantes")
    for item in payload["body"].get("quantities", []):
        lines.append(f"Quantite {item['canonical']} : {item['passage']} | {item['title']}")
    for item in payload["body"].get("divergences", []):
        lines.append(f"Divergence {item.get('kind')} {item.get('canonical') or ''}")
    for item in payload["body"].get("corrections", []):
        lines.append(f"Correction humaine {item['field']} : {item['replacement']}")
    return _pdf(lines)


def _pdf(lines: list[str]) -> bytes:
    chunks = [lines[index:index + 40] for index in range(0, max(len(lines), 1), 40)]
    page_ids = [4 + index * 2 for index in range(len(chunks))]
    objects: dict[int, bytes] = {
        1: b"<< /Type /Catalog /Pages 2 0 R >>",
        2: f"<< /Type /Pages /Count {len(page_ids)} /Kids [{' '.join(f'{item} 0 R' for item in page_ids)}] >>".encode(),
        3: b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    }
    for page_id, chunk in zip(page_ids, chunks):
        stream = _stream(chunk)
        objects[page_id] = f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents {page_id + 1} 0 R /Resources << /Font << /F1 3 0 R >> >> >>".encode()
        objects[page_id + 1] = b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream"
    return _assemble(objects)


def _stream(lines: list[str]) -> bytes:
    commands = ["BT", "/F1 11 Tf", "48 790 Td"]
    for index, line in enumerate(lines):
        if index:
            commands.append("0 -16 Td")
        safe = line.encode("latin-1", "replace").decode("latin-1").replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        commands.append(f"({safe[:120]}) Tj")
    commands.append("ET")
    return "\n".join(commands).encode("latin-1")


def _assemble(objects: dict[int, bytes]) -> bytes:
    result = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for number in range(1, max(objects) + 1):
        offsets.append(len(result))
        result.extend(f"{number} 0 obj\n".encode())
        result.extend(objects[number])
        result.extend(b"\nendobj\n")
    start = len(result)
    result.extend(f"xref\n0 {len(offsets)}\n".encode())
    result.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        result.extend(f"{offset:010d} 00000 n \n".encode())
    result.extend(f"trailer << /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{start}\n%%EOF".encode())
    return bytes(result)
