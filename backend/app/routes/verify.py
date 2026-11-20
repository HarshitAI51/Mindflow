from fastapi import APIRouter, HTTPException
from app.models.schemas import VerifyRequest, VerifyResponse

router = APIRouter(prefix="/api", tags=["verify"])

# Lazy-load orchestrator so startup is instantaneous
_orch = None


def get_orchestrator():
    global _orch
    if _orch is None:
        from app.pipeline.orchestrator import TruthLensOrchestrator
        _orch = TruthLensOrchestrator()
    return _orch


@router.post("/verify", response_model=VerifyResponse)
def verify(req: VerifyRequest):
    try:
        orch = get_orchestrator()
        return orch.verify_text(req.answer)
    except Exception as e:
        print(f"Error during verification: {e}")
        raise HTTPException(status_code=500, detail=str(e))
