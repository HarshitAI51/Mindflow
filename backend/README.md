# Backend — TruthLens API

FastAPI service exposing `POST /api/verify`. See [../docs/api_contract.md](../docs/api_contract.md).

## Setup

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows; Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Requires Python 3.10–3.12 (developed against 3.12). Config lives in
[app/config.py](file:///C:/Users/hp/Documents/Trae/temp_20261028_01/truthlens/backend/app/config.py)
and can be overridden with a `.env` file — copy `.env.example` to get started.

## Run

```bash
uvicorn app.main:app --reload --port 8001
```

Swagger UI at http://localhost:8001/docs.

Port 8001 avoids the WSL localhost relay (`wslrelay.exe`) that occupies 127.0.0.1:8000 on some
Windows machines. Any free port works as long as `frontend/src/lib/api.js` matches.

## Test

```bash
pytest
```

## Notebooks

`notebooks/` must run on the project venv, not the machine's global Python (the global 3.12 here has
`transformers` but no `torch`). Register the kernel once:

```bash
.venv\Scripts\python.exe -m ipykernel install --user --name truthlens-venv --display-name "TruthLens (venv backend)"
```

Then select **TruthLens (venv backend)** in Jupyter/VS Code, or execute headless:

```bash
.venv\Scripts\jupyter.exe nbconvert --to notebook --execute --inplace --ExecutePreprocessor.kernel_name=truthlens-venv notebooks\01_test_nli.ipynb
```

## Layout

```
app/
├── main.py              FastAPI entry point
├── config.py            settings (model names, thresholds, paths)
├── pipeline/            claim_extractor, retriever, verifier, orchestrator (stubs for now)
├── models/schemas.py    Pydantic request/response models
└── routes/verify.py     POST /api/verify
data/                    raw FEVER download, processed corpus, retrieval indexes (git-ignored)
scripts/                 download_fever.py, build_indexes.py, evaluate.py
notebooks/               exploration and evaluation notebooks
```

## Status

`POST /api/verify` currently returns a hardcoded stub response so the frontend can be built in
parallel. The pipeline modules are implemented in later sessions.
