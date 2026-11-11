import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.enums import LanguageCode, UserRole
from app.core.security import hash_password
from app.models import Category, User

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


def seed_reference_data(db: Session) -> None:
    seed_categories(db)
    seed_admin(db)
