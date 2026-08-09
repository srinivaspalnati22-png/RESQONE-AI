from fastapi import APIRouter, HTTPException
from backend.models.schemas import SnakebiteIdentifyRequest, SnakebiteResult
from backend.services.ai_service import AIService
from backend.services.supabase_service import SupabaseService

router = APIRouter(prefix="/api/snakebite", tags=["Snakebite Emergency"])

@router.post("/identify", response_model=SnakebiteResult)
def identify_snakebite(req: SnakebiteIdentifyRequest):
    """
    Snakebite AI Emergency Endpoint:
    Identifies species from text/visual description, assesses venom toxicity, provides first aid,
    and returns matched hospitals with active Polyvalent Antivenom Serum (AVS) stock.
    """
    try:
        res = AIService.identify_snake_species(req.description or "")
        matched_hospitals = SupabaseService.get_hospitals(
            user_lat=req.location_lat or 12.9716,
            user_lng=req.location_lng or 77.5946,
            require_antivenom=True
        )
        res.matched_hospitals = matched_hospitals
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Snakebite processing error: {str(e)}")
