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


# --- MindFlow / DayForge: brain-dump -> structured task extraction ---

TaskType = Literal["DEADLINE", "APPOINTMENT", "TASK"]
Priority = Literal["HIGH", "MEDIUM", "LOW"]
DayIntensity = Literal["HECTIC", "BUSY", "NORMAL", "LIGHT"]


class TaskItem(BaseModel):
    id: str
    task: str
    datetime: str  
    type: TaskType
    priority: Priority
    date_display: Optional[str] = None
    time_display: Optional[str] = None
    is_ambiguous: Optional[bool] = False


class DaySummary(BaseModel):
    intensity: DayIntensity
    score: int
    high_priority_count: int
    deadline_count: int
    appointment_count: int
    total_tasks: int
    message: str


class ParseRequest(BaseModel):
    text: str
    reference_date: Optional[str] = None


class ParseResponse(BaseModel):
    raw_text: str
    total_tasks: int
    tasks: List[TaskItem]
    day_summary: DaySummary
