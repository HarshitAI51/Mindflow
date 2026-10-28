from fastapi import APIRouter
from app.models.schemas import VerifyRequest, VerifyResponse, Claim, Evidence, Edge

router = APIRouter(prefix="/api", tags=["verify"])


@router.post("/verify", response_model=VerifyResponse)
def verify(req: VerifyRequest):
    # STUB: returns hardcoded response so frontend can be built in parallel
    return VerifyResponse(
        answer=req.answer,
        claims=[
            Claim(
                id="c1",
                text="U-Net was introduced in 2015",
                verdict="SUPPORTED",
                confidence=0.93,
                evidence=[
                    Evidence(
                        id="e1",
                        text="Ronneberger et al. introduced U-Net at MICCAI 2015.",
                        source="wiki_unet.txt",
                        retrieval_score=0.88,
                        nli_score=0.93,
                    )
                ],
            ),
            Claim(
                id="c2",
                text="It was originally developed for glacier segmentation",
                verdict="CONTRADICTED",
                confidence=0.87,
                evidence=[
                    Evidence(
                        id="e2",
                        text="U-Net was proposed for biomedical image segmentation.",
                        source="wiki_unet.txt",
                        retrieval_score=0.82,
                        nli_score=0.87,
                    )
                ],
            ),
        ],
        edges=[
            Edge(from_node="answer", to_node="c1"),
            Edge(from_node="answer", to_node="c2"),
            Edge(from_node="c1", to_node="e1"),
            Edge(from_node="c2", to_node="e2"),
        ],
    )
