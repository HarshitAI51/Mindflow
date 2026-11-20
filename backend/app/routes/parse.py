import datetime
from fastapi import APIRouter
from app.models.schemas import ParseRequest, ParseResponse, TaskItem, DaySummary
from app.pipeline.extractor import DayForgeExtractor

router = APIRouter(prefix="/api", tags=["parse"])
extractor = DayForgeExtractor()


@router.post("/parse", response_model=ParseResponse)
def parse_dump(req: ParseRequest):
    ref_date = req.reference_date or datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    parsed_tasks = extractor.parse_braindump(req.text, ref_date_str=ref_date)
    summary = extractor.build_day_summary(parsed_tasks)

    return ParseResponse(
        raw_text=req.text,
        total_tasks=len(parsed_tasks),
        tasks=[TaskItem(**t) for t in parsed_tasks],
        day_summary=DaySummary(**summary),
    )
