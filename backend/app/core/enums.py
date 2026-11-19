from enum import Enum


class UserRole(str, Enum):
    contributor = "contributor"
    validator = "validator"
    admin = "admin"


class LanguageCode(str, Enum):
    fr = "fr"
    ar = "ar"
    ary = "ary"


class NarratorRole(str, Enum):
    grandmother = "grandmother"
    achaba = "achaba"
    hammam_practitioner = "hammam_practitioner"
    practitioner = "practitioner"
    other = "other"


class StorySource(str, Enum):
    oral = "oral"
    written = "written"
    digitized = "digitized"


class ValidationStatus(str, Enum):
    pending = "pending"
    validated = "validated"
    rejected = "rejected"
    correction_requested = "correction_requested"


class WorkflowStatus(str, Enum):
    draft = "draft"
    submitted = "submitted"


class MediaKind(str, Enum):
    audio = "audio"
    image = "image"
    document = "document"


class EngineStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    unavailable = "unavailable"
    completed = "completed"
    failed = "failed"


class CorrectionState(str, Enum):
    open = "open"
    answered = "answered"


class ContentOrigin(str, Enum):
    """Origine du texte. En phase 1, seuls des contenus collectés existent."""

    collected = "collected"
