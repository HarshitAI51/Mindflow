# TruthLens — Architecture

## Overview

TruthLens verifies a free-text answer by decomposing it into atomic claims, retrieving
evidence for each claim, and scoring every (claim, evidence) pair with an NLI model.
The result is a verdict per claim (`SUPPORTED` / `CONTRADICTED` / `INSUFFICIENT_EVIDENCE`)
plus a graph of answer → claim → evidence edges that the frontend renders.

## Request flow

```
Browser (React + Vite :5173)
      │  POST /api/verify  { "answer": "..." }
      ▼
FastAPI (:8001)
      │
      ├── Step 1  Claim Extraction      text → sentence/claim list (spaCy)
      ├── Step 2  Hybrid Retrieval      BM25 (rank-bm25) + semantic (FAISS + MiniLM)
      │                                 → weighted score fusion → top-k evidence
      ├── Step 3  NLI Verification      DeBERTa cross-encoder per (claim, evidence) pair
      │                                 → entailment / contradiction / neutral + score
      └── Step 4  Decision Layer        aggregate scores + calibrated thresholds
                                        → verdict + confidence per claim
      ▼
JSON response: { answer, claims[], edges[] }
```

## Components

| Layer | Path | Responsibility |
| --- | --- | --- |
| API entry | [main.py](file:///C:/Users/hp/Documents/Trae/temp_20261028_01/truthlens/backend/app/main.py) | FastAPI app, CORS for the Vite dev server |
| Config | [config.py](file:///C:/Users/hp/Documents/Trae/temp_20261028_01/truthlens/backend/app/config.py) | Model names, weights, thresholds, paths (env-overridable) |
| Contract | [schemas.py](file:///C:/Users/hp/Documents/Trae/temp_20261028_01/truthlens/backend/app/models/schemas.py) | Pydantic request/response models |
| Route | [verify.py](file:///C:/Users/hp/Documents/Trae/temp_20261028_01/truthlens/backend/app/routes/verify.py) | `POST /api/verify` (currently a hardcoded stub) |
| Pipeline | `backend/app/pipeline/` | `claim_extractor.py`, `retriever.py`, `verifier.py`, `orchestrator.py` (not implemented yet) |
| Data | `backend/data/` | `raw/` FEVER download, `processed/evidence_corpus.jsonl`, `indexes/` FAISS + BM25 artifacts |

## Data layer (local, not in git)

- `evidence_corpus.jsonl` — cleaned FEVER evidence documents
- `faiss_index.bin` — MiniLM embeddings of the corpus
- `bm25_index.pkl` — keyword index over the same corpus

Models are downloaded once from HuggingFace and cached locally:

- `sentence-transformers/all-MiniLM-L6-v2` (embeddings)
- `cross-encoder/nli-deberta-v3-small` (NLI)

## Current status (Session 1)

Backend and frontend scaffolded end to end against the stub contract.
Claim extraction, indexes, NLI wiring, graph UI and evaluation are scheduled for later sessions.
