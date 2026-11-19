import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.enums import LanguageCode, NarratorRole, StorySource, UserRole, ValidationStatus, WorkflowStatus
from app.core.security import hash_password
from app.models import Category, Favorite, Story, User

DEMO_NOTICE = (
    "Démonstration. Ce texte est fictif : aucune personne réelle n'est citée "
    "et aucun savoir privé n'est publié.\n\n"
)
DEMO_VERSION = "Version de démonstration : 2."

DEMO_STORIES: tuple[dict[str, object], ...] = (
    {
        "title": "Démonstration — Masque au rhassoul",
        "narrator_role": NarratorRole.grandmother,
        "source": StorySource.oral,
        "language": LanguageCode.fr,
        "slug": "masque-visage",
        "status": ValidationStatus.validated,
        "favorite": True,
        "workflow": WorkflowStatus.submitted,
        "content": (
            "Dans cet exemple fictif, le rhassoul est mélangé à de l'eau de rose tiède jusqu'à une pâte lisse. "
            "La pâte est posée sur le visage. Il faut éviter le contour des yeux. "
            "Elle est laissée 10 minutes. Elle est ensuite rincée à l'eau tiède. "
            "Aucune propriété n'est affirmée."
        ),
    },
    {
        "title": "Démonstration — Rhassoul sans eau de rose",
        "narrator_role": NarratorRole.grandmother,
        "source": StorySource.oral,
        "language": LanguageCode.fr,
        "slug": "masque-visage",
        "status": ValidationStatus.validated,
        "workflow": WorkflowStatus.submitted,
        "favorite": True,
        "content": (
            "Dans cet exemple fictif, le rhassoul est mélangé à l'eau tiède, sans eau de rose. "
            "La pâte est posée sur le visage. Il faut éviter le contour des yeux. "
            "Elle est laissée 15 minutes. Elle est ensuite rincée à l'eau tiède. "
            "Aucune propriété n'est affirmée."
        ),
    },
    {
        "title": "Démonstration — Ghassoul du hammam",
        "narrator_role": NarratorRole.hammam_practitioner,
        "source": StorySource.oral,
        "language": LanguageCode.ary,
        "slug": "gommage-hammam",
        "status": ValidationStatus.pending,
        "workflow": WorkflowStatus.submitted,
        "favorite": False,
        "content": (
            "هادي غير تجربة. كيتخلط الغاسول مع الماء دافئ حتى لعجينة. "
            "كيتستعمل فالحمام. ومن بعد كيتغسل بالماء دافئ. ما كاين حتى مدة مكتوبة."
        ),
    },
    {
        "title": "Démonstration — Gommage au savon beldi",
        "narrator_role": NarratorRole.hammam_practitioner,
        "source": StorySource.oral,
        "language": LanguageCode.fr,
        "slug": "gommage-hammam",
        "status": ValidationStatus.validated,
        "workflow": WorkflowStatus.submitted,
        "favorite": True,
        "content": (
            "Dans cet exemple fictif, le savon beldi est mélangé à de l'huile d'olive. "
            "Le mélange est posé sur la peau humide. Le kessa sert au rinçage à l'eau tiède. "
            "Il faut éviter le visage. Aucune quantité n'est écrite."
        ),
    },
    {
        "title": "Démonstration — Soin au henné",
        "narrator_role": NarratorRole.practitioner,
        "source": StorySource.written,
        "language": LanguageCode.ar,
        "slug": "soin-cheveux",
        "status": ValidationStatus.pending,
        "workflow": WorkflowStatus.submitted,
        "favorite": False,
        "content": (
            "هذا نص تجريبي. تُخلط الحناء بالماء الدافئ حتى تصبح عجيناً. "
            "توضع على الشعر. بعد 20 دقيقة تغسل بالماء الدافئ. لا تُذكر هنا أي فائدة طبية."
        ),
    },
    {
        "title": "Démonstration — Huile d'argan",
        "narrator_role": NarratorRole.practitioner,
        "source": StorySource.digitized,
        "language": LanguageCode.fr,
        "slug": "huile-massage",
        "status": ValidationStatus.pending,
        "workflow": WorkflowStatus.submitted,
        "favorite": True,
        "content": (
            "Dans cet exemple fictif, quelques gouttes d'huile d'argan sont réchauffées entre les paumes. "
            "L'huile est ensuite posée sur la peau en mouvements lents. La durée n'est pas écrite."
        ),
    },
    {
        "title": "Démonstration — Masque à revoir",
        "narrator_role": NarratorRole.other,
        "source": StorySource.written,
        "language": LanguageCode.fr,
        "slug": "masque-visage",
        "status": ValidationStatus.rejected,
        "workflow": WorkflowStatus.submitted,
        "favorite": False,
        "content": (
            "Cet exemple fictif reste incomplet : il cite un geste au rhassoul sans "
            "préciser la source. Il sert seulement à montrer un récit non retenu."
        ),
    },
    {
        "title": "Démonstration — Brouillon au rhassoul",
        "narrator_role": NarratorRole.other,
        "source": StorySource.oral,
        "language": LanguageCode.fr,
        "slug": "masque-visage",
        "status": ValidationStatus.pending,
        "workflow": WorkflowStatus.draft,
        "favorite": False,
        "content": (
            "Brouillon fictif. Le rhassoul est cité, mais le geste n'est pas décrit. Ce texte n'est pas soumis."
        ),
    },
    {
        "title": "Démonstration — Exemple à préciser",
        "narrator_role": NarratorRole.other,
        "source": StorySource.written,
        "language": LanguageCode.fr,
        "slug": "masque-visage",
        "status": ValidationStatus.pending,
        "workflow": WorkflowStatus.submitted,
        "favorite": False,
        "correction": True,
        "content": (
            "Dans cet exemple fictif, un masque au rhassoul est mentionné sans dire comment il est mélangé ni rincé. "
            "La source n'est pas précisée."
        ),
    },
)

logger = logging.getLogger(__name__)

CATEGORY_SEED: tuple[dict[str, str], ...] = (
    {
        "slug": "masque-visage",
        "name_fr": "Masque visage",
        "name_ar": "قناع الوجه",
        "name_ary": "ماسك الوجه",
        "description_fr": "Soins du visage transmis par les achabas et les aînées, notamment à base de rhassoul, d'eaux florales et de miel.",
        "description_ar": "عناية بالوجه متوارثة عن العشابات والكبيرات، خاصة بالغاسول ومياه الزهر والعسل.",
        "description_ary": "العناية بالوجه اللي كتنقلوها العشابات والجدات، بحال الغاسول وماء الورد والعسل.",
    },
    {
        "slug": "gommage-hammam",
        "name_fr": "Gommage et hammam",
        "name_ar": "تقشير الحمام",
        "name_ary": "الحمام والكيس",
        "description_fr": "Gestes du hammam, savon beldi, kessa et gommages du corps.",
        "description_ar": "طقوس الحمام والصابون البلدي والكيسة وتقشير الجسد.",
        "description_ary": "طقوس الحمام، الصابون البلدي، الكيسة والتقشير ديال الجسم.",
    },
    {
        "slug": "soin-cheveux",
        "name_fr": "Soin des cheveux",
        "name_ar": "العناية بالشعر",
        "name_ary": "العناية بالشعر",
        "description_fr": "Soins capillaires, henné et préparations pour les cheveux.",
        "description_ar": "عناية بالشعر والحناء والتحضيرات التقليدية لفروة الرأس.",
        "description_ary": "العناية بالشعر والحنة والتحضيرات التقليدية.",
    },
    {
        "slug": "huile-massage",
        "name_fr": "Huile et massage",
        "name_ar": "زيت وتدليك",
        "name_ary": "الزيت والتدليك",
        "description_fr": "Huiles végétales et gestes de massage transmis dans la pratique familiale.",
        "description_ar": "زيوت نباتية وحركات تدليك متوارثة في الممارسة العائلية.",
        "description_ary": "الزيوت النباتية وحركات التدليك اللي كيتوارثو فالدار.",
    },
)


def seed_categories(db: Session) -> None:
    existing = set(db.scalars(select(Category.slug)).all())
    for item in CATEGORY_SEED:
        if item["slug"] in existing:
            continue
        db.add(Category(**item))
    db.commit()


def seed_admin(db: Session) -> None:
    settings = get_settings()
    if not settings.admin_email or not settings.admin_password:
        return
    if len(settings.admin_password) < 8:
        logger.warning("ADMIN_PASSWORD est trop court : aucun administrateur n'a été créé.")
        return
    if settings.admin_password == "change-me-admin":
        logger.warning(
            "Compte administrateur local créé avec le mot de passe d'exemple. "
            "Ne pas réutiliser ces identifiants hors de la machine de développement."
        )
    email = settings.admin_email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        return
    db.add(
        User(
            email=email,
            hashed_password=hash_password(settings.admin_password),
            full_name=settings.admin_name.strip() or "Administrateur RAWI",
            role=UserRole.admin,
            preferred_language=LanguageCode.fr,
        )
    )
    db.commit()


def seed_demo(db: Session) -> None:
    settings = get_settings()
    if not settings.demo_email or not settings.demo_password:
        return
    if settings.demo_password.startswith("change-me") or len(settings.demo_password) < 8:
        logger.warning("DEMO_PASSWORD d'exemple ou trop court : aucun compte démo n'a été créé.")
        return
    email = settings.demo_email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        return
    db.add(
        User(
            email=email,
            hashed_password=hash_password(settings.demo_password),
            full_name=settings.demo_name.strip() or "Compte démo",
            role=UserRole.contributor,
            preferred_language=LanguageCode.fr,
        )
    )
    db.commit()


def _demo_body(content: str) -> str:
    return f"{DEMO_NOTICE}{DEMO_VERSION}\n\n{content}"


def seed_demo_stories(db: Session) -> None:
    settings = get_settings()
    if settings.environment == "production" or not settings.demo_email:
        return
    user = db.scalar(select(User).where(User.email == settings.demo_email.strip().lower()))
    if user is None:
        return
    admin = None
    if settings.admin_email:
        admin = db.scalar(select(User).where(User.email == settings.admin_email.strip().lower()))
    categories = {category.slug: category.id for category in db.scalars(select(Category)).all()}
    created: list[tuple[Story, bool]] = []
    for item in DEMO_STORIES:
        title = str(item["title"])
        status = item["status"]
        workflow = item.get("workflow")
        if not isinstance(status, ValidationStatus) or not isinstance(workflow, WorkflowStatus):
            continue
        body = _demo_body(str(item["content"]))
        current = db.scalar(select(Story).where(Story.created_by_id == user.id, Story.title == title))
        if current is not None:
            if current.original_content.startswith(DEMO_NOTICE) and DEMO_VERSION not in current.original_content:
                current.original_content = body
                current.language = item["language"]  # type: ignore[assignment]
                current.workflow_status = workflow
            if item["favorite"] and db.scalar(select(Favorite).where(Favorite.user_id == user.id, Favorite.story_id == current.id)) is None:
                db.add(Favorite(user_id=user.id, story_id=current.id))
            continue
        reviewed = status is not ValidationStatus.pending and admin is not None
        story = Story(
            title=title,
            narrator_name="Figure fictive",
            narrator_role=item["narrator_role"],  # type: ignore[arg-type]
            source=item["source"],  # type: ignore[arg-type]
            language=item["language"],  # type: ignore[arg-type]
            original_content=body,
            consent=True,
            publish_authorized=status is ValidationStatus.validated and reviewed,
            validation_status=status if reviewed else ValidationStatus.pending,
            workflow_status=workflow,
            category_id=categories.get(str(item["slug"])),
            created_by_id=user.id,
            validated_by_id=admin.id if reviewed else None,
            validated_at=datetime.now(timezone.utc) if reviewed else None,
        )
        db.add(story)
        created.append((story, bool(item["favorite"])))
    db.commit()
    for story, favorite in created:
        if favorite:
            db.add(Favorite(user_id=user.id, story_id=story.id))
    if created:
        db.commit()
    published = db.scalars(
        select(Story).where(
            Story.created_by_id == user.id,
            Story.validation_status == ValidationStatus.validated,
            Story.publish_authorized.is_(False),
            Story.workflow_status == WorkflowStatus.submitted,
            Story.title.like("Démonstration — %"),
        )
    ).all()
    for story in published:
        story.publish_authorized = True
    if published:
        db.commit()
    _seed_demo_atelier(db, user, admin)


def _seed_demo_atelier(db: Session, user: User, admin: User | None) -> None:
    if admin is None:
        return
    from fastapi import HTTPException

    from app.models import CorrectionRequest, Recipe, RecipeNote, SafetyReview
    from app.schemas.collection import CorrectionWrite
    from app.services.correction_service import request_correction
    from app.services.guide_service import review_safety
    from app.services.recipe_service import create_recipe, publish_recipe
    from app.services.space_service import save_note

    recipe_title = "Démonstration — Fiche au rhassoul"
    try:
        mask = db.scalar(select(Story).where(Story.created_by_id == user.id, Story.title == "Démonstration — Masque au rhassoul"))
        variant = db.scalar(select(Story).where(Story.created_by_id == user.id, Story.title == "Démonstration — Rhassoul sans eau de rose"))
        recipe = db.scalar(select(Recipe).where(Recipe.created_by_id == user.id, Recipe.title == recipe_title))
        if recipe is None and mask is not None and variant is not None and mask.publish_authorized and variant.publish_authorized:
            created = create_recipe(db, user, recipe_title, [mask.id, variant.id])
            recipe = db.get(Recipe, uuid.UUID(created["id"]))
        if recipe is not None and recipe.status == "draft":
            publish_recipe(db, user, recipe.id)
            recipe = db.get(Recipe, recipe.id)
        if recipe is not None and recipe.status == "published":
            if db.scalar(select(SafetyReview).where(SafetyReview.recipe_id == recipe.id)) is None:
                review_safety(
                    db,
                    admin,
                    recipe.id,
                    "approved",
                    "Revue d'usage de démonstration sur un texte fictif. Elle ne certifie pas un usage sûr.",
                )
            if db.scalar(select(RecipeNote).where(RecipeNote.user_id == user.id, RecipeNote.recipe_id == recipe.id)) is None:
                save_note(
                    db,
                    user,
                    recipe.id,
                    "Note de démonstration : cette fiche sert à comparer les deux exemples fictifs, sans ajouter de geste.",
                )
        vague = db.scalar(select(Story).where(Story.created_by_id == user.id, Story.title == "Démonstration — Exemple à préciser"))
        if vague is not None and db.scalar(select(CorrectionRequest).where(CorrectionRequest.story_id == vague.id)) is None:
            request_correction(
                db,
                admin,
                vague.id,
                CorrectionWrite(comment="Démonstration : cet exemple fictif ne précise ni le geste ni la source. Ceci n'est pas une appréciation médicale."),
            )
    except HTTPException:
        logger.exception("L'atelier de démonstration n'a pas pu être complété.")
        db.rollback()


def seed_reference_data(db: Session) -> None:
    seed_categories(db)
    seed_admin(db)
    seed_demo(db)
    seed_demo_stories(db)
