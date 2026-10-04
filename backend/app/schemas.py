"""Request and response models (Pydantic validates incoming data for us)."""
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from .config import settings

MIN_NOTES_CHARS = 20


class NotesRequest(BaseModel):
    notes: str = Field(..., max_length=settings.max_notes_chars)

    @field_validator("notes")
    @classmethod
    def notes_not_too_short(cls, value: str) -> str:
        value = value.strip()
        if len(value) < MIN_NOTES_CHARS:
            raise ValueError(f"Notes must be at least {MIN_NOTES_CHARS} characters long.")
        return value


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=4000)


class AskRequest(NotesRequest):
    question: str = Field(..., min_length=1, max_length=1000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=10)

    @field_validator("question")
    @classmethod
    def question_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Question can't be empty.")
        return value


class QuizRequest(NotesRequest):
    num_questions: int = Field(default=5, ge=3, le=10)


class TextResponse(BaseModel):
    result: str


class AskResponse(BaseModel):
    answer: str


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    answer: str
    answer_index: int
    explanation: str


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]


class HealthResponse(BaseModel):
    status: str
    ollama_reachable: bool
    model: str
    model_installed: bool
