# TruthLens — API Contract

Base URL (dev): `http://localhost:8001`

## `GET /`

Health check.

```json
{ "status": "ok", "service": "TruthLens" }
```

## `POST /api/verify`

Verify an answer. Implemented as a stub in Session 1 (returns a fixed response echoing
`answer`); later sessions replace the body with the real NLP pipeline.

### Request

```json
{ "answer": "U-Net was introduced in 2015. It was originally developed for glacier segmentation." }
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `answer` | string | yes | Free text to verify |

### Response

```json
{
  "answer": "U-Net was introduced in 2015.",
  "claims": [
    {
      "id": "c1",
      "text": "U-Net was introduced in 2015",
      "verdict": "SUPPORTED",
      "confidence": 0.93,
      "evidence": [
        {
          "id": "e1",
          "text": "Ronneberger et al. introduced U-Net at MICCAI 2015.",
          "source": "wiki_unet.txt",
          "retrieval_score": 0.88,
          "nli_score": 0.93
        }
      ]
    }
  ],
  "edges": [
    { "from_node": "answer", "to_node": "c1" },
    { "from_node": "c1", "to_node": "e1" }
  ]
}
```

### Field reference

| Field | Type | Notes |
| --- | --- | --- |
| `answer` | string | Echo of the request |
| `claims[].id` | string | Stable node id, e.g. `c1` |
| `claims[].text` | string | Atomic claim extracted from the answer |
| `claims[].verdict` | `SUPPORTED` \| `CONTRADICTED` \| `INSUFFICIENT_EVIDENCE` | Decision layer output |
| `claims[].confidence` | float 0–1 | Aggregated NLI confidence |
| `claims[].evidence[].retrieval_score` | float 0–1 | Fused BM25 + semantic score |
| `claims[].evidence[].nli_score` | float 0–1 | NLI score for this (claim, evidence) pair |
| `edges[].from_node` / `to_node` | string | Graph edges: `answer` → claim → evidence ids |

### Graph node ids

- The answer is the single root node `answer`.
- Claims are `c1`, `c2`, … and link to the root.
- Evidence items are `e1`, `e2`, … and link to the claim(s) they were retrieved for.
