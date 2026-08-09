# RESQONE AI — Emergency Response Platform

![RESQONE AI Banner](https://img.shields.io/badge/RESQONE-AI%2B_Platform-red?style=for-the-badge&logo=shield)
![Status](https://img.shields.io/badge/Deployment-Live-emerald?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Production-black?style=for-the-badge&logo=vercel)

> **Live Deployment Link:** [https://resqone-ai-app.vercel.app](https://resqone-ai-app.vercel.app)

---

## 🚑 About RESQONE AI

**RESQONE AI** is a next-generation emergency triage, AI navigation, and critical response platform designed to save lives in accident, medical, and disaster scenarios.

### 🌟 Key Features

1. **Live Google Emergency Radar & 3D Ambulance Dispatch**
   - Real-time continuous geolocation tracking (`navigator.geolocation.watchPosition`).
   - Haversine-sorted nearest Hospitals, Blood Donors, and Disaster Shelters.
   - Interactive 3D-simulated ambulance dispatch animation upon SOS / accident crash trigger.

2. **Dual-Mode Voice AI Assistant**
   - Persistent right-corner Voice AI button (`VoiceControlWidget`).
   - Natural language voice navigation, emergency reporting, and first-aid Q&A in English, Telugu (తెలుగు), and Hindi (हिंदी).

3. **Multi-Signal Automatic Crash Detection**
   - Simulated sensor telemetry detecting vehicular collision / impact triggers with instant 10-second countdown modal.

4. **Kaggle-Validated Snakebite Telemetry**
   - Kaggle species photo datasets for India's "Big Four" venomous snakes.
   - Antivenom stock tracking and nearest equipped hospital locator.

5. **Supabase & Role-Based Authentication**
   - Support for standard Victims, Blood Donors, Volunteers, and Hospital Admins.
   - One-click Google Sign-In (`Continue with Google`) and Email Auth.

6. **Offline-First PWA Support**
   - Works offline with cached first-aid manuals, emergency hotlines, and fallback local map indicators.

---

## 🛠️ Quick Local Setup

```bash
# Clone the repository
git clone https://github.com/srinivaspalnati22-png/RESQONE-AI.git
cd RESQONE-AI

# Install dependencies
npm install

# Start Frontend Dev Server
npm run dev

# Start Backend API (FastAPI)
python -m uvicorn backend.main:app --reload --port 8000
```

---

## 🌐 Live Application URL

- **Production Frontend:** [https://resqone-ai-app.vercel.app](https://resqone-ai-app.vercel.app)
- **GitHub Repository:** [https://github.com/srinivaspalnati22-png/RESQONE-AI](https://github.com/srinivaspalnati22-png/RESQONE-AI)

---
*Built for Emergency Responders, Victims, and Healthcare Providers.*
