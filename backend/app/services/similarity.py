"""Rapprochement lexical des récits accessibles.

Ce n'est pas un modèle sémantique. Les raisons sont des correspondances
explicites de catégorie, d'ingrédient mentionné, d'origine ou de mot du titre.
"""

from __future__ import annotations

import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import WorkflowStatus
from app.models import Story, User
from app.schemas.story import SimilarReason, SimilarStory
from app.services.story_service import _load_options, _media_flags, is_favorite, serialize_story

_TOKEN = re.compile(r"[^\W_]+", re.UNICODE)
_STOP = {
    "avec",
    "dans",
    "des",
    "elle",
    "les",
    "pour",
    "que",
    "qui",
    "sur",
    "une",
    "هذا",
    "هذه",
    "في",
    "من",
    "على",
}


def _tokens(value: str | None) -> set[str]:
    if not value:
        return set()
    return {token.casefold() for token in _TOKEN.findall(value) if len(token) >= 3 and token.casefold() not in _STOP}


def _visible_clause(user: User):
    own = Story.created_by_id == user.id
    published = (Story.workflow_status == WorkflowStatus.submitted) & (Story.publish_authorized.is_(True))
    return published | own


def similar_stories(db: Session, user: User, story: Story, *, limit: int = 4) -> list[SimilarStory]:
    rows = list(
        db.scalars(
            select(Story)
            .options(*_load_options())
            .where(Story.id != story.id)
            .where(_visible_clause(user))
        )
        .unique()
        .all()
    )
    source_ingredients = _tokens(story.mentioned_ingredients)
    source_title = _tokens(story.title)
    ranked: list[tuple[int, list[SimilarReason], Story]] = []
    for candidate in rows:
        reasons: list[SimilarReason] = []
        if story.category_id and candidate.category_id == story.category_id:
            reasons.append(SimilarReason(code="category"))
        shared = sorted(source_ingredients & _tokens(candidate.mentioned_ingredients))
        for ingredient in shared[:3]:
            reasons.append(SimilarReason(code="ingredient", detail=ingredient))
        if story.origin_place and candidate.origin_place and story.origin_place.casefold() == candidate.origin_place.casefold():
            reasons.append(SimilarReason(code="origin", detail=story.origin_place))
        shared_terms = sorted(source_title & _tokens(candidate.title))
        for term in shared_terms[:2]:
            reasons.append(SimilarReason(code="term", detail=term))
        if reasons:
            ranked.append((len(reasons), reasons, candidate))
    ranked.sort(key=lambda item: (-item[0], item[2].title.casefold()))
    chosen = ranked[:limit]
    flags = _media_flags(db, [item[2].id for item in chosen])
    results: list[SimilarStory] = []
    for _score, reasons, candidate in chosen:
        image, audio, document = flags.get(candidate.id, (False, False, False))
        results.append(
            SimilarStory(
                story=serialize_story(
                    candidate,
                    is_favorite(db, user, candidate.id),
                    has_image=image,
                    has_audio=audio,
                    has_document=document,
                ),
                reasons=reasons,
            )
        )
    return results
