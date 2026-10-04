# Deployment

## Local demo vs public deployment

StudyBuddy AI has three parts: the React website, the FastAPI backend, and the Gemma model running in Ollama.

| Part | Needs | Can run on free hosting? |
|---|---|---|
| React frontend | Static file hosting | Yes |
| FastAPI backend | A small Python server | Usually yes |
| Gemma via Ollama | Several GB of RAM, ideally a GPU | **No. Normal free web hosts can't run it reliably** |

So a public link only works if Ollama runs somewhere powerful and the backend can reach it. Do not publish a link that points to a backend with no model behind it, because every button would fail.

## Option 1 (recommended for the challenge): polished local demo

Run everything on your laptop as described in the README and record a short video (see `DEMO_SCRIPT.md`). In your submission, say honestly that the model runs locally. This is a legitimate way to show an open-weight project.

## Option 2: public deployment with a real model server

1. **Model server.** Rent or borrow a machine that can run Ollama (a cloud VM with enough RAM, ideally with a GPU). Install Ollama there, run `ollama pull gemma3:4b`, and make sure only your backend can reach port 11434. Never expose Ollama to the whole internet without protection.
2. **Backend (for example on Render).** Create a Web Service from your GitHub repo:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment variables: `OLLAMA_BASE_URL` (address of your model server), `OLLAMA_MODEL=gemma3:4b`, `CORS_ORIGINS` (your frontend's public address)
3. **Frontend (for example a Render Static Site).**
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Environment variable: `VITE_API_URL` set to your backend's public address
   - Set `VITE_API_URL` **before** building, because Vite bakes it into the build.
4. Open the deployed site. The header pill should show the model as ready. If it doesn't, the backend can't reach the model server.

Hosting dashboards change over time, so check Render's current docs if a field has moved.

## Option 3: temporary public link to your own computer (demo only)

A tunnel tool such as Cloudflare Tunnel or ngrok can give your locally running backend a temporary public address. Use it only while you demo, treat the link as public, and shut it down afterwards. Add the frontend's address to `CORS_ORIGINS`.

## What not to do

- Don't put API keys or `.env` files in the frontend or in GitHub.
- Don't claim a deployed AI endpoint unless you have opened it and seen real Gemma answers.
