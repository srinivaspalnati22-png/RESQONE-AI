# RESQONE AI — Unified Emergency Intelligence & Autonomous Rescue Platform

[![Live App](https://img.shields.io/badge/Live%20App-resqone--ai--app.vercel.app-red?style=for-the-badge&logo=vercel)](https://resqone-ai-app.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/srinivaspalnati22-png/RESQONE-AI)
[![Status](https://img.shields.io/badge/Deployment-Production%20Live-emerald?style=for-the-badge)](https://resqone-ai-app.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Three.js%20%7C%20FastAPI%20%7C%20Supabase-blue?style=for-the-badge)](https://resqone-ai-app.vercel.app)

---

## 🌐 Official Live Deployment Links

| Resource | URL Link |
| :--- | :--- |
| **🚀 Production Web App** | **[https://resqone-ai-app.vercel.app](https://resqone-ai-app.vercel.app)** |
| **📦 GitHub Repository** | **[https://github.com/srinivaspalnati22-png/RESQONE-AI](https://github.com/srinivaspalnati22-png/RESQONE-AI)** |
| **📑 API Docs (Swagger UI)** | `http://localhost:8000/docs` |
| **⚡ Local Dev / Preview Server** | `http://localhost:3000/` |

---

## 🚑 About RESQONE AI

**RESQONE AI** is a unified emergency triage, AI routing, and autonomous multi-agency rescue intelligence platform designed to save lives during critical Golden Hour emergencies across accident, medical, snakebite, and blood shortage scenarios.

---

## 🌟 Flagship Features

### 1. 🏎️ 3D Photorealistic Vehicle Crash Simulation & Real Humans
- Real-time sensor fusion screening evaluating **Accelerometer G-Force spikes (4.85G)**, **3D Gyroscope angular rollover (68.4°)**, and **GPS speed drops (78 km/h → 0 km/h)**.
- Ultra-realistic interactive 3D vehicle models (**High-Poly Sports Sedan, Superbike, ALS Ambulance**) with **animated forward spinning wheels** (alloy rims, ventilated brake discs, and Brembo calipers).
- **3D Humans Inside Vehicles**: Driver & passenger in cockpit with realistic seatbelts and crash whiplash inertia, motorcycle racer in aerodynamic tuck, and paramedic crew in ambulance.

### 2. 🗺️ 6-Stage Autonomous Multi-Agency Rescue Workflow
- Auto-scrolls to live Leaflet radar map upon 25s crash countdown completion or manual dispatch.
- **Hospital Acceptance**: GGH Vijayawada accepts case $\rightarrow$ **ALS-108 Ambulance drives along NH-16** with active rooftop beacon to Gollapudi crash scene $\rightarrow$ Paramedics stabilize patient $\rightarrow$ High-speed return via Green Corridor $\rightarrow$ Final **"Victim Arrived Safely at Hospital! 🎉"** celebration card with stable vitals ($120/80\text{ mmHg}$, $99\%\text{ SpO}_2$) and 5 family member SMS confirmation.

### 3. 🌐 First-Time Onboarding & Whole-App Language Switcher
- New users first select their preferred language: **English**, **తెలుగు (Telugu)**, **हिन्दी (Hindi)**, **தமிழ் (Tamil)**, or **ಕನ್ನಡ (Kannada)**.
- Choosing a language instantly translates all text, headings, buttons, and telemetry throughout the whole application.
- Configurable **5 Priority Family SOS Contacts** transmitted during crash alerts.

### 4. 🎙️ AI Multilingual Voice & Text Emergency Assistant
- Directly on the Home Page hero section:
  - **Voice Microphone Assistant**: Speaks & listens in Telugu (`te-IN`), English (`en-IN`), or Hindi (`hi-IN`).
  - **Smart Voice/Text Directing**:
    - 🩸 `"రక్తం కావాలి"` / `"Need Blood"` ➔ Directs to **Blood Donor Matcher**.
    - 🐍 `"పాము కాటు"` / `"Snake Bite"` ➔ Directs to **Snakebite Antivenom Hub**.
    - 🚨 `"వాహన ప్రమాదం"` / `"Car Crash"` ➔ Directs to **3D Crash Sensor Telemetry**.
    - 🏥 `"సమీప ఆసుపత్రి"` / `"Nearest Hospital"` ➔ Directs to **Mission Control**.

### 5. 🔊 Authentic Telugu Audio Speech Output
- Real-time voice guidance and audio announcements spoken aloud in authentic **Telugu** throughout all rescue steps, first-aid procedures, and emergency navigation.

### 6. 🩸 Smart ABO/Rh Blood Donor & NHP Bank Registry
- Deterministic clinical ABO/Rh compatibility matching preventing lethal transfusion errors.
- **Live Real GPS Map** plotting active community donors, National Health Portal (NHP) blood centers, and cold-chain cryo-courier transit corridors (4°C active temperature boxes).

### 7. 🐍 Snakebite Clinical Toxicology & Antivenom (AVS) Locator
- **Authentic Scientific Photo Matrix** for India's "Big Four" venomous snakes (Spectacled Cobra, Russell's Viper, Common Krait, Saw-scaled Viper) + harmless lookalikes.
- **Live GPS Victim-to-Hospital Radar Map** connecting victim coordinates to the nearest equipped AVS hospital with verified vial stocks and ICU ventilator beds.

---

## 🛠️ Quick Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/srinivaspalnati22-png/RESQONE-AI.git
cd RESQONE-AI

# 2. Install Node dependencies
npm install

# 3. Start local development server
npm run dev
```

---

## 🚀 Deployment

The app is configured for continuous deployment on **Vercel** connected directly to GitHub repository:
- **Production URL**: [https://resqone-ai-app.vercel.app](https://resqone-ai-app.vercel.app)
- **GitHub Repository**: [https://github.com/srinivaspalnati22-png/RESQONE-AI](https://github.com/srinivaspalnati22-png/RESQONE-AI)
