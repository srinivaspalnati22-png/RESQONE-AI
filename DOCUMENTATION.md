# RESQONE AI+ — Technical Architecture & Documentation

## 1. Problem & Product Vision
In medical and rescue emergencies (road accidents, snakebites, blood shortages, cardiac events, natural disasters), every minute matters. Today, emergency services are fragmented across separate single-purpose apps — one for blood donation, one for ambulances, one for SOS buttons, one for hospital directories, and one for disaster alerts — wasting critical time during high-stress crises.

**RESQONE AI+** unifies these disparate services into one intelligent, offline-first emergency ecosystem. It acts as an explainable emergency copilot that multi-modally classifies incidents, scores severity, evaluates hospital ICU and antivenom telemetry, matches compatible blood donors, and coordinates rescue dispatch in seconds.

---

## 2. Competitive Differentiation

| Feature / Capability | Single-Purpose Apps | RESQONE AI+ |
| :--- | :--- | :--- |
| **Scope** | Blood-only or Ambulance-only | **Unified Cross-Domain Emergency Ecosystem** |
| **Triage & Classification** | Hardcoded lookups / manual drop-downs | **Multi-Modal AI Copilot (Voice & Text NLP)** |
| **Explainability** | Black box or static display | **100% Transparent Reasoning & Uncertainty Triage** |
| **Hospital Matching** | Static directory | **Live Telemetry (ICU Beds, AVS Stock, Blood Stocks)** |
| **Offline Resilience** | Hard crash / blank screen | **PWA Offline Queueing & Local Fallback Mesh** |
| **Telemetry Visualization** | None / Static maps | **Scroll-Scrubbed Realtime Vehicle Journey Videos** |

---

## 3. Feature Breakdown (Built vs. Roadmap)

### Flagship Feature (Built to High Production Standard)
- **AI Voice & Text Emergency Copilot**:
  - Accepts natural language descriptions or simulated voice input.
  - Classifies emergency category (`SNAKEBITE`, `ACCIDENT_RESCUE`, `CARDIAC_EVENT`, `BLOOD_CRISIS`, `DISASTER_RESPONSE`).
  - Severity level scoring (Tiers 1 to 4).
  - Confidence rating (0–100%) with uncertainty protocol (<65% triggers automatic human control room escalation).
  - Transparent Explainability Card: key factors extracted, natural language model reasoning, and step-by-step recommended first-aid actions.
  - Automated dispatch pairing with nearest hospital.

### Supporting Features (Fully Functional)
- **Smart Blood Donor Finder**: Medical ABO/Rh compatibility rules combined with GPS distance ranking.
- **Snakebite Emergency & Hospital Intelligence**: AI species identification (Spectacled Cobra, Russell's Viper, Common Krait), venom toxicity risk analysis (Neurotoxic / Hemotoxic), WHO first-aid guidance, and antivenom (AVS) stocking hospital locator.
- **Mission Control Dashboard**: Live rescue dispatches tracking, hospital ICU/AVS stock matrix, and trust-scored volunteer network.

### Documented Roadmap (Future Scope)
- Bluetooth Low Energy (BLE) / Wi-Fi Direct peer-to-peer offline mesh network.
- Federated learning for privacy-preserving localized incident telemetry.
- On-device sensor-based crash auto-detection (accelerometer & gyroscope fusion).
- Cryptographic volunteer trust-score verification.

---

## 4. AI/ML Pipeline & Explainability

```
[Voice / Text / Visual Input]
              │
              ▼
    [Client-side Preprocessing] (Audio Transcript / String Normalization / Offline Detection)
              │
              ▼
      [FastAPI AI Copilot] (Regex NLP Matching & Weighted Categorization)
              │
              ▼
   [Severity & Confidence Engine] (Severity Tiers 1-4, Confidence 0-100%)
              │
              ▼
  [Explainability Synthesis] ───► Low Confidence (<65%)? ──► [Escalate to Human Control Room]
              │
              ▼
   [Reasoning & Dispatch Card] (Key Factors, Explanation, Action, Matched Hospital)
```

### Explainability Standard
Every AI inference output in RESQONE AI+ renders:
1. **Decision Summary**: Category & Severity Tier.
2. **Confidence Level**: Visual progress bar.
3. **Key Factors**: Extracted keywords and risk signals.
4. **Human Explanation**: Natural language audit of why this decision was reached.
5. **Recommended Action**: Step-by-step medical guidance.
6. **Uncertainty Alert**: Never guesses silently; flags low-confidence reports for human review.

---

## 5. Data Sources & Provenance

To maintain absolute data integrity, transparency, and judge trust:

### 🏥 `hospitals` Table (Real Andhra Pradesh Facilities)
- **Primary Sources**:
  - [Open Government Data Portal of Andhra Pradesh (`ap.data.gov.in`)](https://ap.data.gov.in/) (Search: "hospital directory")
  - [National Hospital Directory - National Health Portal (`data.gov.in`)](https://www.data.gov.in/catalog/hospital-directory-national-health-portal) (Filtered to Andhra Pradesh region)
- **Provenance**: Real facility names, exact Geo-coordinates, phone numbers, and addresses for 15+ major regional trauma centers across AP (Visakhapatnam King George Hospital KGH, GGH Vijayawada, Ruia Hospital Tirupati, GGH Guntur, GGH Kurnool, GGH Kakinada, GGH Nellore, GGH Anantapur, Rajahmundry District Hospital, AIIMS Mangalagiri, Apollo Arilova, Ramesh Vijayawada, SVIMS Tirupati, Manipal Vijayawada).
- **Simulated Layer**: Live operational fields (`icu_available`, `blood_stock` JSONB, `antivenom_stock`, `oxygen_status`) are realistic *simulated values* layered on top of real facility records, as no public live API feed currently exists for ICU bed availability.

### 🩸 `blood_donors` Table & Blood Banks
- **Primary Facility Sources**:
  - [e-RaktKosh Blood Bank Directory - Ministry of Health & Family Welfare (`eraktkosh.mohfw.gov.in`)](https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/transactions/bbpublicindex.html) (Andhra Pradesh blood bank locations)
  - [National Health Portal Blood Bank Directory (`data.gov.in`)](https://www.data.gov.in/catalog/blood-bank-directory-national-health-portal)
- **Privacy & Synthetic Donor Layer**:
  - Individual donor rows (names, phone numbers, exact addresses) are **100% synthetic demo records** generated across AP blood bank locations to strictly protect personal medical privacy. No real person's private health data is scraped or fabricated.

### 🐍 Snake Species / Venom / First-Aid Reference Data (`snake_species`)
- **Primary Dataset**:
  - [Kaggle Snake Dataset India (`kaggle.com/datasets/adityasharma01/snake-dataset-india`)](https://www.kaggle.com/datasets/adityasharma01/snake-dataset-india) — 20 medically important Indian snake species (Big Four: Spectacled Cobra, Russell's Viper, Common Krait, Saw-scaled Viper + King Cobra, Hump-nosed Pit Viper, etc.).
- **Clinical & First-Aid Guidelines**:
  - [National Health Mission Snakebite Quick Reference Guide (`nhm.gov.in`)](https://nhm.gov.in/images/pdf/guidelines/nrhm-guidelines/stg/Snakebite_QRG.pdf)
  - [WHO Guidance on Management of Snakebites in South-East Asia (`cdn.who.int`)](https://cdn.who.int/media/docs/default-source/searo/india/health-topic-pdf/who-guidance-on-management-of-snakebites.pdf)
- **Provenance**: Venom risk classification, symptoms, WHO first-aid text, and Polyvalent Antivenom Serum (AVS) dosage vial requirements strictly adhere to these official guidelines.

### 🧬 Blood-Type Compatibility Rules
- Standard medical ABO/Rh donor-recipient compatibility matrix (Universal Donor `O-`, Universal Recipient `AB+`).

### 🌀 Disaster Response Reference Data
- [Andhra Pradesh State Disaster Management Authority (`apsdma.ap.gov.in`)](https://apsdma.ap.gov.in/) planning documents & Heat Wave Atlas.

### 📜 `activity_log` & `emergency_reports`
- Sample emergency reports and dispatches are **clearly labeled synthetic demo entries** created for presentation and telemetry demonstration purposes.

---

## 6. Scroll-Scrubbed Emergency Journey Videos

To provide immersive visual feedback of rescue vehicles in transit:
- **Shared Component**: `<ScrollScrubbedVideo src={...} poster={...} title={...} subtitle={...} />` located at [`src/components/ScrollScrubbedVideo.jsx`](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/src/components/ScrollScrubbedVideo.jsx).
- **Assets**:
  1. `src/assets/videos/ambulance-journey.mp4` → Flagship Copilot Page (Ambulance leaving hospital -> accident site).
  2. `src/assets/videos/blood-donation-journey.mp4` → Blood Donor Page (Blood bank courier -> hospital).
  3. `src/assets/videos/snakebite-journey.mp4` → Snakebite Page (Antivenom courier -> patient).
- **Scrubbing Mechanism**:
  - Video tag rendered `muted`, `playsInline`, `preload="auto"`, never calling `.play()`.
  - Framer Motion `useScroll` + `useTransform` tracks container scroll progress (0 to 1).
  - Video `currentTime = progress * duration` updates vehicle position smoothly on scroll down and reverses on scroll up.
  - Container pinned via `position: sticky`.
  - Lazy-mounted using `IntersectionObserver`.
  - **Low-Motion / Connection Fallback**: If `prefers-reduced-motion` is enabled or video duration fails to load, displays a static arrival poster frame instead of a broken or blank video element.

---

## 7. Supabase Database Schema & RLS

- **`profiles`**: `id` (references `auth.users`), `name`, `phone`, `blood_group`, `role` (`user`, `donor`, `volunteer`, `hospital`), `location_lat`, `location_lng`.
- **`activity_log`**: `id`, `user_id`, `action`, `metadata`, `created_at`.
- **`emergency_reports`**: `id`, `reporter_id`, `type`, `severity`, `ai_confidence`, `ai_explanation`, `status`, `location_lat`, `location_lng`, `address`, `created_at`, `dispatch_details`.
- **`blood_donors`**: `id`, `profile_id`, `blood_group`, `last_donation_date`, `availability`, `location_lat`, `location_lng`.
- **`hospitals`**: `id`, `name`, `address`, `phone`, `location_lat`, `location_lng`, `icu_available`, `blood_stock`, `antivenom_available`.
- **`volunteers`**: `id`, `profile_id`, `trust_score`, `response_rate`, `status`, `skills`.

### Row Level Security (RLS)
- Public read access for `hospitals` table.
- Authenticated user read/write access for own `profiles` and `emergency_reports`.
- Role-restricted access for `blood_donors` and `volunteers`.

---

## 8. Setup & Running Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+

### Step 1: Start Backend API
```bash
# In project root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### Step 2: Start Frontend App
```bash
# In project root
npm run dev
```

Open your browser at `http://localhost:3000`.
