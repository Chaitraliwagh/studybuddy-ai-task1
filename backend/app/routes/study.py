"""HTTP endpoints. They validate input, call ai_service, and return the result."""
from fastapi import APIRouter

from .. import schemas
from ..services import ai_service, ollama_client

router = APIRouter(prefix="/api", tags=["study"])


@router.get("/health", response_model=schemas.HealthResponse)
async def health():
    from ..config import settings

    reachable, installed = await ollama_client.check_health()
    return schemas.HealthResponse(
        status="ok" if reachable and installed else "degraded",
        ollama_reachable=reachable,
        model=settings.ollama_model,
        model_installed=installed,
    )


@router.post("/ask", response_model=schemas.AskResponse)
async def ask(body: schemas.AskRequest):
    answer = await ai_service.ask_question(
        body.notes, body.question, [turn.model_dump() for turn in body.history]
    )
    return schemas.AskResponse(answer=answer)


@router.post("/summarize", response_model=schemas.TextResponse)
async def summarize(body: schemas.NotesRequest):
    return schemas.TextResponse(result=await ai_service.summarize_notes(body.notes))


@router.post("/explain", response_model=schemas.TextResponse)
async def explain(body: schemas.NotesRequest):
    return schemas.TextResponse(result=await ai_service.explain_simply(body.notes))


@router.post("/quiz", response_model=schemas.QuizResponse)
async def quiz(body: schemas.QuizRequest):
    questions = await ai_service.generate_quiz(body.notes, body.num_questions)
    return schemas.QuizResponse(questions=questions)


@router.post("/revision", response_model=schemas.TextResponse)
async def revision(body: schemas.NotesRequest):
    return schemas.TextResponse(result=await ai_service.generate_revision_plan(body.notes))
