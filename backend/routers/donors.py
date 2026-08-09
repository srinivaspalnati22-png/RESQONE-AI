from fastapi import APIRouter, Query, HTTPException
from typing import List
from backend.models.schemas import BloodDonor
from backend.services.supabase_service import SupabaseService

router = APIRouter(prefix="/api/donors", tags=["Blood Donor Finder"])

@router.get("/match", response_model=List[BloodDonor])
def match_blood_donors(
    blood_group: str = Query("O-", description="Recipient blood group (e.g. O-, A+, B+)"),
    lat: float = Query(12.9716, description="User latitude"),
    lng: float = Query(77.5946, description="User longitude")
):
    """
    Smart Blood Donor Ranking Endpoint:
    Matches active blood donors using medical ABO/Rh compatibility rules and GPS proximity ranking.
    """
    try:
        return SupabaseService.match_blood_donors(
            recipient_blood_group=blood_group,
            user_lat=lat,
            user_lng=lng
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Donor matching error: {str(e)}")
