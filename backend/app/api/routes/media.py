import uuid

from fastapi import APIRouter, File, Form, Response, UploadFile, status
from fastapi.responses import FileResponse

from app.api.deps import CurrentUser, DbSession
from app.schemas.collection import CorrectedText, ExtractionRequest, MediaRead
from app.services import media_service

router = APIRouter(prefix="/stories/{story_id}/media")


@router.get("", response_model=list[MediaRead])
def read_media(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> list[MediaRead]:
    return media_service.list_media(db, user, story_id)


@router.post("", response_model=MediaRead, status_code=status.HTTP_201_CREATED)
async def create_media(
    story_id: uuid.UUID,
    user: CurrentUser,
    db: DbSession,
    file: UploadFile = File(...),
    consent_to_retain: bool = Form(False),
) -> MediaRead:
    data = await file.read()
    return media_service.store_upload(db, user, story_id, file.filename, data, consent_to_retain)


@router.get("/{media_id}/file")
def download_media(story_id: uuid.UUID, media_id: uuid.UUID, user: CurrentUser, db: DbSession) -> FileResponse:
    item, path = media_service.open_file(db, user, story_id, media_id)
    return FileResponse(
        path,
        media_type=item.content_type,
        filename=item.original_name,
        content_disposition_type="inline",
        headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store"},
    )


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_media(story_id: uuid.UUID, media_id: uuid.UUID, user: CurrentUser, db: DbSession) -> Response:
    media_service.delete_media(db, user, story_id, media_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{media_id}/transcription", response_model=MediaRead)
def transcribe(story_id: uuid.UUID, media_id: uuid.UUID, user: CurrentUser, db: DbSession) -> MediaRead:
    return media_service.transcribe_media(db, user, story_id, media_id)


@router.patch("/{media_id}/transcription", response_model=MediaRead)
def correct_transcript(
    story_id: uuid.UUID,
    media_id: uuid.UUID,
    payload: CorrectedText,
    user: CurrentUser,
    db: DbSession,
) -> MediaRead:
    return media_service.correct_transcript(db, user, story_id, media_id, payload)


@router.post("/{media_id}/extraction", response_model=MediaRead)
def extract(
    story_id: uuid.UUID,
    media_id: uuid.UUID,
    payload: ExtractionRequest,
    user: CurrentUser,
    db: DbSession,
) -> MediaRead:
    return media_service.read_document(db, user, story_id, media_id, payload.manuscript)


@router.patch("/{media_id}/extraction", response_model=MediaRead)
def correct_extraction(
    story_id: uuid.UUID,
    media_id: uuid.UUID,
    payload: CorrectedText,
    user: CurrentUser,
    db: DbSession,
) -> MediaRead:
    return media_service.correct_document(db, user, story_id, media_id, payload)
