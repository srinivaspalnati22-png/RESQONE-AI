from fastapi import APIRouter, Query
from typing import List, Optional
from backend.models.schemas import Hospital
from backend.services.supabase_service import SupabaseService

router = APIRouter(prefix="/api/hospitals", tags=["Hospital Intelligence"])

@router.get("/nearest", response_model=List[Hospital])
def get_nearest_hospitals(
    lat: float = Query(12.9716, description="User latitude"),
    lng: float = Query(77.5946, description="User longitude"),
    require_antivenom: bool = Query(False, description="Filter for hospitals with antivenom stock"),
    require_icu: bool = Query(False, description="Filter for hospitals with available ICU beds"),
    blood_type: Optional[str] = Query(None, description="Filter for hospitals with specific blood stock")
):
    """
    Hospital Intelligence Endpoint:
    Queries nearest emergency hospitals, filtering by real-time ICU beds, antivenom stock, and blood reserves.
    """
    return SupabaseService.get_hospitals(
        user_lat=lat,
        user_lng=lng,
        require_antivenom=require_antivenom,
        require_icu=require_icu,
        blood_type=blood_type
    )
