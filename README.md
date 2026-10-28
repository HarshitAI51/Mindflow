# TruthLens

Verify a free-text answer by breaking it into claims, retrieving evidence, and scoring each
claim with an NLI model. The UI shows the answer → claims → evidence graph, colour-coded by verdict.

## Repository layout

```
truthlens/
├── backend/    FastAPI + NLP pipeline (Python)
├── frontend/   React + Vite + React Flow UI
└── docs/       architecture.md, api_contract.md
```

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows; Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8001
```

Swagger UI: http://localhost:8001/docs

> Port 8001 is used because `wslrelay.exe` (WSL localhost forwarding) occupies 127.0.0.1:8000 on
> Windows dev machines and swallows requests. To go back to 8000, drop `--port 8001` and change
> the `baseURL` in `frontend/src/lib/api.js`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173 — paste any text, click **Verify**, and the API response is printed as JSON.

## Status

Session 1 complete: architecture, folder structure, API contract, and an end-to-end working
stack against a stub `POST /api/verify`.

Still to build: FEVER download + evidence corpus, claim extractor, BM25/FAISS indexes,
NLI verifier, orchestrator, React Flow graph UI, evaluation.

## Docs

- [Architecture](docs/architecture.md)
- [API contract](docs/api_contract.md)
