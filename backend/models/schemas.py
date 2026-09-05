from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class Profile(BaseModel):
    id: Optional[str] = None
    name: str
    phone: str
    blood_group: str
    role: str = "user"  # user, donor, volunteer, hospital
    location_lat: Optional[float] = 16.5167
    location_lng: Optional[float] = 80.6500
    created_at: Optional[str] = None

class EmergencyReportRequest(BaseModel):
    reporter_id: Optional[str] = "demo-user-001"
    text_input: Optional[str] = ""
    voice_transcript: Optional[str] = ""
    location_lat: Optional[float] = 16.5167
    location_lng: Optional[float] = 80.6500
    address: Optional[str] = "Vijayawada Krishna Zone"
    media_url: Optional[str] = None

class AIExplainability(BaseModel):
    emergency_type: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    severity_level: int  # 1 to 4
    ai_confidence: float  # 0.0 to 100.0
    key_factors: List[str]
    ai_explanation: str
    recommended_action: str
    uncertainty_flag: bool = False
    dispatch_recommendation: Dict[str, Any]

class EmergencyReport(BaseModel):
    id: str
    reporter_id: str
    type: str
    severity: str
    ai_confidence: float
    ai_explanation: str
    status: str = "DISPATCHED"
    location_lat: float
    location_lng: float
    address: str
    created_at: str
    dispatch_details: Optional[Dict[str, Any]] = None

class Hospital(BaseModel):
    id: str
    name: str
    address: str
    phone: str
    location_lat: float
    location_lng: float
    icu_available: int
    blood_stock: Dict[str, int]
    antivenom_available: bool
    distance_km: Optional[float] = None
    trauma_center: Optional[bool] = True

class BloodDonor(BaseModel):
    id: str
    profile_id: str
    name: str
    phone: str
    blood_group: str
    last_donation_date: str
    availability: bool
    location_lat: float
    location_lng: float
    distance_km: Optional[float] = None
    compatibility_score: Optional[float] = None

class Volunteer(BaseModel):
    id: str
    profile_id: str
    name: str
    phone: str
    trust_score: float = 95.0
    response_rate: float = 98.0
    status: str = "AVAILABLE"
    skills: List[str] = []
    location_lat: float = 16.5167
    location_lng: float = 80.6500
    distance_km: Optional[float] = 0.0

class SnakebiteIdentifyRequest(BaseModel):
    description: Optional[str] = ""
    location_lat: Optional[float] = 16.5167
    location_lng: Optional[float] = 80.6500

class SnakebiteResult(BaseModel):
    species_name: str
    scientific_name: str
    venom_risk: str  # HIGHLY VENOMOUS, MODERATELY VENOMOUS, NON-VENOMOUS
    key_features: List[str]
    first_aid_steps: List[str]
    antivenom_needed: bool
    confidence: float
    explanation: str
    matched_hospitals: List[Hospital]

class ActivityLog(BaseModel):
    id: str
    event_type: Optional[str] = "LOG"
    description: Optional[str] = ""
    severity: Optional[str] = "MEDIUM"
    user_id: Optional[str] = "system"
    action: Optional[str] = "TELEMETRY"
    metadata: Optional[Dict[str, Any]] = {}
    created_at: Optional[str] = None

class FamilyContactItem(BaseModel):
    id: Optional[str] = None
    name: str
    phone: str
    relation: Optional[str] = "Family"
    notify_on_sos: Optional[bool] = True

class FamilyNotificationRequest(BaseModel):
    victim_name: Optional[str] = "Emergency Citizen"
    blood_group: Optional[str] = "O+"
    location_lat: Optional[float] = 16.5167
    location_lng: Optional[float] = 80.6500
    address: Optional[str] = "Vijayawada Highway Corridor"
    tracking_url: Optional[str] = None
    emergency_type: Optional[str] = "CRITICAL_SOS"
    contacts: List[FamilyContactItem]

class FamilyDispatchRecipientResult(BaseModel):
    name: str
    phone: str
    relation: str
    sms_status: str
    whatsapp_status: str
    timestamp: str

class FamilyNotificationResponse(BaseModel):
    success: bool
    total_contacts: int
    sms_sent_count: int
    whatsapp_sent_count: int
    gateway_used: str
    recipients: List[FamilyDispatchRecipientResult]
    message_preview: str

class DeviceSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class DeviceSubscriptionRequest(BaseModel):
    endpoint: str
    keys: DeviceSubscriptionKeys
    device_id: Optional[str] = None
    user_id: Optional[str] = "anonymous"
    user_name: Optional[str] = "Community Member"
    platform: Optional[str] = "web-pwa"
    timestamp: Optional[str] = None

class BroadcastPushRequest(BaseModel):
    alert_id: Optional[str] = None
    category: Optional[str] = "ACCIDENT"  # 'ACCIDENT' | 'BLOOD_URGENT' | 'SNAKEBITE' | 'SOS_BEACON'
    victim_name: Optional[str] = "Emergency Citizen"
    victim_phone: Optional[str] = "+91 94401 23401"
    victim_user_id: Optional[str] = None
    sender_device_id: Optional[str] = None
    sender_endpoint: Optional[str] = None
    blood_group: Optional[str] = "O+"
    location_name: Optional[str] = "Vijayawada Highway Corridor"
    lat: Optional[float] = 16.5167
    lng: Optional[float] = 80.6500
    severity: Optional[str] = "CRITICAL_HIGH_IMPACT"
    impact_g: Optional[float] = 4.85
    speed_at_impact: Optional[float] = 76.0
    medical_notes: Optional[str] = "Emergency reported. CAD 108 units dispatched."
    species: Optional[str] = None
    hospital_name: Optional[str] = None
    units_needed: Optional[int] = 2
    tracking_url: Optional[str] = None

class BroadcastPushResponse(BaseModel):
    success: bool
    total_devices: int
    sent_count: int
    failed_count: int
    alert_id: str
    timestamp: str


