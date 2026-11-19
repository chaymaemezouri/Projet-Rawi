import struct
import uuid

from app.core.enums import EngineStatus, LanguageCode, MediaKind
from app.services import media_service
from app.services.reading import ReadingOutcome
from app.services.speech import SpeechOutcome
from tests.helpers import auth_header, register, story_payload


def _category_id(client) -> str:
    return client.get("/api/categories").json()[0]["id"]


def _story(client, token_owner, **overrides) -> str:
    created = client.post(
        "/api/stories",
        json=story_payload(_category_id(client), **overrides),
        headers=auth_header(token_owner),
    )
    assert created.status_code == 201, created.text
    return created.json()["id"]


def _wav() -> bytes:
    payload = b"\x00\x00" * 32
    fmt = struct.pack("<HHIIHH", 1, 1, 8000, 16000, 2, 16)
    body = b"RIFF" + struct.pack("<I", 36 + len(payload)) + b"WAVE"
    body += b"fmt " + struct.pack("<I", len(fmt)) + fmt
    body += b"data" + struct.pack("<I", len(payload)) + payload
    return body


def _promote(db_session, email: str):
    from sqlalchemy import select

    from app.core.enums import UserRole
    from app.models import User

    account = db_session.scalar(select(User).where(User.email == email))
    account.role = UserRole.validator
    db_session.commit()


def test_audio_is_stored_and_hidden_from_another_contributor(client, monkeypatch):
    owner = register(client, "owner-media@rawi.test")
    other = register(client, "other-media@rawi.test")
    story_id = _story(client, owner)
    refused = client.post(
        f"/api/stories/{story_id}/media",
        files={"file": ("note.txt", b"ceci n'est pas un audio", "text/plain")},
        data={"consent_to_retain": "true"},
        headers=auth_header(owner),
    )
    assert refused.status_code == 415
    missing_consent = client.post(
        f"/api/stories/{story_id}/media",
        files={"file": ("voix.wav", _wav(), "audio/wav")},
        data={"consent_to_retain": "false"},
        headers=auth_header(owner),
    )
    assert missing_consent.status_code == 422

    monkeypatch.setitem(media_service.MAX_BYTES, MediaKind.audio, 40)
    too_big = client.post(
        f"/api/stories/{story_id}/media",
        files={"file": ("voix.wav", _wav(), "audio/wav")},
        data={"consent_to_retain": "true"},
        headers=auth_header(owner),
    )
    assert too_big.status_code == 413
    monkeypatch.setitem(media_service.MAX_BYTES, MediaKind.audio, 20_000_000)

    stored = client.post(
        f"/api/stories/{story_id}/media",
        files={"file": ("voix.wav", _wav(), "audio/wav")},
        data={"consent_to_retain": "true"},
        headers=auth_header(owner),
    )
    assert stored.status_code == 201, stored.text
    media_id = stored.json()["id"]
    assert stored.json()["kind"] == "audio"
    assert stored.json()["consent_retained"] is True

    own_file = client.get(f"/api/stories/{story_id}/media/{media_id}/file", headers=auth_header(owner))
    assert own_file.status_code == 200
    assert own_file.content.startswith(b"RIFF")
    hidden = client.get(f"/api/stories/{story_id}/media", headers=auth_header(other))
    assert hidden.status_code == 404
    hidden_file = client.get(f"/api/stories/{story_id}/media/{media_id}/file", headers=auth_header(other))
    assert hidden_file.status_code == 404


def test_transcription_stays_separate_and_unavailable_engine_invents_nothing(client, db_session, monkeypatch):
    owner = register(client, "owner-speech@rawi.test")
    story_id = _story(client, owner)
    stored = client.post(
        f"/api/stories/{story_id}/media",
        files={"file": ("voix.wav", _wav(), "audio/wav")},
        data={"consent_to_retain": "true"},
        headers=auth_header(owner),
    )
    media_id = stored.json()["id"]
    original = client.get(f"/api/stories/{story_id}", headers=auth_header(owner)).json()["original_content"]

    monkeypatch.setattr(
        "app.services.speech.transcribe_path",
        lambda path, language: SpeechOutcome(EngineStatus.unavailable, None, None, "moteur absent"),
    )
    missing = client.post(
        f"/api/stories/{story_id}/media/{media_id}/transcription",
        headers=auth_header(owner),
    )
    assert missing.status_code == 200
    assert missing.json()["transcript"]["status"] == "unavailable"
    assert missing.json()["transcript"]["raw_text"] is None

    seen = []

    def finished(path, language):
        from sqlalchemy import select

        from app.models.collection import Transcript

        row = db_session.scalar(select(Transcript).where(Transcript.media_id == uuid.UUID(media_id)))
        seen.append(row.status.value)
        return SpeechOutcome(EngineStatus.completed, "trois cuillères", "faster-whisper", "à relire")

    monkeypatch.setattr("app.services.speech.transcribe_path", finished)
    done = client.post(
        f"/api/stories/{story_id}/media/{media_id}/transcription",
        headers=auth_header(owner),
    )
    assert done.json()["transcript"]["raw_text"] == "trois cuillères"
    assert seen == ["processing"]

    corrected = client.patch(
        f"/api/stories/{story_id}/media/{media_id}/transcription",
        json={"corrected_text": "trois cuillères de rhassoul"},
        headers=auth_header(owner),
    )
    body = corrected.json()["transcript"]
    assert body["raw_text"] == "trois cuillères"
    assert body["corrected_text"] == "trois cuillères de rhassoul"
    assert client.get(f"/api/stories/{story_id}", headers=auth_header(owner)).json()["original_content"] == original


def test_document_reading_does_not_replace_the_file(client, monkeypatch):
    owner = register(client, "owner-doc@rawi.test", full_name="Amina Benali")
    story_id = _story(client, owner, language="ar")
    pdf = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
    stored = client.post(
        f"/api/stories/{story_id}/media",
        files={"file": ("page.pdf", pdf, "application/pdf")},
        data={"consent_to_retain": "true"},
        headers=auth_header(owner),
    )
    assert stored.status_code == 201, stored.text
    media_id = stored.json()["id"]
    monkeypatch.setattr(
        "app.services.reading.extract_document",
        lambda path, content_type, language, manuscript: ReadingOutcome(
            EngineStatus.completed,
            "texte extrait",
            "pypdf",
            "à vérifier",
            language == LanguageCode.ar or manuscript,
        ),
    )
    read = client.post(
        f"/api/stories/{story_id}/media/{media_id}/extraction",
        json={"manuscript": True},
        headers=auth_header(owner),
    )
    assert read.status_code == 200, read.text
    extraction = read.json()["extraction"]
    assert extraction["raw_text"] == "texte extrait"
    assert extraction["needs_strong_review"] is True
    downloaded = client.get(f"/api/stories/{story_id}/media/{media_id}/file", headers=auth_header(owner))
    assert downloaded.content == pdf
    fixed = client.patch(
        f"/api/stories/{story_id}/media/{media_id}/extraction",
        json={"corrected_text": "texte relu"},
        headers=auth_header(owner),
    )
    assert fixed.json()["extraction"]["raw_text"] == "texte extrait"
    assert fixed.json()["extraction"]["corrected_text"] == "texte relu"


def test_correction_request_returns_the_story_to_review(client, db_session):
    owner = register(client, "owner-fix@rawi.test")
    reviewer = register(client, "reviewer-fix@rawi.test", full_name="Hassan Alami")
    stranger = register(client, "stranger-fix@rawi.test")
    _promote(db_session, "reviewer-fix@rawi.test")
    story_id = _story(client, owner)
    denied = client.post(
        f"/api/stories/{story_id}/corrections",
        json={"comment": "Préciser la quantité de rhassoul."},
        headers=auth_header(owner),
    )
    assert denied.status_code == 403
    requested = client.post(
        f"/api/stories/{story_id}/corrections",
        json={"comment": "Préciser la quantité de rhassoul."},
        headers=auth_header(reviewer),
    )
    assert requested.status_code == 200, requested.text
    assert requested.json()["validation_status"] == "correction_requested"
    mine = client.get("/api/me/corrections", headers=auth_header(owner))
    assert mine.status_code == 200
    assert mine.json()[0]["comment"] == "Préciser la quantité de rhassoul."
    assert client.get(f"/api/stories/{story_id}/corrections", headers=auth_header(stranger)).status_code == 404

    updated = client.patch(
        f"/api/stories/{story_id}",
        json=story_payload(
            _category_id(client),
            original_content="Elle prenait trois cuillères de rhassoul, pas deux, avec l'eau de rose.",
        ),
        headers=auth_header(owner),
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["validation_status"] == "pending"
    assert updated.json()["original_content"].startswith("Elle prenait trois")
    history = client.get(f"/api/stories/{story_id}/revisions", headers=auth_header(owner))
    assert history.status_code == 200
    assert len(history.json()) >= 1
    assert "trois cuillères de rhassoul et" in history.json()[0]["snapshot"]["original_content"]
    assert client.get("/api/me/corrections", headers=auth_header(owner)).json() == []
