"""Tests run without Ollama: we replace the model call with a fake one."""
import json
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402
from app.services import ai_service, ollama_client  # noqa: E402
from app.services.ollama_client import AIServiceError  # noqa: E402

client = TestClient(app)
NOTES = "Operating systems manage computer hardware and software resources for programs."

GOOD_QUIZ = {
    "questions": [
        {
            "question": f"Question {i}?",
            "options": ["A) one", "B) two", "C) three", "D) four"],
            "answer": "B",
            "explanation": "Because.",
        }
        for i in range(5)
    ]
}


def fake_chat(reply):
    async def _chat(messages, *, json_mode=False, temperature=0.3):
        _chat.calls.append({"messages": messages, "json_mode": json_mode})
        value = reply.pop(0) if isinstance(reply, list) else reply
        if isinstance(value, Exception):
            raise value
        return value

    _chat.calls = []
    return _chat


def test_ask_includes_notes_and_question(monkeypatch):
    fake = fake_chat("It manages resources.")
    monkeypatch.setattr(ollama_client, "chat", fake)
    r = client.post("/api/ask", json={"notes": NOTES, "question": "What does an OS do?"})
    assert r.status_code == 200
    assert r.json()["answer"] == "It manages resources."
    sent = fake.calls[0]["messages"]
    assert NOTES in sent[0]["content"]
    assert sent[-1] == {"role": "user", "content": "What does an OS do?"}


def test_summarize_explain_revision(monkeypatch):
    monkeypatch.setattr(ollama_client, "chat", fake_chat("some text"))
    for path in ("summarize", "explain", "revision"):
        r = client.post(f"/api/{path}", json={"notes": NOTES})
        assert r.status_code == 200, path
        assert r.json()["result"] == "some text"


def test_quiz_valid_and_letter_answer_resolved(monkeypatch):
    fake = fake_chat(json.dumps(GOOD_QUIZ))
    monkeypatch.setattr(ollama_client, "chat", fake)
    r = client.post("/api/quiz", json={"notes": NOTES})
    assert r.status_code == 200
    qs = r.json()["questions"]
    assert len(qs) == 5
    for q in qs:
        assert q["answer"] == "two"
        assert q["options"][q["answer_index"]] == "two"
        assert sorted(q["options"]) == ["four", "one", "three", "two"]
    assert fake.calls[0]["json_mode"] is True


def test_quiz_handles_code_fences(monkeypatch):
    raw = "```json\n" + json.dumps(GOOD_QUIZ) + "\n```"
    monkeypatch.setattr(ollama_client, "chat", fake_chat(raw))
    assert client.post("/api/quiz", json={"notes": NOTES}).status_code == 200


def test_quiz_retries_once_then_succeeds(monkeypatch):
    fake = fake_chat(["not json at all", json.dumps(GOOD_QUIZ)])
    monkeypatch.setattr(ollama_client, "chat", fake)
    r = client.post("/api/quiz", json={"notes": NOTES})
    assert r.status_code == 200
    assert len(fake.calls) == 2


def test_quiz_gives_clear_error_when_model_keeps_failing(monkeypatch):
    monkeypatch.setattr(ollama_client, "chat", fake_chat(["nope", "still nope"]))
    r = client.post("/api/quiz", json={"notes": NOTES})
    assert r.status_code == 502
    assert "Generate Quiz again" in r.json()["detail"]


def test_parse_quiz_drops_bad_questions():
    data = {
        "questions": [
            {"question": "ok?", "options": ["a", "b", "c", "d"], "answer": "c", "explanation": "x"},
            {"question": "bad answer", "options": ["a", "b", "c", "d"], "answer": "zzz"},
            {"question": "three options", "options": ["a", "b", "c"], "answer": "a"},
            "garbage",
        ]
    }
    qs = ai_service.parse_quiz(json.dumps(data), 5)
    assert len(qs) == 1 and qs[0]["answer"] == "c"


def test_validation_errors():
    assert client.post("/api/summarize", json={"notes": "short"}).status_code == 422
    assert client.post("/api/summarize", json={"notes": "x" * 20000}).status_code == 422
    assert client.post("/api/ask", json={"notes": NOTES, "question": "   "}).status_code == 422
    assert client.post("/api/quiz", json={"notes": NOTES, "num_questions": 99}).status_code == 422


@pytest.mark.parametrize("status", [503, 504])
def test_ollama_errors_become_friendly_json(monkeypatch, status):
    monkeypatch.setattr(ollama_client, "chat", fake_chat(AIServiceError("boom", status)))
    r = client.post("/api/summarize", json={"notes": NOTES})
    assert r.status_code == status
    assert r.json() == {"detail": "boom"}


def test_health_endpoint(monkeypatch):
    async def fake_health():
        return True, False

    monkeypatch.setattr(ollama_client, "check_health", fake_health)
    body = client.get("/api/health").json()
    assert body["status"] == "degraded"
    assert body["ollama_reachable"] is True and body["model_installed"] is False
