# RESQONE AI+ — Technical Judge Q&A Sheet

### Q1: Why this problem?
**Answer**: Emergency response today is bottlenecked by fragmentation — victims and first-responders waste vital minutes navigating separate apps for blood donation, ambulance dispatch, snakebite info, and hospital ICU availability. RESQONE AI+ solves this by unifying voice/text triage, hospital telemetry, blood compatibility matching, and snakebite AI into one instant, offline-resilient intelligence ecosystem.

---

### Q2: Why this AI model/pipeline approach, and how is it explainable?
**Answer**: Emergency AI must never be a black box. Our AI Copilot pipeline processes natural language text/voice, extracts key risk signals, assigns severity tiers (1-4), and calculates a confidence percentage. Every result renders a transparent **AI Explainability Card** detailing the extracted factors, natural language reasoning, and recommended medical actions. If confidence drops below 65%, the system automatically flags the incident for human control room triage rather than guessing silently.

---

### Q3: What data powers your AI and hospital intelligence?
**Answer**: Our hospital telemetry is backed by real public health facility identities and exact GPS coordinates for 15+ major emergency centers in Bangalore (such as Victoria Hospital Govt Trauma Center, Manipal, Apollo, and St. John's), paired with simulated live operational attributes (ICU beds, antivenom stock, blood reserves). Snakebite intelligence is powered by standard WHO Southeast Asia venomous snake guidelines, and blood donor matching uses the settled medical ABO/Rh compatibility matrix.

---

### Q4: What makes RESQONE AI+ genuinely innovative?
**Answer**: The combination of **explainable multi-domain triage**, **offline-first PWA resilience**, and **scroll-scrubbed realtime vehicle journey video telemetry**. Rather than static maps or simple lookups, responders get interactive visual progress tied directly to page scroll, paired with automated hospital ICU and antivenom reservation.

---

### Q5: How is data secured using Supabase Auth & RLS?
**Answer**: All database tables in Supabase (`profiles`, `emergency_reports`, `blood_donors`, `volunteers`, `hospitals`, `activity_log`) enforce Row Level Security (RLS) policies. Standard users can only read public hospital data and write their own emergency reports, while donor and hospital roles are strictly authorized via Supabase Auth metadata JWT claims.

---

### Q6: How would this scale to the rest of the RESQONE roadmap (mesh networking, crash sensors)?
**Answer**: Our architecture decouples client-side UI from the service layer (`ai_service.py` and `supabase_service.py`). Bluetooth Low Energy (BLE) / Wi-Fi Direct mesh networking will plug directly into our offline queueing engine, while crash auto-detection will stream on-device accelerometer/gyroscope signals directly into our FastAPI `/api/emergency/report` endpoint as automated voice/telemetry payloads.
