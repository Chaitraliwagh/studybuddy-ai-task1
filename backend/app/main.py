"""StudyBuddy AI backend. Run with: uvicorn app.main:app --reload"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routes import study
from .services.ollama_client import AIServiceError

app = FastAPI(
    title="StudyBuddy AI API",
    description="Study helper backed by a local Gemma model running in Ollama.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(AIServiceError)
async def ai_error_handler(_: Request, exc: AIServiceError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


app.include_router(study.router)


@app.get("/", include_in_schema=False)
async def root():
    return {"app": "StudyBuddy AI", "docs": "/docs", "health": "/api/health"}
