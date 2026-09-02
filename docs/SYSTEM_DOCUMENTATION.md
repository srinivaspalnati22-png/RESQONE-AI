# 🛡️ RESQONE AI+ — Complete System Architecture & Button-by-Button Operational Manual

> **Official Application URL**: [https://resqone-ai-app.vercel.app](https://resqone-ai-app.vercel.app)  
> **Repository**: [https://github.com/srinivaspalnati22-png/RESQONE-AI](https://github.com/srinivaspalnati22-png/RESQONE-AI)

---

## 📋 Table of Contents
1. [Executive Summary & Core Mission](#1-executive-summary--core-mission)
2. [High-Level Architecture & Emergency Mesh](#2-high-level-architecture--emergency-mesh)
3. [Global Components & Universal Controls](#3-global-components--universal-controls)
4. [Page 1: Home & AI Command Hub (`LandingPage.jsx`)](#4-page-1-home--ai-command-hub)
5. [Page 2: 3D Crash Detection & Accident Rescue (`AccidentPage.jsx`)](#5-page-2-3d-crash-detection--accident-rescue)
6. [Page 3: Universal Blood Bank & Donor Mesh (`BloodDonorPage.jsx`)](#6-page-3-universal-blood-bank--donor-mesh)
7. [Page 4: Snakebite AI & Antivenom Hospital Finder (`SnakebitePage.jsx`)](#7-page-4-snakebite-ai--antivenom-hospital-finder)
8. [Page 5: Role-Specific Mission Control Dashboard (`DashboardPage.jsx`)](#8-page-5-role-specific-mission-control-dashboard)
9. [Page 6: Authentication, Google OAuth & Profiles (`AuthPage.jsx`)](#9-page-6-authentication-google-oauth--profiles)
10. [Offline-First Architecture & Sensor Daemon Operations](#10-offline-first-architecture--sensor-daemon-operations)

---

## 1. Executive Summary & Core Mission

**RESQONE AI+** is a unified, offline-first emergency intelligence and multimodal rescue coordination ecosystem. It bridges the critical "Golden Hour" gap during life-threatening crises by automating:
1. **Zero-Touch Crash Detection**: Continuous 3-axis accelerometer and gyroscope physics monitoring that triggers rescue even if victims are unconscious.
2. **Polyvalent Antivenom (AVS) Logistics**: Image/symptom species classification linked with real-time vial inventory at nearby tertiary hospitals.
3. **Hyper-Local Blood Mesh**: Cryo-courier temperature tracking and instant ABO/Rh match dispatch within a 15 km radius.
4. **Real-Time 108 CAD Integration**: Automated green-corridor ambulance routing and ICU trauma bay bed reservations.

---

## 2. High-Level Architecture & Emergency Mesh

```
                     ┌──────────────────────────────────────────────┐
                     │           RESQONE AI+ CLIENT LAYER          │
                     │  (PWA Mobile / Desktop / Native Flutter App) │
                     └──────────────────────┬───────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
  │  Offline Sensor Daemon  │  │  NLP Voice Triage & AI  │  │  PWA Service Worker &   │
  │  (IMU 3-Axis / GPS CAD) │  │  (Multilingual Triage)  │  │  IndexedDB Offline Sync │
  └────────────┬────────────┘  └────────────┬────────────┘  └────────────┬────────────┘
               │                            │                            │
               └────────────────────────────┼────────────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          SUPABASE REALTIME MESH              │
                     │  Channel: `resqone_emergency_mesh` (WebRTC)  │
                     └──────────────────────┬───────────────────────┘
                                            │
         ┌───────────────────┬──────────────┴──────┬───────────────────┐
         ▼                   ▼                     ▼                   ▼
┌─────────────────┐ ┌─────────────────┐  ┌───────────────────┐ ┌─────────────────┐
│   Citizen SOS   │ │  Hospital ER    │  │  108 Rescue CAD   │ │  Blood Donors   │
│ (GPS + SMS Out) │ │ (ICU Bay + AVS) │  │  (ALS Green Route)│ │ (ABO/Rh Match)  │
└─────────────────┘ └─────────────────┘  └───────────────────┘ └─────────────────┘
```

---

## 3. Global Components & Universal Controls

### 3.1 Top Navigation Bar (`Navbar.jsx`)
- **App Logo & Brand Button**: Clicking navigates directly to the **Home Page**.
- **Role Mode Indicator**: Displays active session badge (`CITIZEN`, `HOSPITAL`, `108 RESCUE`, `DONOR`, `VOLUNTEER`).
- **View Mode Switcher (`Mobile / Desktop`)**: Toggles responsive layout between a mobile device viewport ($430\text{px}$) and a multi-column desktop command center.
- **Language Dropdown (`EN`, `తెలుగు`, `हिन्दी`, `தமிழ்`, `ಕನ್ನಡ`)**: Real-time localized voice synthesis and UI text translation.
- **Bell Notification Center**:
  - Displays real-time badge count of unread broadcasts.
  - Clicking opens a sliding drawer listing all active emergencies, 108 dispatches, and blood courier routes.
  - **"Clear All" Button**: Dismisses processed notifications.
  - **Clicking any alert item**: Automatically navigates to the incident's live CAD map.

### 3.2 Floating Bottom Navigation (`BottomNav.jsx`)
- 🏠 **Home Button**: Returns to the central command hub.
- 🚗 **Crash 3D Button**: Opens the live physics telemetry and vehicle simulation lab.
- 🩸 **Blood Finder Button**: Opens the regional ABO/Rh blood donor search and cryo-courier dispatch.
- 🚨 **Central Floating SOS Button**: Instant 1-tap emergency beacon trigger.
- 🐍 **Snake AI Button**: Opens the neural species scanner and antivenom stock finder.
- 📊 **Mission Control Button**: Opens the stakeholder-specific operational dashboard.
- 👤 **Account / Role Button**: Opens profile settings, family contacts, and authentication.

### 3.3 Floating 1-Tap SOS Emergency Modal (`SOSModal.jsx`)
- **Trigger**: Clicked via the central red SOS button on any page.
- **Countdown Timer**: 5-second automatic safety abort window to prevent accidental triggers.
- **"CANCEL SOS" Button**: Aborts the emergency dispatch if clicked before timer expiry.
- **"CONFIRM RESCUE NOW" Button**: Bypasses countdown and fires instant Supabase Realtime broadcast to 108 CAD, trauma hospitals, and all 5 configured family contacts.

### 3.4 PWA Install & Push Notification Modal (`NotificationPermissionBanner.jsx`)
- **Auto-Trigger**: Appears 1.5 seconds after opening the app on any device.
- **"Install App & Enable Alerts" Button**: Triggers native browser PWA home screen installation and requests push notification permission.
- **"Alerts Only" Button**: Grants push notifications and spoken voice alerts without installing.
- **"Continue in Web" Button**: Dismisses the modal for the current browsing session.

---

## 4. Page 1: Home & AI Command Hub (`LandingPage.jsx`)

### Overview
The central launchpad providing real-time system health, live emergency telemetry, NLP multilingual voice triage, and direct links to all emergency departments.

### UI Sections & Button Functionality:
1. **Live Operations Pill**: Displays pulsing operational status (`🟢 LIVE OPERATIONS 24/7`).
2. **AI Commander Status**: Real-time canvas rendering of live ECG biometric waves and neural inference engine state.
3. **Multilingual NLP Voice & Text Emergency Triage Bar**:
   - **Microphone Button (`Mic`)**: Starts speech recognition in Telugu, Hindi, Tamil, Kannada, or English.
   - **Text Input Bar**: Allows typing queries (e.g., *"Need O- blood"*, *"Cobra bite in Vijayawada"*, *"Car crash on NH-16"*).
   - **Send Button (`Send`)**: Analyzes the query with NLP, speaks instructions, and routes to the matching emergency sector.
   - **Quick Action Chips (`🩸 O- Blood`, `🐍 Snake Bite AVS`, `🚗 108 Crash`)**: 1-tap instant sector triage triggers.
4. **4 Sector Navigation Cards**:
   - **"Crash Detection & 108 CAD" Card**: Opens `accident` module with 3D vehicle physics.
   - **"Blood Bank & Cryo-Courier" Card**: Opens `blood` module with donor mesh.
   - **"Snakebite AI & Antivenom" Card**: Opens `snakebite` module with species vision AI.
   - **"Hospital ER Bed Allocation" Card**: Opens `dashboard` with live trauma bay beds.
5. **Interactive Live GIS Map Preview**: Displays real-time GPS locations of nearby trauma centers, ambulances, and active SOS beacons.

---

## 5. Page 2: 3D Crash Detection & Accident Rescue (`AccidentPage.jsx`)

### Overview
Integrates browser IMU sensors ($X, Y, Z$ accelerometers and gyroscopes) with 3D Three.js vehicle crash physics, automated impact classification, and 108 CAD rescue dispatch.

### UI Sections & Button Functionality:
1. **3D Interactive Vehicle Simulation Canvas**:
   - Real-time 3D Three.js model showing live chassis pitch, roll, yaw, and crumple zone deformations.
   - **Camera Controls**: Orbit, pan, and zoom to inspect vehicle impact angles.
2. **Live Sensor Telemetry Gauges**:
   - Displays real-time G-force impact (e.g., $4.85\text{G}$), vehicle velocity ($78\text{ km/h}$), and rollover angular rate ($142^\circ/\text{s}$).
3. **Simulation Control Buttons**:
   - **"Simulate 4.85G High-Speed Crash"**: Triggers synthetic high-velocity impact with rollover.
   - **"Simulate Side-Impact T-Bone Collision"**: Triggers lateral impact with chassis deformation.
   - **"Reset Telemetry"**: Restores normal driving sensor state ($1.0\text{G}$).
4. **108 CAD Rescue Dispatch Module**:
   - **"Dispatch ALS-108 Ambulance" Button**: Reserves Advanced Life Support ambulance AP-TRAUMA-99 with green corridor traffic pre-emption.
   - **"Reserve Trauma ICU Bed" Button**: Reserves ICU Trauma Bay #4 at Government General Hospital (GGH).
   - **"Send SMS to 5 Family Contacts" Button**: Dispatches emergency SMS with live GPS tracking URL.

---

## 6. Page 3: Universal Blood Bank & Donor Mesh (`BloodDonorPage.jsx`)

### Overview
A regional donor network and cryo-courier tracking system for immediate ABO/Rh blood matching and temperature-controlled transport.

### UI Sections & Button Functionality:
1. **ABO/Rh Blood Group Filter Pills (`O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+`)**:
   - Filters registered donors and regional blood bank inventory.
2. **"Request Immediate Blood Courier" Button**:
   - Triggers an instant dispatch of a temperature-controlled ($4^\circ\text{C}$) cryo-courier drone/bike.
3. **"Register as Voluntary Blood Donor" Button**:
   - Opens donor onboarding modal to register phone, blood group, and availability.
4. **"Toggle Donor Availability (🟢 Available / ⚪ Busy)"**:
   - Changes donor status in the live regional matching pool.
5. **Cryo-Courier Live Telemetry Tracker**:
   - Real-time GPS distance ($1.8\text{ km}$), ETA ($4\text{ mins}$), and temperature sensor verification ($3.8^\circ\text{C}$).

---

## 7. Page 4: Snakebite AI & Antivenom Hospital Finder (`SnakebitePage.jsx`)

### Overview
AI species identification (Spectacled Cobra, Russell's Viper, Saw-scaled Viper, Common Krait) paired with hospital Polyvalent Antivenom (AVS) stock tracking.

### UI Sections & Button Functionality:
1. **Species Visual Recognition Camera / Upload**:
   - **"Take Photo / Upload Snake Image" Button**: Runs computer vision inference to classify snake species and venom type (Neurotoxic vs. Hemotoxic).
2. **Symptom Triage Checklist**:
   - Interactive toggles for *Rapid Swelling*, *Ptosis (Drooping Eyelids)*, *Bite Mark Bleeding*, and *Respiratory Distress*.
3. **"Calculate Required AVS Dosage" Button**:
   - Computes initial pediatric/adult antivenom vial dosage (e.g., 10 Polyvalent Vials).
4. **"Find Nearest AVS Stocked Hospital" Button**:
   - Locates tertiary trauma centers with verified cold-chain AVS inventory ($>50\text{ vials}$).
5. **"Call Hospital Emergency Room Direct" Button**:
   - Triggers instant one-touch telephony connection to the ER on-duty toxicologist.

---

## 8. Page 5: Role-Specific Mission Control Dashboard (`DashboardPage.jsx`)

### Overview
Dynamic command console that adapts specifically to the authenticated user's registered stakeholder role:

### 8.1 👤 Citizen / Victim Mode
- **Personal SOS Status Card**: Displays active rescue status and assigned 108 ambulance ETA.
- **Family Contacts Alert Tracker**: Displays delivery status of SOS SMS sent to 5 family contacts.
- **Accept Mission Button**: Intentionally hidden for safety.

### 8.2 🏥 Hospital ER / Trauma Bay Mode
- **Trauma Bay Allocation Matrix**: Live counter of available ICU beds (e.g., 12 Beds Available).
- **AVS Cold-Storage Tracker**: Displays live vial counts (e.g., 395 Vials).
- **"Admit Emergency Patient" Button**: Assigns Trauma Bay #4 and notifies incoming 108 crew.
- **"Accept Emergency Mission" Button**: Confirms hospital reception and preps surgical team.

### 8.3 🚑 108 Rescue Team Mode
- **ALS Fleet Telemetry**: Tracks unit AP-TRAUMA-99 speed, sirens, and fuel.
- **"Activate Green Corridor" Button**: Sends traffic pre-emption signal to municipal traffic lights.
- **"Accept Rescue Mission" Button**: Sets ambulance status to `EN ROUTE` with turn-by-turn routing.

### 8.4 🩸 Blood Bank / Donor Mode
- **Regional ABO/Rh Inventory**: Live counts of whole blood, PRBC, and platelet units.
- **"Dispatch Cryo-Courier" Button**: Assigns temperature-monitored courier bike to delivery route.

### 8.5 🤝 First Responder / Volunteer Mode
- **$3.5\text{km}$ CAD Radius Radar**: Lists local medical distress calls requiring CPR/BLS.
- **"Accept Volunteer Mission" Button**: Commits volunteer responder and alerts 108 dispatch.

*(In Demo Mode, an interactive 5-role switcher bar is displayed at the top to allow evaluators to inspect all 5 operational perspectives).*

---

## 9. Page 6: Authentication, Google OAuth & Profiles (`AuthPage.jsx`)

### Overview
Manages multi-role onboarding, Google OAuth 2.0 single sign-on, and emergency contact configurations.

### UI Sections & Button Functionality:
1. **Stakeholder Role Selector Chips**:
   - Allows selecting role: *Citizen*, *Hospital ER*, *108 Rescue*, *Blood Donor*, or *Volunteer*.
2. **"Continue with Google" Button**:
   - Initiates Supabase Google OAuth 2.0 flow with dynamic origin redirection.
3. **"1-Tap Quick Demo Access" Button**:
   - Instant guest authorization with verified credentials for frictionless evaluation.
4. **"Sign In" vs "Register (New User)" Mode Switcher**:
   - Toggles between login credentials and 2-step account creation.
5. **Registration Step 1 Form**:
   - Full Name, Email, Password, Phone Number, Blood Group, and Role-specific details.
   - **"Next: Setup 5 Family SOS Contacts" Button**: Advances to emergency contact setup.
6. **Registration Step 2 Form (5 Emergency Contacts)**:
   - Configures 5 contacts who receive automatic SOS dispatches.
   - **"Complete Registration" Button**: Persists profile and contacts to Supabase `users` table.

---

## 10. Offline-First Architecture & Sensor Daemon Operations

### 10.1 Background Sensor Operation
- **Does the app monitor sensors when not actively navigating?**
  - **Yes.** When installed as a PWA or running natively, background device motion handlers monitor continuous 3-axis accelerometer thresholds ($>4.0\text{G}$) and angular momentum ($>120^\circ/\text{s}$).
  - If a sudden deceleration spike occurs, the crash triage daemon immediately activates the emergency countdown.

### 10.2 Offline Queue & Auto-Sync
- If an emergency is reported with **no internet connectivity**:
  - The report is encrypted and saved to the local IndexedDB offline queue.
  - The top status bar displays `🟡 OFFLINE — QUEUED (N)`.
  - As soon as mobile data or Wi-Fi reconnects, the background service worker automatically synchronizes all queued reports to Supabase without user intervention.

---

## 🏁 Summary Table of Core Pages & URLs

| Page Name | Route / Active Tab | Primary Purpose | Key Action |
| :--- | :--- | :--- | :--- |
| **Home Hub** | `home` | NLP Voice Triage & System Overview | Multilingual Voice Emergency Router |
| **Crash 3D** | `accident` | 3D Physics Crash Detection & 108 CAD | 108 Ambulance & Trauma Bay Dispatch |
| **Blood Finder** | `blood` | Regional ABO/Rh Donor & Cryo-Courier | 1-Tap 4°C Blood Transport Dispatch |
| **Snakebite AI** | `snakebite` | Species Vision AI & AVS Stock Finder | Antivenom Dosage Calculation & ER Call |
| **Missions** | `dashboard` | Multi-Stakeholder Role Command Center | Role-Specific Mission Acceptance & Triage |
| **Account** | `auth` | Google OAuth, Profile & 5 Family Contacts | Emergency Contacts Configuration |

---
*Developed by the RESQONE AI+ Emergency Intelligence Team.*
