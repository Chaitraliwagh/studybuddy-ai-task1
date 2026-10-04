# StudyBuddy AI

An AI study assistant that turns long study notes into simple explanations, summaries, quizzes and revision plans. It runs on an open-weight **Google Gemma** model on your own computer through **Ollama**, so there is no paid AI API and your notes stay on your machine.

## Problem

I built StudyBuddy AI for a friend who often finds lengthy study material difficult to understand and revise. Long chapters are hard to digest, it isn't obvious where to start revising, and it's hard to tell whether the material has actually been understood.

## Solution

Paste your notes once, then:

- ask questions and get answers based on those notes,
- have hard language rewritten in beginner-friendly words,
- get a short summary of the key points,
- test yourself with a multiple-choice quiz,
- get a simple, session-based revision plan.

## Features

All of these are implemented:

- **Study notes**: paste notes, save them (kept in your browser's local storage), clear them, or load sample notes.
- **Ask AI**: chat about your notes, with loading indicator, error messages and a Clear chat button. The prompt tells the model to answer only from your notes and to say "I couldn't find that in your notes." when the answer isn't there.
- **Explain Simply**: rewrites the notes in plain language.
- **Summarize**: one-sentence main idea plus key bullet points.
- **Generate Quiz**: 5 multiple-choice questions with 4 options, the correct answer and a short explanation. Click an option to see feedback and a final score. Option order is shuffled by the backend. If the model returns broken JSON, the backend repairs what it can, retries once, and otherwise shows a clear error.
- **Create Revision Plan**: 3 to 6 short sessions plus a final check, based on the notes. It does not assume your schedule.
- **Status indicator** in the header showing whether the backend, Ollama and the model are reachable.
- Responsive layout (desktop, tablet, mobile) and keyboard-accessible controls.

## Tech Stack

- **React** + **Vite** + **Tailwind CSS** (frontend)
- **Python** + **FastAPI** (backend, with Pydantic validation and automatic API docs)
- **Google Gemma** (`gemma3:4b` by default)
- **Ollama** (runs the model locally)

## Architecture

```
User
  ↓
React UI (Vite + Tailwind)        http://localhost:5173
  ↓  fetch (address from VITE_API_URL)
FastAPI backend                   http://localhost:8000
  ↓  POST /api/chat
Ollama                            http://localhost:11434
  ↓
Gemma (gemma3:4b)
  ↓
AI response → FastAPI (checks / parses) → React UI
```

The backend is stateless. The browser sends the notes with every request. Only `backend/app/services/ollama_client.py` talks to Ollama, and `ai_service.py` holds the prompts: `ask_question()`, `summarize_notes()`, `explain_simply()`, `generate_quiz()`, `generate_revision_plan()`.

## Why Open-Source AI?

- **Local inference and privacy**: notes are processed on your own computer and are not sent to a third-party AI service.
- **No dependency on a proprietary API**: no API key, no per-request bill, and it works offline once the model is downloaded.
- **Customizable**: switching to another model is one line in `backend/.env` (`OLLAMA_MODEL`), and the model can be fine-tuned or wrapped with custom instructions.
- **Control**: you decide which model version runs and how the prompts work.

The trade-off: a small local model is less capable than the largest hosted models, and it can make mistakes. Check important facts against your textbook.

## Installation

You need: **Git**, **Python 3.10+**, **Node.js 18+**, and **Ollama**. Roughly 4 GB of free disk space and 8 GB RAM are recommended for the default model.

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd studybuddy-ai
```

### 2. Install Ollama

Download it from <https://ollama.com/download> (Windows / macOS), or on Linux:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 3. Download Gemma

```bash
ollama pull gemma3:4b
ollama run gemma3:4b "Explain what an operating system is in two sentences."
```

You should see a short answer. Type `/bye` to exit. On a low-memory computer, use `gemma3:1b` instead and set `OLLAMA_MODEL=gemma3:1b` in step 4.

### 4. Start the backend

Open a terminal in the `studybuddy-ai` folder:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

- Windows (PowerShell): `.venv\Scripts\Activate.ps1`
- Windows (cmd): `.venv\Scripts\activate.bat`
- macOS / Linux: `source .venv/bin/activate`

Then:

```bash
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
uvicorn app.main:app --reload
```

Check <http://localhost:8000/api/health>. It should say `"status":"ok"`. API docs are at <http://localhost:8000/docs>.

### 5. Start the frontend

Open a **second** terminal in the `studybuddy-ai` folder:

```bash
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev
```

### 6. Open the app

Go to <http://localhost:5173>. The green pill in the header should read `gemma3:4b ready`.

## Configuration

| File | Variable | Meaning |
|---|---|---|
| `backend/.env` | `OLLAMA_BASE_URL` | Where Ollama runs (default `http://localhost:11434`) |
| `backend/.env` | `OLLAMA_MODEL` | Model name (default `gemma3:4b`) |
| `backend/.env` | `OLLAMA_TIMEOUT_SECONDS` | How long to wait for the model |
| `backend/.env` | `OLLAMA_NUM_CTX` | Context window in tokens |
| `backend/.env` | `CORS_ORIGINS` | Website addresses allowed to call the backend |
| `backend/.env` | `MAX_NOTES_CHARS` | Longest notes accepted (default 12000) |
| `frontend/.env` | `VITE_API_URL` | Backend address (default `http://localhost:8000`) |

`.env` files are git-ignored. No secret keys are needed anywhere. If you change `MAX_NOTES_CHARS`, also update `MAX_NOTES` in `frontend/src/lib/api.js`.

## Usage

1. Paste notes into the box (or click **Try sample notes**) and click **Save notes**.
2. **Explain Simply**: rewrites the notes in plain language.
3. **Ask AI**: type a question, or click a suggested one. Use **Clear chat** to start over.
4. **Summarize**: shows the main idea and key points.
5. **Generate Quiz**: answer the questions, read the explanations, see your score, or **Retry this quiz**.
6. **Create Revision Plan**: shows sessions you can work through. **Generate again** gives a fresh version of any result.

Local models are slow on some computers. The first request after starting Ollama loads the model and can take noticeably longer.

## Testing

Backend tests use a fake model, so they run without Ollama:

```bash
cd backend
python -m pytest
```

They cover request validation, prompt contents, quiz parsing and repair, retry behaviour and error responses. They do **not** measure the quality of Gemma's answers. Try the app with your own notes to judge that.

## Project Structure

```
studybuddy-ai/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, error handler
│   │   ├── config.py             # settings from environment variables
│   │   ├── schemas.py            # request/response models
│   │   ├── routes/study.py       # /api endpoints
│   │   └── services/
│   │       ├── ollama_client.py  # talks to Ollama
│   │       └── ai_service.py     # prompts and quiz parsing
│   ├── tests/test_api.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/           # NotesEditor, FeatureCard, ChatBox, QuizCard, ...
│   │   ├── lib/api.js            # all backend calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── DEPLOYMENT.md
├── DEMO_SCRIPT.md
├── HACKTOBERFEST_SUBMISSION.md
├── README.md
├── .gitignore
└── LICENSE
```

## Troubleshooting

- **"Backend not reachable" in the header**: the backend isn't running, or `VITE_API_URL` is wrong.
- **"Ollama isn't running"**: start the Ollama app, or run `ollama serve`.
- **"Model gemma3:4b not installed"**: run `ollama pull gemma3:4b`.
- **Quiz fails sometimes**: small models occasionally return unusable JSON. Click Generate Quiz again.
- **Very slow or timeouts**: use shorter notes, try `gemma3:1b`, or raise `OLLAMA_TIMEOUT_SECONDS`.

## Future Improvements

Not implemented yet:

- PDF upload
- User accounts and saved study sessions
- Spaced repetition and progress tracking
- Support for choosing between additional open models in the UI

## Hacktoberfest

Built for the **Hacktoberfest Weekend Challenge: Build for a Friend**, around an open-weight AI model (Google Gemma, run locally with Ollama).

See [DEPLOYMENT.md](DEPLOYMENT.md) for local vs public deployment and [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the demo recording flow.

## License

MIT. See [LICENSE](LICENSE).
