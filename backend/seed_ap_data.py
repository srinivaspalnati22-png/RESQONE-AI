import os
import requests
import json
import datetime
import uuid

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wxucgspsyekiwbxjjrnw.supabase.co/rest/v1/")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "YOUR_SUPABASE_SERVICE_KEY")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

# ==============================================================================
# 1. REAL ANDHRA PRADESH HOSPITALS DATASET (AP Open Data & NHP Directory)
# ==============================================================================
AP_HOSPITALS = [
    {
        "id": "hosp-ap-001",
        "name": "King George Hospital (KGH Govt Regional Trauma & Venom Center)",
        "address": "Maharanipeta, Visakhapatnam, Andhra Pradesh 530002",
        "phone": "+91-891-2564891",
        "location_lat": 17.7089,
        "location_lng": 83.3032,
        "icu_available": 14,
        "icu_capacity": 45,
        "antivenom_stock": 180,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 18, "O+": 60, "A-": 10, "A+": 40, "B-": 8, "B+": 35, "AB-": 6, "AB+": 15},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-002",
        "name": "Government General Hospital (GGH Vijayawada)",
        "address": "NH-16, Gunadala, Vijayawada, Andhra Pradesh 520004",
        "phone": "+91-866-2472777",
        "location_lat": 16.5167,
        "location_lng": 80.6500,
        "icu_available": 12,
        "icu_capacity": 40,
        "antivenom_stock": 150,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 14, "O+": 50, "A-": 8, "A+": 35, "B-": 6, "B+": 30, "AB-": 4, "AB+": 10},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-003",
        "name": "SVRR Government General Hospital (Ruia Hospital Tirupati)",
        "address": "Alipiri Road, Tirupati, Andhra Pradesh 517507",
        "phone": "+91-877-2287777",
        "location_lat": 13.6369,
        "location_lng": 79.4140,
        "icu_available": 16,
        "icu_capacity": 50,
        "antivenom_stock": 200,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 20, "O+": 70, "A-": 12, "A+": 45, "B-": 10, "B+": 40, "AB-": 8, "AB+": 18},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-004",
        "name": "Government General Hospital (GGH Guntur)",
        "address": "Collectorate Road, Guntur, Andhra Pradesh 522001",
        "phone": "+91-863-2234000",
        "location_lat": 16.3067,
        "location_lng": 80.4365,
        "icu_available": 10,
        "icu_capacity": 35,
        "antivenom_stock": 120,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 10, "O+": 40, "A-": 6, "A+": 30, "B-": 5, "B+": 25, "AB-": 4, "AB+": 8},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-005",
        "name": "Government General Hospital (GGH Kurnool)",
        "address": "Budhawarpet, Kurnool, Andhra Pradesh 518002",
        "phone": "+91-8518-255300",
        "location_lat": 15.8281,
        "location_lng": 78.0373,
        "icu_available": 9,
        "icu_capacity": 30,
        "antivenom_stock": 110,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 8, "O+": 35, "A-": 5, "A+": 25, "B-": 4, "B+": 20, "AB-": 3, "AB+": 6},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-006",
        "name": "Government General Hospital (GGH Kakinada)",
        "address": "Main Road, Kakinada, Andhra Pradesh 533001",
        "phone": "+91-884-2376100",
        "location_lat": 16.9891,
        "location_lng": 82.2475,
        "icu_available": 8,
        "icu_capacity": 25,
        "antivenom_stock": 95,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 6, "O+": 30, "A-": 4, "A+": 20, "B-": 3, "B+": 18, "AB-": 2, "AB+": 5},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-007",
        "name": "Government General Hospital (GGH Nellore / ACSR Medical College)",
        "address": "Dargamitta, Nellore, Andhra Pradesh 524004",
        "phone": "+91-861-2327000",
        "location_lat": 14.4426,
        "location_lng": 79.9865,
        "icu_available": 7,
        "icu_capacity": 22,
        "antivenom_stock": 80,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 5, "O+": 25, "A-": 3, "A+": 18, "B-": 3, "B+": 15, "AB-": 2, "AB+": 4},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-008",
        "name": "Government General Hospital (GGH Anantapur)",
        "address": "Rahamat Nagar, Anantapur, Andhra Pradesh 515001",
        "phone": "+91-8554-274000",
        "location_lat": 14.6819,
        "location_lng": 77.6006,
        "icu_available": 6,
        "icu_capacity": 20,
        "antivenom_stock": 70,
        "oxygen_status": "MEDIUM",
        "blood_stock": {"O-": 4, "O+": 20, "A-": 2, "A+": 15, "B-": 2, "B+": 12, "AB-": 1, "AB+": 3},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-009",
        "name": "Rajahmundry Government District Headquarters Hospital",
        "address": "Danavaipeta, Rajamahendravaram, Andhra Pradesh 533103",
        "phone": "+91-883-2478500",
        "location_lat": 17.0005,
        "location_lng": 81.7800,
        "icu_available": 5,
        "icu_capacity": 18,
        "antivenom_stock": 65,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 4, "O+": 18, "A-": 2, "A+": 12, "B-": 2, "B+": 10, "AB-": 1, "AB+": 3},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-010",
        "name": "Eluru Government District Hospital",
        "address": "Sanivarapupeta, Eluru, Andhra Pradesh 534006",
        "phone": "+91-8812-230400",
        "location_lat": 16.7107,
        "location_lng": 81.0952,
        "icu_available": 4,
        "icu_capacity": 15,
        "antivenom_stock": 50,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 3, "O+": 15, "A-": 2, "A+": 10, "B-": 1, "B+": 8, "AB-": 1, "AB+": 2},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-011",
        "name": "AIIMS Mangalagiri (All India Institute of Medical Sciences)",
        "address": "Mangalagiri, Guntur District, Andhra Pradesh 522503",
        "phone": "+91-863-2346000",
        "location_lat": 16.4385,
        "location_lng": 80.5562,
        "icu_available": 18,
        "icu_capacity": 60,
        "antivenom_stock": 160,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 15, "O+": 55, "A-": 10, "A+": 40, "B-": 8, "B+": 35, "AB-": 5, "AB+": 14},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-012",
        "name": "Apollo Hospitals Health City Arilova",
        "address": "Health City, Arilova, Visakhapatnam, Andhra Pradesh 530040",
        "phone": "+91-891-2867777",
        "location_lat": 17.7667,
        "location_lng": 83.3333,
        "icu_available": 11,
        "icu_capacity": 35,
        "antivenom_stock": 45,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 8, "O+": 30, "A-": 5, "A+": 22, "B-": 4, "B+": 18, "AB-": 3, "AB+": 7},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-013",
        "name": "Ramesh Hospitals Vijayawada",
        "address": "Ring Road, Vijayawada, Andhra Pradesh 520008",
        "phone": "+91-866-2488888",
        "location_lat": 16.5083,
        "location_lng": 80.6417,
        "icu_available": 15,
        "icu_capacity": 42,
        "antivenom_stock": 35,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 10, "O+": 35, "A-": 6, "A+": 25, "B-": 5, "B+": 20, "AB-": 3, "AB+": 8},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-014",
        "name": "Sri Venkateswara Institute of Medical Sciences (SVIMS Tirupati)",
        "address": "Alipiri Road, Tirupati, Andhra Pradesh 517507",
        "phone": "+91-877-2287777",
        "location_lat": 13.6350,
        "location_lng": 79.4120,
        "icu_available": 20,
        "icu_capacity": 70,
        "antivenom_stock": 210,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 22, "O+": 80, "A-": 15, "A+": 50, "B-": 12, "B+": 45, "AB-": 8, "AB+": 20},
        "antivenom_available": True,
        "trauma_center": True
    },
    {
        "id": "hosp-ap-015",
        "name": "Manipal Hospital Vijayawada",
        "address": "Katuru Road, Tadepalli, Guntur/Vijayawada, Andhra Pradesh 522501",
        "phone": "+91-866-2224444",
        "location_lat": 16.4833,
        "location_lng": 80.6000,
        "icu_available": 9,
        "icu_capacity": 28,
        "antivenom_stock": 40,
        "oxygen_status": "HIGH",
        "blood_stock": {"O-": 6, "O+": 24, "A-": 4, "A+": 18, "B-": 3, "B+": 15, "AB-": 2, "AB+": 5},
        "antivenom_available": True,
        "trauma_center": True
    }
]

# ==============================================================================
# 2. SYNTHETIC BLOOD DONORS (Layered onto Real AP e-RaktKosh Blood Bank Locations)
# ==============================================================================
AP_SYNTHETIC_DONORS = [
    {"id": "dnr-ap-101", "profile_id": "prof-ap-101", "name": "K. Venkata Ramana", "blood_group": "O-", "phone": "+91-9440123401", "location_lat": 17.7089, "location_lng": 83.3032, "availability": True, "distance_km": 1.1, "compatibility_score": 100.0, "last_donation_date": "2026-05-12"},
    {"id": "dnr-ap-102", "profile_id": "prof-ap-102", "name": "S. Srinivas Rao", "blood_group": "O-", "phone": "+91-9440123402", "location_lat": 16.5167, "location_lng": 80.6500, "availability": True, "distance_km": 2.3, "compatibility_score": 96.0, "last_donation_date": "2026-05-01"},
    {"id": "dnr-ap-103", "profile_id": "prof-ap-103", "name": "P. Lakshmi Narayana", "blood_group": "O+", "phone": "+91-9440123403", "location_lat": 13.6369, "location_lng": 79.4140, "availability": True, "distance_km": 1.5, "compatibility_score": 90.0, "last_donation_date": "2026-06-10"},
    {"id": "dnr-ap-104", "profile_id": "prof-ap-104", "name": "M. Ramesh Babu", "blood_group": "A+", "phone": "+91-9440123404", "location_lat": 16.3067, "location_lng": 80.4365, "availability": True, "distance_km": 3.1, "compatibility_score": 85.0, "last_donation_date": "2026-04-18"},
    {"id": "dnr-ap-105", "profile_id": "prof-ap-105", "name": "Ch. Nageswara Rao", "blood_group": "B+", "phone": "+91-9440123405", "location_lat": 15.8281, "location_lng": 78.0373, "availability": True, "distance_km": 2.8, "compatibility_score": 82.0, "last_donation_date": "2026-06-25"},
    {"id": "dnr-ap-106", "profile_id": "prof-ap-106", "name": "T. Bhavani Prasad", "blood_group": "A-", "phone": "+91-9440123406", "location_lat": 16.9891, "location_lng": 82.2475, "availability": True, "distance_km": 1.8, "compatibility_score": 92.0, "last_donation_date": "2026-05-20"},
    {"id": "dnr-ap-107", "profile_id": "prof-ap-107", "name": "G. Satyanarayana", "blood_group": "B-", "phone": "+91-9440123407", "location_lat": 14.4426, "location_lng": 79.9865, "availability": True, "distance_km": 4.2, "compatibility_score": 80.0, "last_donation_date": "2026-06-02"},
    {"id": "dnr-ap-108", "profile_id": "prof-ap-108", "name": "V. Sreekanth Reddy", "blood_group": "AB+", "phone": "+91-9440123408", "location_lat": 14.6819, "location_lng": 77.6006, "availability": True, "distance_km": 5.0, "compatibility_score": 75.0, "last_donation_date": "2026-03-30"},
    {"id": "dnr-ap-109", "profile_id": "prof-ap-109", "name": "D. Anjaneyulu", "blood_group": "O-", "phone": "+91-9440123409", "location_lat": 17.0005, "location_lng": 81.7800, "availability": True, "distance_km": 2.1, "compatibility_score": 98.0, "last_donation_date": "2026-05-15"},
    {"id": "dnr-ap-110", "profile_id": "prof-ap-110", "name": "B. Siva Kumar", "blood_group": "AB-", "phone": "+91-9440123410", "location_lat": 16.7107, "location_lng": 81.0952, "availability": True, "distance_km": 3.6, "compatibility_score": 84.0, "last_donation_date": "2026-04-10"}
]

# ==============================================================================
# 3. SYNTHETIC AP CERTIFIED VOLUNTEERS
# ==============================================================================
AP_VOLUNTEERS = [
    {
        "id": "vol-ap-001",
        "profile_id": "prof-ap-vol-1",
        "name": "K. Rajesh Varma (Visakhapatnam Search & Rescue)",
        "phone": "+91-9848011101",
        "skills": ["CPR Certified", "First Responder", "High-Altitude Rescue"],
        "location_lat": 17.7089,
        "location_lng": 83.3032,
        "distance_km": 0.8,
        "trust_score": 99.0,
        "is_active": True
    },
    {
        "id": "vol-ap-002",
        "profile_id": "prof-ap-vol-2",
        "name": "V. Sai Kumar (Vijayawada Flood Rescue Specialist)",
        "phone": "+91-9848011102",
        "skills": ["BLS Certified", "Flood Rescue", "Watercraft Operator"],
        "location_lat": 16.5167,
        "location_lng": 80.6500,
        "distance_km": 1.4,
        "trust_score": 97.5,
        "is_active": True
    },
    {
        "id": "vol-ap-003",
        "profile_id": "prof-ap-vol-3",
        "name": "Dr. P. Swathi (Tirupati Emergency Trauma Volunteer)",
        "phone": "+91-9848011103",
        "skills": ["Triage Specialist", "BLS Certified", "Mass Casualty Management"],
        "location_lat": 13.6369,
        "location_lng": 79.4140,
        "distance_km": 0.5,
        "trust_score": 99.5,
        "is_active": True
    }
]

# ==============================================================================
# 4. SAMPLE EMERGENCY INCIDENT REPORTS (Demographically & Geographically AP)
# ==============================================================================
AP_EMERGENCY_REPORTS = [
    {
        "id": "rep-ap-2001",
        "reporter_id": "usr-ap-demo-1",
        "type": "SNAKEBITE",
        "severity": "CRITICAL",
        "ai_confidence": 96.5,
        "ai_explanation": "Kaggle species match: Spectacled Cobra (Naja naja). Patient exhibits swelling & dizziness near Krishna River bank, Vijayawada.",
        "status": "DISPATCHED",
        "location_lat": 16.5167,
        "location_lng": 80.6500,
        "address": "Prakasam Barrage, Krishna River, Vijayawada, Andhra Pradesh",
        "created_at": datetime.datetime.utcnow().isoformat(),
        "dispatch_details": {
            "hospital_name": "Government General Hospital (GGH Vijayawada)",
            "hospital_phone": "+91-866-2472777",
            "eta_minutes": 4,
            "ambulance_unit": "RESQONE-AP-ALS-101",
            "antivenom_reserved": True
        }
    },
    {
        "id": "rep-ap-2002",
        "reporter_id": "usr-ap-demo-2",
        "type": "ACCIDENT_RESCUE",
        "severity": "CRITICAL",
        "ai_confidence": 98.0,
        "ai_explanation": "Severe 2-vehicle collision on NH-16 highway near Visakhapatnam steel plant bypass with trapped passenger.",
        "status": "DISPATCHED",
        "location_lat": 17.7089,
        "location_lng": 83.3032,
        "address": "NH-16 Gajuwaka Bypass, Visakhapatnam, Andhra Pradesh",
        "created_at": datetime.datetime.utcnow().isoformat(),
        "dispatch_details": {
            "hospital_name": "King George Hospital (KGH Govt Regional Trauma & Venom Center)",
            "hospital_phone": "+91-891-2564891",
            "eta_minutes": 6,
            "ambulance_unit": "RESQONE-AP-ALS-102",
            "antivenom_reserved": False
        }
    }
]

# ==============================================================================
# 5. SAMPLE TELEMETRY ACTIVITY LOGS
# ==============================================================================
AP_ACTIVITY_LOGS = [
    {
        "id": "act-ap-3001",
        "event_type": "AI_DISPATCH_TRIGGERED",
        "description": "Mobile ALS Unit RESQONE-AP-ALS-101 dispatched to Prakasam Barrage, Vijayawada with 10 vials AVS reserved.",
        "severity": "CRITICAL",
        "created_at": datetime.datetime.utcnow().isoformat()
    },
    {
        "id": "act-ap-3002",
        "event_type": "BLOOD_MATCH_COMPLETED",
        "description": "Smart compatibility ranking matched 2 universal O- donors for GGH Visakhapatnam trauma ward.",
        "severity": "HIGH",
        "created_at": datetime.datetime.utcnow().isoformat()
    }
]

def seed_supabase_tables():
    print("=== SEEDING ANDHRA PRADESH REAL FACILITY DATASETS INTO SUPABASE ===")

    # 1. Seed Hospitals
    res_hosp = requests.post(SUPABASE_URL + "hospitals", headers=HEADERS, data=json.dumps(AP_HOSPITALS))
    print(f"1. Hospitals Table: Status {res_hosp.status_code}")

    # 2. Seed Blood Donors
    res_donor = requests.post(SUPABASE_URL + "blood_donors", headers=HEADERS, data=json.dumps(AP_SYNTHETIC_DONORS))
    print(f"2. Blood Donors Table: Status {res_donor.status_code}")

    # 3. Seed Volunteers
    res_vol = requests.post(SUPABASE_URL + "volunteers", headers=HEADERS, data=json.dumps(AP_VOLUNTEERS))
    print(f"3. Volunteers Table: Status {res_vol.status_code}")

    # 4. Seed Emergency Reports
    res_rep = requests.post(SUPABASE_URL + "emergency_reports", headers=HEADERS, data=json.dumps(AP_EMERGENCY_REPORTS))
    print(f"4. Emergency Reports Table: Status {res_rep.status_code}")

    # 5. Seed Activity Logs
    res_act = requests.post(SUPABASE_URL + "activity_log", headers=HEADERS, data=json.dumps(AP_ACTIVITY_LOGS))
    print(f"5. Activity Log Table: Status {res_act.status_code}")

if __name__ == "__main__":
    seed_supabase_tables()
