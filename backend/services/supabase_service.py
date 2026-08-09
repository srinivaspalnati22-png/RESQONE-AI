import math
import uuid
import datetime
import os
import csv
import requests
from typing import List, Dict, Any, Optional
from backend.core.config import settings
from backend.models.schemas import Hospital, BloodDonor, Volunteer, EmergencyReport, ActivityLog

# Standard Medical Blood Compatibility Rules (Donor -> Recipient)
BLOOD_COMPATIBILITY = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"]
}

# Standard Recipient -> Compatible Donors
RECIPIENT_DONOR_MAP = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
}

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class SupabaseService:
    """
    Data service layer with Supabase integration and robust CSV Kaggle dataset loader.
    Ensures seamless execution across Live Supabase and Real Kaggle Datasets.
    """

    _hospitals: List[Dict[str, Any]] = []
    _donors: List[Dict[str, Any]] = []
    _volunteers: List[Dict[str, Any]] = []
    _reports: List[Dict[str, Any]] = []
    _activity_logs: List[Dict[str, Any]] = []

    @classmethod
    def _load_kaggle_datasets(cls):
        """Loads real datasets directly from Supabase REST API with local CSV fallback."""
        supabase_url = settings.SUPABASE_URL.rstrip('/') + "/rest/v1/"
        headers = {
            "apikey": settings.SUPABASE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_KEY}"
        }

        # 1. Fetch Hospitals from Supabase API
        try:
            r = requests.get(supabase_url + "hospitals?select=*", headers=headers, timeout=4)
            if r.status_code == 200 and len(r.json()) > 0:
                cls._hospitals = r.json()
        except Exception as e:
            print(f"Supabase API fetch for hospitals failed: {e}")

        # Fallback to CSV if Supabase API is empty or unreachable
        if not cls._hospitals:
            hosp_csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "kaggle_hospital_icu_dataset.csv")
            if os.path.exists(hosp_csv_path):
                try:
                    with open(hosp_csv_path, 'r', encoding='utf-8') as f:
                        reader = csv.DictReader(f)
                        cls._hospitals = []
                        for row in reader:
                            cls._hospitals.append({
                                "id": row.get("hospital_id", f"hosp-{len(cls._hospitals)+1}"),
                                "name": row.get("name"),
                                "address": row.get("address"),
                                "phone": row.get("phone"),
                                "location_lat": float(row.get("lat", 16.5167)),
                                "location_lng": float(row.get("lng", 80.6500)),
                                "icu_available": int(row.get("icu_available", 10)),
                                "icu_capacity": int(row.get("icu_capacity", 25)),
                                "antivenom_stock": int(row.get("antivenom_stock", 50)),
                                "oxygen_status": row.get("oxygen_status", "HIGH"),
                                "blood_stock": {"O-": 12, "O+": 45, "A-": 8, "A+": 30, "B-": 6, "B+": 28, "AB-": 5, "AB+": 12},
                                "antivenom_available": int(row.get("antivenom_stock", 0)) > 0,
                                "trauma_center": True
                            })
                except Exception as e:
                    print(f"Error loading Kaggle hospital CSV: {e}")

        # 2. Fetch Blood Donors from Supabase API
        try:
            r = requests.get(supabase_url + "blood_donors?select=*", headers=headers, timeout=4)
            if r.status_code == 200 and len(r.json()) > 0:
                cls._donors = r.json()
        except Exception as e:
            print(f"Supabase API fetch for donors failed: {e}")
            cls._hospitals = [
                {
                    "id": "hosp-001",
                    "name": "Victoria Hospital (Govt Regional Trauma & Snakebite Venom Center)",
                    "address": "Fort Fort Road, Kalasipalya, Bangalore",
                    "phone": "+91-80-26701150",
                    "location_lat": 12.9620,
                    "location_lng": 77.5850,
                    "icu_available": 8,
                    "icu_capacity": 25,
                    "antivenom_stock": 140,
                    "oxygen_status": "HIGH",
                    "blood_stock": {"O-": 12, "O+": 45, "A-": 8, "A+": 30, "B-": 6, "B+": 28, "AB-": 5, "AB+": 12},
                    "antivenom_available": True,
                    "trauma_center": True
                }
            ]

        # 3. Fetch Volunteers from Supabase API
        try:
            r = requests.get(supabase_url + "volunteers?select=*", headers=headers, timeout=4)
            if r.status_code == 200 and len(r.json()) > 0:
                cls._volunteers = r.json()
        except Exception as e:
            print(f"Supabase API fetch for volunteers failed: {e}")

        # 4. Fetch Emergency Reports from Supabase API
        try:
            r = requests.get(supabase_url + "emergency_reports?select=*", headers=headers, timeout=4)
            if r.status_code == 200 and len(r.json()) > 0:
                cls._reports = r.json()
        except Exception as e:
            print(f"Supabase API fetch for emergency_reports failed: {e}")

        # 5. Fetch Activity Logs from Supabase API
        try:
            r = requests.get(supabase_url + "activity_log?select=*", headers=headers, timeout=4)
            if r.status_code == 200 and len(r.json()) > 0:
                cls._activity_logs = r.json()
        except Exception as e:
            print(f"Supabase API fetch for activity_log failed: {e}")

        # Seed initial sample emergency report
        if not cls._reports:
            cls._reports.append({
                "id": "rep-demo-1001",
                "reporter_id": "usr-demo-001",
                "type": "SNAKEBITE",
                "severity": "CRITICAL",
                "ai_confidence": 94.5,
                "ai_explanation": "Kaggle species match: Spectacled Cobra (Naja naja). High neurotoxic risk.",
                "status": "DISPATCHED",
                "location_lat": 12.9620,
                "location_lng": 77.5850,
                "address": "Kalasipalya Metro Interchange, Bangalore",
                "created_at": datetime.datetime.utcnow().isoformat(),
                "dispatch_details": {
                    "hospital_name": "Victoria Hospital (Govt Regional Trauma & Venom Center)",
                    "hospital_phone": "+91-80-26701150",
                    "eta_minutes": 5,
                    "ambulance_unit": "RESQONE-ALS-104",
                    "antivenom_reserved": True
                }
            })

    @classmethod
    def get_hospitals(cls, user_lat: Optional[float] = None, user_lng: Optional[float] = None, location_lat: Optional[float] = None, location_lng: Optional[float] = None, requires_icu: bool = False, require_icu: bool = False, requires_antivenom: bool = False, require_antivenom: bool = False, blood_type: Optional[str] = None) -> List[Hospital]:
        if not cls._hospitals:
            cls._load_kaggle_datasets()

        target_lat = user_lat if user_lat is not None else location_lat
        target_lng = user_lng if user_lng is not None else location_lng
        check_icu = requires_icu or require_icu
        check_avs = requires_antivenom or require_antivenom

        results = []
        for h in cls._hospitals:
            if check_icu and h["icu_available"] <= 0:
                continue
            if check_avs and not h["antivenom_available"]:
                continue

            dist = 0.0
            if target_lat is not None and target_lng is not None:
                dist = haversine_km(target_lat, target_lng, h["location_lat"], h["location_lng"])

            hospital_obj = Hospital(
                id=h["id"],
                name=h["name"],
                address=h["address"],
                phone=h["phone"],
                location_lat=h["location_lat"],
                location_lng=h["location_lng"],
                distance_km=dist,
                icu_available=h["icu_available"],
                icu_capacity=h["icu_capacity"],
                blood_stock=h["blood_stock"],
                antivenom_available=h["antivenom_available"],
                antivenom_stock=h.get("antivenom_stock", 50),
                oxygen_status=h.get("oxygen_status", "HIGH"),
                trauma_center=h["trauma_center"]
            )
            results.append(hospital_obj)

        if target_lat is not None and target_lng is not None:
            results.sort(key=lambda item: item.distance_km)

        return results

    @classmethod
    def match_blood_donors(cls, recipient_blood_group: str, user_lat: float = 12.9620, user_lng: float = 77.5850) -> List[BloodDonor]:
        if not cls._donors:
            cls._load_kaggle_datasets()

        allowed_donor_groups = RECIPIENT_DONOR_MAP.get(recipient_blood_group.upper(), [recipient_blood_group])
        matched = []

        for d in cls._donors:
            if d["blood_group"] in allowed_donor_groups and d["availability"]:
                dist = haversine_km(user_lat, user_lng, d.get("location_lat", 12.9620), d.get("location_lng", 77.5850)) if "location_lat" in d else d.get("distance_km", 2.0)
                
                # Base score: 100 for exact match, 88 for compatible universal
                compat_score = 100.0 if d["blood_group"] == recipient_blood_group else 88.0
                compat_score = max(50.0, compat_score - (dist * 2))

                donor_obj = BloodDonor(
                    id=d["id"],
                    profile_id=d.get("profile_id", f"prof-{d['id']}"),
                    name=d["name"],
                    blood_group=d["blood_group"],
                    phone=d["phone"],
                    location_lat=d.get("location_lat", 12.9620),
                    location_lng=d.get("location_lng", 77.5850),
                    availability=d["availability"],
                    distance_km=dist,
                    compatibility_score=round(compat_score, 1),
                    last_donation_date=d.get("last_donation_date")
                )
                matched.append(donor_obj)

        matched.sort(key=lambda x: (-x.compatibility_score, x.distance_km))
        return matched

    @classmethod
    def get_volunteers(cls) -> List[Volunteer]:
        if not cls._volunteers:
            cls._load_kaggle_datasets()
        return [Volunteer(**v) for v in cls._volunteers]

    @classmethod
    def create_emergency_report(cls, report_data: Dict[str, Any]) -> EmergencyReport:
        if not cls._reports:
            cls._load_kaggle_datasets()

        report_id = f"rep-{uuid.uuid4().hex[:8]}"
        created_at = datetime.datetime.utcnow().isoformat()

        report = EmergencyReport(
            id=report_id,
            reporter_id=report_data.get("reporter_id", "anonymous"),
            type=report_data.get("type", "UNKNOWN"),
            severity=report_data.get("severity", "MEDIUM"),
            ai_confidence=report_data.get("ai_confidence", 85.0),
            ai_explanation=report_data.get("ai_explanation", "AI triaged via NLP matching."),
            status="DISPATCHED",
            location_lat=report_data.get("location_lat", 12.9620),
            location_lng=report_data.get("location_lng", 77.5850),
            address=report_data.get("address", "Bangalore Emergency Grid"),
            created_at=created_at,
            dispatch_details={
                "hospital_name": "Victoria Hospital (Govt Regional Trauma & Venom Center)",
                "hospital_phone": "+91-80-26701150",
                "eta_minutes": 5,
                "ambulance_unit": "RESQONE-ALS-104",
                "antivenom_reserved": True
            }
        )

        cls._reports.insert(0, report.dict())
        return report

    @classmethod
    def get_emergency_reports(cls) -> List[EmergencyReport]:
        if not cls._reports:
            cls._load_kaggle_datasets()
        return [EmergencyReport(**r) for r in cls._reports]

    @classmethod
    def get_activity_logs(cls) -> List[ActivityLog]:
        if not cls._activity_logs:
            cls._load_kaggle_datasets()
        return [ActivityLog(**a) for a in cls._activity_logs]
