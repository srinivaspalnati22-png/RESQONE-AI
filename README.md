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
| **⚡ Local Dev / Preview Server** | `http://localhost:3000/` |

---

## 🚑 About RESQONE AI

**RESQONE AI** is a unified emergency triage, AI routing, and autonomous multi-agency rescue intelligence platform designed to save lives during critical Golden Hour emergencies across accident, medical, snakebite, and blood shortage scenarios.

---

## 🌟 Flagship Features

### 1. 🛡️ AI Pre-Crash Proactive Safety Radar & 15s Decision Window
- **Autonomous Sensor Fusion**: Continuously evaluates Accelerometer G-Force, 3D Gyroscope tilt, GPS speed, and MoRTH Highway Accident Blackspot corridors.
- **Multilingual Spoken Audio Precautions**: Autodetects hazards (excessive speed $>110\text{ km/h}$, sharp curve blackspots on NH-16, sudden swerving) and provides immediate voice warnings in **English**, **తెలుగు (Telugu)**, **हिन्दी (Hindi)**, **தமிழ் (Tamil)**, and **ಕನ್ನಡ (Kannada)**.
- **15-Second Interactive Decision Window**:
  - 🛑 **User Listens**: Vehicle decelerates safely to $50\text{ km/h}$ with voice confirmation (*"Speed normalized. You are safe! Hazard avoided."*).
  - ⚠️ **User Ignores / Timer Expires**: Simulates $4.85\text{G}$ catastrophic crash and immediately triggers the 25-second SOS countdown!

### 2. ⏱️ 25-Second Emergency SOS Countdown & Multi-Stakeholder Broadcast
- Ticks down second-by-second with a real-time circular glowing SVG progress ring.
- Upon timer completion to $0\text{s}$ (or manual dispatch):
  - 📱 Broadcasts live GPS coordinates to **5 Registered Family Members** via SMS.
  - 🏥 Broadcasts telemetry to the **Regional Emergency Response Network (GGH Vijayawada)**.
  - 🚑 Dispatches **ALS-108 Advanced Life Support Ambulance** with ICU Trauma Bay reservation.

### 3. 🗺️ Live Highway GPS Map with Real 3D Moving Ambulance
- **Animated 3D Ambulance**: Realistic 3D vehicle body with flashing red/blue LED strobe lightbars navigating along National Highway 16.
- **Stabilization & Green Corridor Transit**: Paramedics stabilize the victim at the crash site and transport them via the green signal corridor to GGH ICU Trauma Bay with spoken voice updates.

### 4. 🎛️ Universal Multi-Role Live Mission Dashboard
Interactive live mission control supporting 5 dedicated stakeholder roles:
- 👤 **Citizen / Victim (`user`)**: Live emergency tracking showing which hospital accepted and which ambulance is en route.
- 🏥 **Hospital ER / ICU (`hospital`)**: `[ 🏥 ACCEPT PATIENT & RESERVE ICU BED ]` action button.
- 🚑 **108 Rescue Team (`rescue`)**: `[ 🚨 ACCEPT RESCUE & DISPATCH AMBULANCE ]` action button.
- 🩸 **Blood Donor (`donor`)**: `[ 🩸 ACCEPT BLOOD SOS & START COURIER ]` action button.
- 🤝 **Volunteer First Responder (`volunteer`)**: `[ 🤝 ACCEPT VOLUNTEER DISPATCH ]` action button.

### 5. 🩸 Smart ABO/Rh Blood Donor & NHP Bank Registry
- Deterministic clinical ABO/Rh compatibility matching preventing lethal transfusion errors.
- **Live Real GPS Map** plotting active community donors, National Health Portal (NHP) blood centers, and cold-chain cryo-courier transit corridors (4°C active temperature boxes).

### 6. 🐍 Snakebite Clinical Toxicology & Antivenom (AVS) Locator
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

---

## 📚 Project Documentation & Research Blueprints

Comprehensive architectural blueprints, clinical methodology, research papers, and judge presentation guides are organized in the [`docs/`](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/docs) directory:

- 📑 **[Master Project Documentation](docs/MASTER_PROJECT_DOCUMENTATION.md)** — Complete end-to-end breakdown: Problem statement, models, datasets, architecture, workflows, and build guide.
- 📖 **[System Documentation](docs/SYSTEM_DOCUMENTATION.md)** — Complete architecture, clinical decision tree, and sensor algorithms.
- 🧪 **[Technical Architecture & Setup Guide](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/docs/DOCUMENTATION.md)** — Deep-dive on backend endpoints, Supabase schema, and components.
- 🎓 **[IEEE Research Paper & TeX Source](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/docs/RESQONE_AI_IEEE_PAPER.tex)** — Full academic paper format and experimental evaluation.
- 🔬 **[Research Paper (Markdown)](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/docs/RESQONE_AI_RESEARCH_PAPER.md)** — Comprehensive methodology and comparative clinical benchmarks.
- 🏆 **[Judge Presentation Guide](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/docs/JUDGE_PRESENTATION_GUIDE.md)** — Step-by-step hackathon judging flow and scenario walkthroughs.
- ❓ **[Judge Q&A Guide](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/docs/JUDGE_QA.md)** — Answers to technical, architectural, and clinical defense questions.
- 🎬 **[Live Demo Guide](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/docs/DEMO_GUIDE.md)** — Quick live demonstration scenarios and telemetry validation.
- 📱 **[User Guide](file:///c:/Users/srini/OneDrive/Desktop/RESQONE-AI/docs/USER_GUIDE.md)** — End-user operational guide for citizens, paramedics, and hospitals.

---

## 🚀 Continuous Deployment

The application is deployed live on **Vercel** and automatically synchronizes with the `main` branch of this GitHub repository:
- **Production URL**: **[https://resqone-ai-app.vercel.app](https://resqone-ai-app.vercel.app)**
- **GitHub Repository**: **[https://github.com/srinivaspalnati22-png/RESQONE-AI](https://github.com/srinivaspalnati22-png/RESQONE-AI)**

