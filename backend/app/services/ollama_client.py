"""The only file that talks to Ollama. Everything else calls chat()."""
import httpx

from ..config import settings


class AIServiceError(Exception):
    """An error we can show to the user. status_code is the HTTP status we return."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


async def chat(messages: list[dict], *, json_mode: bool = False, temperature: float = 0.3) -> str:
    """Send chat messages to Ollama and return the model's text reply."""
    payload: dict = {
        "model": settings.ollama_model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": temperature, "num_ctx": settings.ollama_num_ctx},
    }
    if json_mode:
        payload["format"] = "json"

    try:
        async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
            response = await client.post(f"{settings.ollama_base_url}/api/chat", json=payload)
    except httpx.ConnectError:
        raise AIServiceError(
            f"Can't reach Ollama at {settings.ollama_base_url}. "
            "Make sure Ollama is installed and running, then try again.",
            503,
        )
    except httpx.TimeoutException:
        raise AIServiceError(
            "The model took too long to answer. Try shorter notes or a smaller model.", 504
        )
    except httpx.HTTPError as exc:
        raise AIServiceError(f"Couldn't talk to Ollama: {exc}", 502)

    if response.status_code == 404:
        raise AIServiceError(
            f"The model '{settings.ollama_model}' isn't installed. "
            f"Run: ollama pull {settings.ollama_model}",
            503,
        )
    if response.status_code >= 400:
        try:
            detail = response.json().get("error", response.text)
        except ValueError:
            detail = response.text
        raise AIServiceError(f"Ollama returned an error: {detail}", 502)

    try:
        content = response.json().get("message", {}).get("content", "")
    except ValueError:
        raise AIServiceError("Ollama sent a response we couldn't read.", 502)

    content = (content or "").strip()
    if not content:
        raise AIServiceError("The model returned an empty answer. Please try again.", 502)
    return content


async def check_health() -> tuple[bool, bool]:
    """Return (ollama_reachable, model_installed)."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{settings.ollama_base_url}/api/tags")
        response.raise_for_status()
        names = [m.get("name", "") for m in response.json().get("models", [])]
    except (httpx.HTTPError, ValueError):
        return False, False

    wanted = settings.ollama_model
    installed = any(n == wanted or n == f"{wanted}:latest" for n in names)
    return True, installed
