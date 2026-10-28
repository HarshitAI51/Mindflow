from pydantic import BaseModel
from typing import List, Literal, Optional

Verdict = Literal["SUPPORTED", "CONTRADICTED", "INSUFFICIENT_EVIDENCE"]


class VerifyRequest(BaseModel):
    answer: str


class Evidence(BaseModel):
    id: str
    text: str
    source: str
    retrieval_score: float
    nli_score: float


class Claim(BaseModel):
    id: str
    text: str
    verdict: Verdict
    confidence: float
    evidence: List[Evidence]


class Edge(BaseModel):
    from_node: str
    to_node: str


class VerifyResponse(BaseModel):
    answer: str
    claims: List[Claim]
    edges: List[Edge]
