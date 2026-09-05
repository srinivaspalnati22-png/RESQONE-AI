from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.schemas import (
    EmergencyReportRequest,
    AIExplainability,
    EmergencyReport,
    FamilyNotificationRequest,
    FamilyNotificationResponse
)
from backend.services.ai_service import AIService
from backend.services.supabase_service import SupabaseService
from backend.services.notification_service import NotificationService

router = APIRouter(prefix="/api/emergency", tags=["Emergency Copilot"])

@router.post("/notify-family", response_model=FamilyNotificationResponse)
def notify_family_emergency(req: FamilyNotificationRequest):
    """
    Automated Zero-Touch Family Dispatch Endpoint:
    Automatically transmits emergency SMS and WhatsApp notifications to all 5
    registered family members without requiring manual user touch.
    Pairs with Twilio and Fast2SMS with automated failover and simulation audit.
    """
    try:
        contacts_data = [c.dict() for c in req.contacts]
        result = NotificationService.dispatch_family_emergency(
            victim_name=req.victim_name or "Emergency Citizen",
            blood_group=req.blood_group or "O+",
            address=req.address or "Vijayawada Highway Corridor",
            lat=req.location_lat or 16.5167,
            lng=req.location_lng or 80.6500,
            contacts=contacts_data,
            tracking_url=req.tracking_url
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Family dispatch error: {str(e)}")

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
