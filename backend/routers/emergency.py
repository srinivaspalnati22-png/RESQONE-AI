from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.schemas import EmergencyReportRequest, AIExplainability, EmergencyReport
from backend.services.ai_service import AIService
from backend.services.supabase_service import SupabaseService

router = APIRouter(prefix="/api/emergency", tags=["Emergency Copilot"])

@router.post("/classify", response_model=AIExplainability)
def classify_emergency(req: EmergencyReportRequest):
    """
    Flagship AI Copilot Endpoint:
    Classifies emergency input (text/voice), scores severity, synthesizes transparent explainability,
    and checks for low confidence to trigger human escalation.
    """
    try:
        explanation = AIService.classify_emergency(
            text=req.text_input or "",
            voice_transcript=req.voice_transcript or ""
        )
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Classification Error: {str(e)}")

@router.post("/report", response_model=EmergencyReport)
def create_emergency_report(req: EmergencyReportRequest):
    """
    Submits emergency report, executes AI classification, pairs with nearest hospital, and dispatches rescue.
    """
    try:
        ai_res = AIService.classify_emergency(
            text=req.text_input or "",
            voice_transcript=req.voice_transcript or ""
        )

        report_payload = {
            "reporter_id": req.reporter_id or "demo-user-001",
            "type": ai_res.emergency_type,
            "severity": ai_res.severity,
            "ai_confidence": ai_res.ai_confidence,
            "ai_explanation": ai_res.ai_explanation,
            "location_lat": req.location_lat or 12.9716,
            "location_lng": req.location_lng or 77.5946,
            "address": req.address or "Bangalore Central Metro Zone"
        }

        report = SupabaseService.create_emergency_report(report_payload)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create emergency report: {str(e)}")

@router.get("/reports", response_model=List[EmergencyReport])
def get_emergency_reports():
    """
    Retrieves all active emergency mission reports.
    """
    return SupabaseService.get_emergency_reports()
