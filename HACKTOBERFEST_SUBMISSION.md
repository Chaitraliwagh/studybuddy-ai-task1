<!-- Fill in every [TODO]. Delete this comment before posting. -->

## What I Built

**StudyBuddy AI** is a web app that makes long study notes easier to understand and revise. You paste your notes, then you can ask questions about them, get a beginner-friendly explanation, a short summary, a five-question multiple-choice quiz, and a simple revision plan.

I built it for a friend who often finds lengthy study material difficult to understand and revise. [TODO: add one or two true sentences about your friend and what they study, with their permission.]

The AI is Google Gemma running locally through Ollama. There is no paid AI API in the project.

## Demo

[TODO: paste your demo video link or deployed link here. Leave this as is until you have a real one.]

## Code

[TODO: paste your GitHub repository link here: https://github.com/YOUR_USERNAME/studybuddy-ai]

## How I Built It

- **Frontend:** React with Vite and Tailwind CSS. A dashboard with a notes editor, five feature cards (Ask AI, Explain Simply, Summarize, Generate Quiz, Create Revision Plan), a chat box, and an interactive quiz. Notes are saved in the browser, and all backend calls go through one API helper that reads `VITE_API_URL`.
- **Backend:** Python and FastAPI. Pydantic validates input, and a separate service layer holds the prompts: `ask_question()`, `summarize_notes()`, `explain_simply()`, `generate_quiz()`, `generate_revision_plan()`.
- **AI:** Gemma (`gemma3:4b`) served by Ollama on the same computer. The backend sends the notes plus a task-specific prompt to Ollama's chat API and returns the reply.
- **Architecture:** React UI → FastAPI → Ollama → Gemma → back to the UI.

How the model is used:
- *Ask AI* tells Gemma to answer only from the notes and to say when the notes don't contain the answer. This is prompt-based, so it reduces but doesn't eliminate made-up answers.
- *Quiz* asks Gemma for JSON. The backend extracts and validates it, drops malformed questions, shuffles the options, retries once, and shows a clear error if it still can't get a usable quiz.
- *Summary, Explain Simply and Revision Plan* use prompts that fix the output shape and stay within the notes.

Backend tests run against a fake model and cover validation and quiz parsing. I haven't measured Gemma's answer quality. [TODO: add what you actually observed when trying it with real notes, or delete this line.]

## Why Does Open Innovation Matter?

An open-weight model fit this project because study notes are personal. With Gemma running locally, the notes never leave the computer, which matters for a student pasting in coursework. It also meant no API key, no per-request cost and no dependence on a closed service that could change its pricing or rules. I could pick the model size to match a normal laptop, and switching to a different open model is a one-line config change. The trade-off is that a small local model is less capable than the biggest hosted ones, so the app tells users to check important facts.

## My Agent Session

Agent session: Not included.

## Prize Categories

- **Best Use of Gemma:** The core AI features all run on Gemma through Ollama, so I'm submitting for this category. Please check it against the official challenge rules before posting.

I'm not claiming any other partner category, because the project doesn't use those tools.
