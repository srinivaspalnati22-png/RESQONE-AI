# 📱 RESQONE-AI+ Automated Zero-Touch Family SMS & WhatsApp Dispatch System

## 🌟 Overview
In critical emergencies—such as high-speed rollover collisions or neurotoxic snakebite envenomation—victims are frequently unconscious or physically unable to operate their phone. 

To overcome this fatal bottleneck, **RESQONE-AI+ incorporates an Automated Zero-Touch Emergency Dispatch Engine** that transmits instantaneous SMS and WhatsApp distress notifications to **all 5 registered family relatives** without requiring any manual screen touch.

---

## 🚀 How It Works (Zero-Touch Workflow)

```
[Crash Detection Sensors (≥4.0 G, >120°/s) OR SOS Beacon]
                          ↓
[25s / 5s Hands-Free Verification Countdown (Voice + Strobe Alert)]
                          ↓ (Zero Touch Required: Timer Expires or "I Need Help")
[Autonomous Background Dispatch Pipeline (/api/emergency/notify-family)]
                          ↓
 ┌────────────────────────┴────────────────────────┐
 │                                                 │
 ▼                                                 ▼
[Twilio / Fast2SMS Cloud SMS Gateway]     [Twilio WhatsApp Cloud Gateway]
 │                                                 │
 ▼                                                 ▼
Delivered automatically to 5 Family Phones  Delivered automatically to 5 Family WhatsApp
```

---

## 📋 The 5 Registered Family SOS Contacts

By default, RESQONE-AI+ maintains 5 registered emergency contacts (fully editable anytime in the Profile / Emergency Contacts modal):

1. **Ramesh Varma (Father)** — `+91 94401 23401`
2. **Lakshmi Varma (Mother)** — `+91 94401 23402`
3. **Suresh Varma (Brother)** — `+91 94401 23403`
4. **Ananya Rao (Best Friend)** — `+91 94401 23404`
5. **Dr. K. Srinivas (Family Physician)** — `+91 94401 23405`

---

## 📨 Exact Message Received by Family Members

Every family member receives an instant distress alert containing the exact live GPS location, victim vitals, and ambulance tracking link:

```
🚨 RESQONE-AI+ CRITICAL EMERGENCY SOS

⚠️ AUTOMATED ZERO-TOUCH DISPATCH
A high-impact collision / distress beacon has been verified.

👤 Victim: Srinivas Palnati (O+)
📍 Location: NH-16 Gollapudi, Vijayawada Highway
🗺️ Live GPS Pin: https://maps.google.com/?q=16.54120,80.58430
🚑 CAD Live Route: https://resqone-ai.vercel.app/?sos_track=sos-1725500000
🏥 Designated Hospital: GGH Vijayawada Emergency Trauma Center
⏱️ Timestamp: 2026-09-05 09:45:00 IST

Please reach out to the victim or emergency services immediately!
```

---

## ⚙️ Connecting Live Production Gateways (Twilio / Fast2SMS)

In development and project viva presentations, the system operates in **Autonomous Zero-Touch Simulated Relay Mode**, generating delivery receipts and audit logs.

To connect live real-world cellular delivery so real SIM cards receive SMS and WhatsApp:

Add the following keys to your root `.env` or `.env.local` file:

```ini
# --- Twilio SMS & WhatsApp Gateway (Real Automated Cloud Delivery) ---
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+14155238886

# --- Fast2SMS Gateway (Instant Bulk SMS across India) ---
FAST2SMS_API_KEY=your_fast2sms_api_key_here
```

### 1. Twilio Setup (Free Trial Available)
1. Register at [twilio.com](https://www.twilio.com).
2. Grab your **Account SID** and **Auth Token** from the console.
3. For WhatsApp, activate the **Twilio Sandbox for WhatsApp** (`whatsapp:+14155238886`).

### 2. Fast2SMS Setup (India Quick SMS)
1. Sign up at [fast2sms.com](https://www.fast2sms.com).
2. Copy your **API Key** into `FAST2SMS_API_KEY`.
3. Fast2SMS sends SMS directly to all 5 Indian mobile numbers in a single HTTP request!

---

## 🎯 How to Demonstrate to Judges / Evaluators

1. **Autonomous SOS Beacon**:
   - On the RESQONE-AI Dashboard, trigger the **Emergency SOS Beacon**.
   - Let the 5-second countdown count down to 0 **without touching anything**.
   - Watch the pipeline transition automatically to **Stage 3: Automated Zero-Touch SMS & WhatsApp Sent to 5 Family Contacts**.
   - The modal shows all 5 family members with `✓ SMS Sent • ✓ WhatsApp Sent` checkmarks.

2. **Automated Crash Telemetry**:
   - In the **Vehicle 3D Crash Simulation**, simulate a collision or click "Test Crash Trigger".
   - The 25-second "ARE YOU OKAY?" alarm sounds.
   - When the countdown reaches 0, the system automatically tags the crash as `source: auto_detected` and transmits the zero-touch alerts to all 5 family members.

3. **1-Click WhatsApp Live Test**:
   - Open **Emergency Contacts** from the top navigation.
   - Click the **"Test WhatsApp"** button next to any relative to open WhatsApp Web/App pre-filled with the exact GPS coordinates and distress message!
