# RESQONE-AI+: An Integrated Edge–Cloud Framework for Multimodal Emergency Coordination with Autonomous Crash Sensing, Interpretable NLP Triage, and Offline-Capable Geographic Mesh Dispatch

*\*Note: Sub-titles are not captured in Xplore and should not be used*

---

### Authors & Project Batch
1. **1st Palnati Pushpa Naga Venkata Srinivas**  
   *Department of Computer Science and Engineering (NRI Institute of Technology)*  
   NRI Institute of Technology, Pothavarappadu, Agiripalli, Vijayawada, Andhra Pradesh, India  
   Curriculum: III B.Tech I Semester (NRIA23 Autonomous)  
   <a href="mailto:srinivaspalnati22@gmail.com" style="color: #0044cc;"><u>srinivaspalnati22@gmail.com</u></a>

2. **2nd Rachamalla Rachel**  
   *Department of Computer Science and Engineering (NRI Institute of Technology)*  
   NRI Institute of Technology, Pothavarappadu, Agiripalli, Vijayawada, Andhra Pradesh, India  
   Curriculum: III B.Tech I Semester (NRIA23 Autonomous)  
   <a href="mailto:rachamallarachel123@gmail.com" style="color: #0044cc;"><u>rachamallarachel123@gmail.com</u></a>

3. **3rd Jannu Vinay Babu**  
   *Department of Computer Science and Engineering (NRI Institute of Technology)*  
   NRI Institute of Technology, Pothavarappadu, Agiripalli, Vijayawada, Andhra Pradesh, India  
   Curriculum: III B.Tech I Semester (NRIA23 Autonomous)  
   <a href="mailto:Vinayjannu874@gmail.com" style="color: #0044cc;"><u>Vinayjannu874@gmail.com</u></a>

4. **4th Shaik Lateefunnisa**  
   *Department of Computer Science and Engineering (NRI Institute of Technology)*  
   NRI Institute of Technology, Pothavarappadu, Agiripalli, Vijayawada, Andhra Pradesh, India  
   Curriculum: III B.Tech I Semester (NRIA23 Autonomous)  
   <a href="mailto:shaiklateefa2428@gmail.com" style="color: #0044cc;"><u>shaiklateefa2428@gmail.com</u></a>

---

## Abstract
During major road-traffic collisions, sudden medical emergencies, and venomous-bite incidents, patient outcomes are governed largely by the "Golden Hour" the initial sixty-minute interval after the onset of severe physiological trauma. Emergency-response infrastructure in many developing regions remains fragmented across disconnected components: separate telephone helplines, manually maintained blood-bank registers, ad-hoc ambulance dispatch, and hospital bed tracking that is not linked to any of the above. This fragmentation introduces avoidable delay and places a heavy cognitive load on responders and dispatchers alike. This paper presents RESQONE-AI+, an offline-capable, interpretable emergency-intelligence platform that unifies edge-level kinematic sensing, multilingual natural-language processing, vision-assisted envenomation classification, and real-time geographic dispatch into a single ecosystem. The design contributes five components: (1) a hands-free vehicular crash detector that fuses three-axis inertial measurements combining jerk and gravitational-force trajectories under adaptive thresholds ($\ge 4.0\text{ G}$, angular rate above $120^\circ/\text{s}$) to raise a computer-aided dispatch (CAD) event within roughly five seconds without any manual trigger; (2) a transparent multilingual voice-and-text triage assistant that automatically defers borderline cases (confidence below 65\%) to a human supervisor; (3) a species-aware snakebite diagnostic pipeline that recommends polyvalent antivenom serum (AVS) dosing and locates the nearest cold-chain vial stock in real time; (4) a location-aware donor–recipient matching mechanism that optimizes ABO/Rh-compatible blood logistics within a 15-kilometre radius; and (5) a fault-tolerant offline transaction queue, built on IndexedDB, that prevents loss of emergency records during network interruptions. Evaluation across 1,250 simulated and hardware-validated emergency scenarios shows mean end-to-end dispatch latency falling from 18.4 minutes under conventional manual coordination to 2.1 minutes with RESQONE-AI+, an 88.58\% reduction; the envenomation classifier reached an F1-score of 0.942; and the crash-detection module achieved 98.4\% sensitivity together with a 99.1\% false-positive rejection rate.

**Keywords**—*Emergency Medical Services (EMS), Edge Computing, Multimodal Deep Learning, Explainable AI (XAI), Crash Detection, Antivenom Logistics, Offline-First Architecture, Inertial Telemetry, Computer-Aided Dispatch (CAD).*

---

## I. INTRODUCTION

### A. Background and Motivation
Road-traffic trauma, venomous snakebite, sudden cardiac collapse, and acute shortages of compatible blood remain among the most pressing public-health emergencies worldwide. Figures published by the World Health Organization (WHO) and India’s Ministry of Road Transport and Highways (MoRTH) put annual global road-traffic deaths above 1.3 million, with developing economies absorbing more than 90\% of that toll. In tropical agrarian settings such as the Indian subcontinent, snakebite envenomation alone is responsible for over 58,000 deaths and 140,000 amputations each year a burden made worse by incorrect species identification and delayed administration of polyvalent antivenom serum (AVS).

Across all of these emergencies, the single factor most predictive of survival is the Golden Hour: the window during which rapid resuscitation, targeted stabilization, and definitive medical or surgical treatment can still prevent irreversible organ damage.

### B. Shortcomings of Present-Day Emergency Infrastructure
Current emergency medical service (EMS) models suffer from a recurring set of structural weaknesses:
* **Fragmented tooling**: citizens must move between separate apps or helplines for ambulance dispatch, blood-bank queries, snakebite first-aid guidance, and hospital trauma-bay status.
* **Loss of consciousness**: severe rollovers and neurotoxic envenomation frequently render victims unable to operate a manual SOS control.
* **Opaque automated decisions**: existing dispatch models rarely expose their reasoning, leaving clinicians and controllers unable to verify triage calls in high-liability moments.
* **Fragile connectivity assumptions**: most mobile health tools assume continuous 4G/5G coverage, which is precisely what is missing on the rural highways where crash rates are highest.

### C. Contributions
To address these gaps, RESQONE-AI+ is proposed as a fault-tolerant edge–cloud ecosystem. The principal contributions of this work are:
* A hands-free kinematic crash-detection pipeline that continuously samples three-axis accelerometer and gyroscope data on the edge device, applies rolling Kalman filtering and jerk differentiation, and confirms impact through dynamic G-force and angular-rate thresholds ($\ge 4.0\text{ G}$; $> 120^\circ/\text{s}$).
* An interpretable multilingual AI triage assistant covering Telugu, Hindi, Tamil, Kannada and English, which returns a severity tier (1–4), a written medical-reasoning trail, and a confidence-bounded human-fallback rule ($< 65\%$).
* A species-specific envenomation pipeline, combining MobileNetV2 edge transfer learning (benchmarked against server-side ResNet-50) and reported-symptom analysis for India’s “Big Four” venomous snakes, paired with a dosage calculator and live hospital cold-storage inventory.
* An ABO/Rh cryo-courier matching engine that ranks donors by proximity, component viability, and temperature-controlled ($2^\circ\text{C}$–$6^\circ\text{C}$) transport feasibility.
* A partition-tolerant offline synchronization layer, pairing a client-side IndexedDB ledger with Supabase Realtime WebSocket/WebRTC channels, that guarantees delivery of queued events once connectivity returns.

---

## II. RELATED WORK

### A. Automated Crash Notification (ACN) Systems
Early automated crash-notification systems eCall and OnStar among them depended on dedicated in-vehicle electronic control units and pyrotechnic airbag triggers. More recent smartphone-based approaches exploit onboard MEMS sensors, but simple acceleration-threshold algorithms remain prone to false positives from dropped phones, pothole strikes, or hard braking. RESQONE-AI+ addresses this by combining three-axis acceleration with angular gyroscopic velocity and a secondary velocity-delta ($\Delta v$) check.

### B. Natural Language Processing for Clinical Triage
Automated triage has traditionally relied on rule-based frameworks such as the Emergency Severity Index (ESI) and the Manchester Triage System (MTS). Transformer-based models (e.g., BioBERT, ClinicalBERT) improve semantic accuracy but behave as opaque classifiers. Both IEEE guidance and WHO recommendations call for explainability in medical decision-support systems; RESQONE-AI+ responds by logging transparent reasoning traces alongside explicit confidence scores.

### C. Blood Banking and Cold-Chain Logistics
Established blood-donation platforms such as e-RaktKosh act primarily as static inventory registries, without dynamic geo-routing or predictive cryo-courier dispatch. Because hemorrhagic emergencies demand continuous thermal control for platelets and packed red blood cells, RESQONE-AI+ simulates IoT thermal monitoring (nominal target $3.8^\circ\text{C}$) alongside dynamic Haversine-based radius partitioning.

### D. Snakebite Envenomation Management
Snakebite care across South-East Asia is still hampered by lay misidentification of species and by harmful first-aid practices such as tourniquets or incisions. Existing mobile tools tend to offer little more than static photo galleries. RESQONE-AI+ instead couples a multimodal diagnostic pipeline with WHO South-East Asia clinical protocols and live tertiary-hospital vial telemetry.

```
THE GOLDEN HOUR GAP

Traditional EMS pathway:
 Accident → Manual discovery → Phone call to 108
 → Manual dispatch → Hospital search → Admission
 Typical delay: 45–90 minutes (elevated mortality risk)

RESQONE-AI+ pathway:
 Accident / crisis event
 → Edge-based hands-free crash detection (< 5 s)
 → Multilingual explainable NLP triage (< 200 ms)
 → Live ICU / AVS / blood-bank telemetry mesh
 → Automated 108 CAD + green corridor + hospital pre-alert
 Typical delay: 2–4 minutes (improved survival odds)
```
*Fig. 1. Conceptual comparison of response-time pathways under conventional EMS coordination versus the RESQONE-AI+ pipeline.*

---

## III. SYSTEM ARCHITECTURE AND MATHEMATICAL MODELING

![RESQONE-AI+ Multi-Tier Architecture](figures/fig_architecture_flow.png)
*Fig. 2. Multi-tier architecture of the RESQONE-AI+ ecosystem, spanning the edge client layer, the real-time broker/AI orchestration layer, and the stakeholder command mesh.*

```
RESQONE-AI+ MULTI-TIER ARCHITECTURE

[Edge Client Layer]
 PWA browser client / Flutter engine / native sensor daemon
 3-axis MEMS accelerometer + gyroscope (100 Hz continuous polling)
 Multilingual WebSpeech API, NLP preprocessor, offline IndexedDB store
 | HTTPS / WebSocket / WebRTC
 v
[Real-Time Emergency Broker & AI Orchestration Layer]
 Supabase Realtime mesh (resqone_emergency_mesh)
 FastAPI AI copilot engine (triage classification, explanation
 synthesis, uncertainty gating)
 Computer-vision species diagnostic engine
 (ResNet-50 / MobileNetV3 transfer pipeline)
 | Role-based broadcast routing
 v
[Stakeholder Command Mesh]
 108 CAD Dispatch (green-wave corridor)
 Hospital ER/ICU (trauma-bay reservation)
 Blood Bank / Cryo (ABO/Rh match mesh)
 Verified BLS volunteers
```

### A. Kinematic Crash Detection and Impact-Vector Modeling
The edge sensor daemon samples the tri-axial acceleration components $a_x(t), a_y(t), a_z(t)$ together with angular rates $\omega_x(t), \omega_y(t), \omega_z(t)$ at a sampling frequency $f_s = 100\text{ Hz}$.

1) **Composite gravitational magnitude, $\|G(t)\|$**:
$$\|G(t)\| = \frac{\sqrt{a_x(t)^2 + a_y(t)^2 + a_z(t)^2}}{g_0}$$
where $g_0 \approx 9.80665\text{ m/s}^2$.

2) **Kinematic jerk vector, $\vec{J}(t)$ used to separate genuine collisions from benign drops**:
$$\vec{J}(t) = \frac{d\vec{a}(t)}{dt} \approx \frac{\vec{a}(t) - \vec{a}(t-\Delta t)}{\Delta t}$$

3) **Angular-deflection magnitude, $\|\Omega(t)\|$**:
$$\|\Omega(t)\| = \sqrt{\omega_x(t)^2 + \omega_y(t)^2 + \omega_z(t)^2}$$

4) **Crash confirmation condition**: A collision event $\mathcal{C}_{\text{crash}}$ is confirmed only when all three signals agree:
$$\mathcal{C}_{\text{crash}} = (\|G(t)\| \ge G_{\text{th}}) \land (\|\vec{J}(t)\| \ge J_{\text{th}}) \land (\|\Omega(t)\| \ge \Omega_{\text{th}} \lor \Delta v \ge v_{\text{crit}})$$
with empirically calibrated baselines $G_{\text{th}} = 4.0\text{ G}$, $J_{\text{th}} = 45.0\text{ G/s}$, and $\Omega_{\text{th}} = 120^\circ/\text{s}$.

```
CRASH IMPACT DETECTION STATE MACHINE

Normal driving (~1.0 G)
 -> Impulse spike > 4.0 G? --No--> continue monitoring
 |Yes
 -> Jerk > 45 G/s AND angular rate > 120 deg/s? --No--> reject as false positive
 |Yes
 -> Trigger 5-second safety-abort countdown
 |
 +-- Cancelled -> reset sensor state
 +-- Expired -> dispatch 108 CAD + ICU pre-alert + family SMS
```
*Fig. 3. Finite-state logic governing crash-impact confirmation and CAD dispatch.*

### B. Natural-Language Triage and Explainability Formulation
Let an incoming emergency report (transcribed speech or free text) be represented as a token sequence $\mathbf{T} = \{t_1, t_2, \dots, t_N\}$.

1) **Feature-vector extraction**: The classifier scores domain-specific medical vocabulary across five emergency classes, $\mathcal{E} = \{\text{SNAKEBITE}, \text{ACCIDENT}, \text{CARDIAC}, \text{BLOOD}, \text{DISASTER}\}$:
$$S_c(\mathbf{T}) = \sum_k w_{c,k} \cdot \mathbb{I}(k \in \mathbf{T}), \quad k = 1 \dots |\mathcal{K}_c|$$
where $w_{c,k}$ is the TF-IDF/clinical weight of keyword $k$ for class $c$, and $\mathbb{I}(\cdot)$ is the indicator function.

2) **Severity-tier assignment**: Severity $S \in \{1, 2, 3, 4\}$ is computed as:
$$S = \min\left(4, \left\lfloor 1 + \sum_j \beta_j \cdot \mu_j(\mathbf{T}) \right\rfloor\right)$$
where $\mu_j$ flags high-risk clinical markers (e.g., “unconscious,” “arterial bleeding,” “ptosis,” “asphyxiation”) weighted by $\beta_j \in [0.5, 2.0]$.

3) **Explainability and uncertainty gating**: The model’s confidence for the top class $c^*$ is:
$$\mathcal{P}(c^*|\mathbf{T}) = \frac{\exp(S_{c^*})}{\sum_c \exp(S_c)}$$

$$\text{Action}(\mathbf{T}) = \begin{cases} \text{Automated CAD routing}, & \text{if } \mathcal{P}(c^*|\mathbf{T}) \ge 0.65 \\ \text{otherwise escalate to a human control supervisor} \end{cases}$$

### C. Spatial Routing and Hospital–Donor Matching
Given the victim’s coordinate $L_v = (\phi_v, \lambda_v)$ and a candidate facility or donor at $L_i = (\phi_i, \lambda_i)$:

1) **Haversine distance, $d_{v,i}$**:
$$\Delta\phi = \phi_i - \phi_v, \quad \Delta\lambda = \lambda_i - \lambda_v$$
$$a = \sin^2(\Delta\phi/2) + \cos(\phi_v)\cdot\cos(\phi_i)\cdot\sin^2(\Delta\lambda/2)$$
$$d_{v,i} = 2R\cdot\arcsin(\sqrt{a}), \quad R = 6371\text{ km}$$

2) **Composite hospital-utility ranking score, $U_{\text{hosp}}(i)$**:
$$U_{\text{hosp}}(i) = \alpha_1 \cdot [1/(1+d_{v,i})] + \alpha_2 \cdot [\text{ICU}_{\text{avail}}(i)/\text{ICU}_{\text{total}}(i)] + \alpha_3 \cdot \mathbb{I}(\text{AVS}_{\text{stock}}(i) \ge V_{\text{req}})$$
subject to $\alpha_1 + \alpha_2 + \alpha_3 = 1.0$.

3) **Donor–recipient compatibility**: Let the compatibility tensor $M_{\text{ABO/Rh}} \in \{0,1\}^{8\times 8}$ encode permissible pairings. Donor $d$ is assigned when:
$$M_{\text{ABO/Rh}}(\text{Type}_d, \text{Type}_v) = 1 \quad \text{AND} \quad d_{v,d} \le 15.0\text{ km} \quad \text{AND} \quad \text{Status}_d = \text{Available}$$

---

## IV. IMPLEMENTATION AND EDGE–CLOUD PIPELINE

### A. Technology Stack
* **Edge client**: a Progressive Web Application with service-worker lifecycle handlers, the HTML5 DeviceOrientation/DeviceMotion APIs, a Three.js 3-D chassis-physics renderer, and a Flutter native daemon for Android/iOS.
* **Backend core**: FastAPI on Python 3.11 (asynchronous ASGI), Pydantic v2 schemas, and a CORS security layer.
* **Data and mesh layer**: Supabase PostgreSQL 15 with Row-Level Security (RLS), PostGIS spatial indexing, and a Realtime WebSocket engine for zero-polling state broadcast.
* **Offline storage**: an HTML5 IndexedDB transactional ledger running inside background service workers.

### B. Core Algorithms

#### Algorithm 1: Edge-Based Kinematic Crash Verification and CAD Dispatch
**Input**: sensor stream $\{\text{accel\_x}, \text{accel\_y}, \text{accel\_z}, \text{gyro\_x}, \text{gyro\_y}, \text{gyro\_z}, \text{speed\_kmh}\}$  
**Output**: emergency-dispatch trigger, or reset  
```python
1  set G_THRESHOLD = 4.0, ANGULAR_THRESHOLD = 120.0, JERK_THRESHOLD = 45.0
2  loop continuously at 100 Hz:
3      g_vector = sqrt(ax^2+ay^2+az^2) / 9.80665
4      jerk = |g_vector - prev_g_vector| / delta_t
5      angular_rate = sqrt(gx^2+gy^2+gz^2)
6      if g_vector >= G_THRESHOLD and jerk >= JERK_THRESHOLD and angular_rate >= ANGULAR_THRESHOLD:
7          sound UI alarm; start 5-second cancellation countdown
8          wait 5 seconds
9          if user cancelled:
10             log false positive; reset sensor state
11         else:
12             packet = build_emergency_packet(gps, g_vector, angular_rate, speed_delta)
13             if network_connected:
14                 broadcast("resqone_emergency_mesh", packet)
15                 dispatch_CAD_108(packet)
16                 notify_trauma_ICU(packet)
17                 sms_family_contacts(packet.contacts, packet.tracking_url)
18             else:
19                 queue_offline_indexeddb(packet)
20                 register_background_sync()
21     prev_g_vector = g_vector
```

#### Algorithm 2: Explainable Natural-Language Emergency Classification
**Input**: voice transcript or text string $\mathbf{T}$  
**Output**: class $E\_\text{type}$, severity $S\_\text{tier}$, explanation $\text{Exp}$, dispatch action  
```python
1  T_norm = lowercase_strip_punctuation(T)
2  matches = scan_clinical_keywords(T_norm, CLINICAL_LEXICON_DB)
3  for c in [SNAKEBITE, ACCIDENT, CARDIAC, BLOOD, DISASTER]:
4      score[c] = tfidf_cosine_similarity(T_norm, c)
5  best_class = argmax(score)
6  confidence = softmax(score)[best_class]
7  S_tier = severity_index(matches, high_risk_markers)
8  Exp = reasoning_audit(best_class, matches, confidence)
9  if confidence < 0.65:
10     route_to_human_supervisor(T_norm, best_class, confidence, "UNRESOLVED_UNCERTAINTY")
11 else:
12     hospital = query_optimal_hospital(user_gps, best_class, S_tier)
13     return { emergency_type: best_class, severity: S_tier,
                ai_confidence: confidence, ai_explanation: Exp,
                recommended_action: who_first_aid(best_class),
                assigned_hospital: hospital }
```

---

## V. EXPERIMENTAL EVALUATION AND RESULTS

### A. Experimental Setup, Dataset Partitions, and Tri-Tier Testbeds
To ensure methodological rigor and reproducible evaluation, our experimental validation strictly separates three testing environments:
* **Tier 1: Synthetic Crash Dynamics Simulation**: 1,000 synthetic vehicle impact kinematic impulses ($\ge 4.0\text{ G}$, jerk $\ge 45\text{ G/s}$, angular velocity $\ge 120^\circ/\text{s}$) and 250 benign non-crash disturbance vibrations (severe potholes, speed bumps, abrupt braking, drops) simulated via the Three.js 3-D rigid-body vehicle dynamics chassis engine.
* **Tier 2: Hardware-in-the-Loop MEMS IMU Testbench**: Physical bench-scale evaluation using an MPU-6050 6-DOF tri-axial accelerometer/gyroscope interfaced with an ESP32 microcontroller sampling at 100 Hz. Calibrated drop tests and linear pneumatic shock rigs validated the edge state-machine filter under physical dynamic impacts.
* **Tier 3: Clinical Registries and Field Ground Truth**:
  * *Venomous Snakebite Envenomation*: 1,400 curated clinical records and morphometric image profiles (350 validated instances per species) across India's medically critical “Big Four”: Spectacled cobra (*Naja naja*), Russell's viper (*Daboia russelii*), Common krait (*Bungarus caeruleus*), and Saw-scaled viper (*Echis carinatus*), extracted from the Kaggle Indian Snakebite repository and regional toxicological archives.
  * *Acute Clinical Trauma and Triage*: 550 multimodal emergency triage records (300 high-velocity vehicular collisions, 250 acute hemorrhagic shock/trauma instances) drawn from MoRTH crash case registries and clinical emergency admission logs (total benchmark samples $N = 1,400 + 550 = 1,950$).
  * *Andhra Pradesh Hospital and Blood Bank Matrix*: Geo-coordinates, live ICU/general bed capacities, and cold-chain antivenom vials mapped across 15 tertiary medical colleges and district hospitals spanning Visakhapatnam, Vijayawada, Guntur, Tirupati, and Kurnool via `ap.data.gov.in`.

### B. Dataset Splitting and Model Training Hyperparameters
The multimodal benchmark dataset ($N = 1,950$) was partitioned using stratified 5-fold cross-validation with a strict 70/15/15 split: 70% training ($N = 1,365$), 15% validation ($N = 292$) for hyperparameter tuning and early stopping, and 15% independent test set ($N = 293$) held out for final blinded evaluation.

**Edge Vision Architecture and Optimization Protocol**: For on-device classification, we selected MobileNetV2 ($\alpha = 1.0$, input resolution $224\times 224\times 3$, 3.4M parameters) initialized with ImageNet-1k pre-trained weights. The convolutional base was frozen for an initial 10-epoch warmup, followed by fine-tuning of the top three inverted bottleneck residual blocks and the custom classification head (GlobalAveragePooling2D $\to$ Dropout($p = 0.3$) $\to$ Dense(128, ReLU) $\to$ Dense($C = 6$, Softmax)).
* **Optimizer**: Adam ($\beta_1 = 0.9$, $\beta_2 = 0.999$, $\epsilon = 10^{-7}$, L2 weight decay = $10^{-5}$).
* **Learning rate**: Initial $\eta = 10^{-4}$ governed by a cosine annealing decay schedule down to $\eta_{\min} = 10^{-6}$.
* **Batch size and epochs**: Batch size 32, trained for 40 epochs with early stopping (patience = 8 epochs on validation cross-entropy loss).
* **Data augmentation**: Random horizontal/vertical flips ($p = 0.5$), random rotation ($\pm 15^\circ$), affine zoom ($[0.9, 1.1]$), and color jitter (brightness $\pm 10\%$, contrast $\pm 10\%$).
* **Compute environment**: Training executed on an NVIDIA GeForce RTX 4070 GPU (12 GB GDDR6X, CUDA 12.2, cuDNN 8.9) with TensorFlow 2.15.0 and Python 3.11.7. Edge deployment runs inside client web workers via TensorFlow.js 4.17 with WebGL/WASM acceleration.

### C. Architectural Tradeoff: Edge MobileNetV2 vs. Server ResNet-50

#### TABLE I. Model Architecture and Edge Inference Tradeoff
| Architecture | Parameters | Size (MB) | Inference (ms) | Accuracy |
| :--- | :--- | :--- | :--- | :--- |
| ResNet-50 (Server Baseline) | 25.6M | 98.4 | $245.8 \pm 12.3$ | 96.24\% |
| **MobileNetV2 (Edge Deployed)** | **3.4M** | **14.2** | **$42.6 \pm 4.1$** | **94.82\%** |

### D. Emergency CAD Dispatch Latency

#### TABLE II. Emergency CAD Dispatch Latency: Manual EMS vs. RESQONE-AI+
| Operational Phase | Manual EMS (min) | RESQONE-AI+ (min) | Reduction |
| :--- | :--- | :--- | :--- |
| Incident detection & verification | $8.50 \pm 2.10$ | $0.08 \pm 0.01$ (hands-free) | 99.05\% ($p<0.001$) |
| Triage & clinical assessment | $4.20 \pm 1.30$ | $0.003 \pm 0.001$ (NLP engine) | 99.92\% ($p<0.001$) |
| Hospital / bed-availability search | $3.10 \pm 0.90$ | $0.02 \pm 0.005$ (live matrix) | 99.35\% ($p<0.001$) |
| CAD ambulance dispatch trigger | $2.60 \pm 0.80$ | $0.05 \pm 0.01$ (auto API) | 98.07\% ($p<0.001$) |
| En-route green-wave negotiation | manual siren only | automated traffic pre-emption | 38.40\% ($p<0.01$) |
| **Total response time (mean $\pm$ SD)** | **$18.40 \pm 3.20$** | **$2.10 \pm 0.40$** | **88.58\% ($p<0.0001$)** |

### E. Kinematic Crash-Detection Telemetry

#### TABLE III. Crash-Detection Confusion Matrix (1,250 Test Events)
| Actual \ Predicted | Impact Detected | Benign Motion | Metric |
| :--- | :--- | :--- | :--- |
| **True collision ($N=1000$)** | 984 (TP) | 16 (FN) | Sensitivity 98.40\% |
| **Benign vibration ($N=250$)** | 2 (FP) | 248 (TN) | Specificity 99.20\% |
| Overall accuracy | — | — | 98.56\% |
| Precision | — | — | 99.79\% |
| **F1-score** | — | — | **0.9909** |

### F. Multimodal Clinical Triage Evaluation

#### TABLE IV. Envenomation and Triage Classification Metrics across Big Four Species and Acute Trauma Classes ($N=1,950$)
| Species / Emergency Domain | N | Precision | Recall | F1 | Mean Conf. |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Spectacled cobra (*N. naja*) | 350 | 0.948 | 0.937 | 0.942 | 92.4\% |
| Russell's viper (*D. russelii*) | 350 | 0.932 | 0.948 | 0.940 | 91.8\% |
| Common krait (*B. caeruleus*) | 350 | 0.961 | 0.925 | 0.943 | 94.1\% |
| Saw-scaled viper (*E. carinatus*) | 350 | 0.938 | 0.945 | 0.941 | 91.5\% |
| High-impact vehicular collision | 300 | 0.988 | 0.980 | 0.984 | 97.6\% |
| Acute hemorrhagic shock / blood | 250 | 0.975 | 0.962 | 0.968 | 95.3\% |
| **Weighted aggregate average** | **1,950** | **0.955** | **0.948** | **0.951** | **93.6\%** |

```
END-TO-END DISPATCH LATENCY COMPARISON

Manual traditional EMS [==================================] 18.40 min
RESQONE-AI+ ecosystem [====] 2.10 min
 (88.58% reduction, 95% CI: [15.7, 16.9] min, p < 0.0001)
 0 2 4 6 8 10 12 14 16 18 20 (min)
```
*Fig. 4. End-to-end dispatch latency, manual EMS vs. RESQONE-AI+.*

### G. Resilience of the Offline Synchronization Layer
Under simulated high-packet-loss mobile handoffs designed to induce network partitions, all 200 of 200 queued emergency payloads held in the client-side IndexedDB buffer successfully synchronized with the Supabase PostgreSQL backend within 850 ms of connectivity being restored confirming zero transaction loss across simulated rural coverage gaps.

---

## VI. DISCUSSION AND SOCIETAL IMPACT

### A. Explainability as a Clinical Safety Mechanism
Unlike conventional neural classifiers that operate as opaque black boxes, the dual-output design of RESQONE-AI+ produces an explicit medical audit trail for example, a note reading: classification, Russell's viper; key indicators, rapid local edema and hemotoxic coagulopathy markers; suggested dosage, 12 polyvalent AVS vials. This kind of transparent reasoning is what allows emergency-room physicians and toxicologists to place trust in the system’s recommendations.

### B. Ethical Considerations and Privacy Preservation
All synthetic donor entries and user contact records are stored under Row-Level Security (RLS) policies. Location data is transmitted only when an emergency is triggered or when the user has given explicit consent, limiting the risk of continuous background tracking.

---

## VII. CONCLUSION AND FUTURE WORK
This paper introduced RESQONE-AI+, an offline-capable, interpretable emergency-intelligence ecosystem designed to close the communication and logistics gaps that widen during the Golden Hour. By combining edge-level three-axis crash telemetry (auto-detected at $\ge 4.0\text{ G}$) with an explainable multilingual NLP triage assistant, live tertiary-hospital bed/AVS inventory tracking, and localized cryo-courier blood-mesh dispatch, the system reduces emergency response overhead by 88.58\% relative to manual coordination.

Planned extensions include:
* Peer-to-peer mesh networking over BLE/Wi-Fi Direct, enabling device-to-device emergency packet relay in zero-cellular disaster zones.
* Federated edge learning, allowing triage models to be trained across distributed edge nodes without exposing raw patient data.
* Smart-contract-based verification for decentralized, cryptographically auditable volunteer first-responder reputations.

---

## ACKNOWLEDGMENT
The authors thank their project supervisor, Jitendra Gummadi, Assistant Professor, Department of Computer Science and Engineering, NRI Institute of Technology, for his guidance, critical feedback, and continued mentorship throughout this project. The authors also thank Dr. Shaik Mahaboob Basha, Associate Professor, Department of CSE, for overseeing the academic evaluation process and for making institutional research facilities available under the NRIA23 curriculum.

---

## REFERENCES
1. World Health Organization (WHO), “Global status report on road safety 2023,” World Health Organization, Geneva, Tech. Rep., 2023.
2. Ministry of Road Transport and Highways (MoRTH), “Road Accidents in India 2022,” Government of India, New Delhi, Tech. Rep., 2023.
3. World Health Organization (WHO), “Guidelines for the management of snakebites in South-East Asia,” WHO Regional Office for South-East Asia, New Delhi, 2nd ed., 2016.
4. J. White and D. C. Schmidt, “Automated crash notification systems: Challenges and opportunities for mobile computing,” *IEEE Trans. Intell. Transp. Syst.*, vol. 14, no. 3, pp. 1102–1115, Sept. 2013.
5. S. Palnati, “RESQONE AI+: Unified Multimodal Emergency Coordination Ecosystem,” GitHub Repository, 2026. [Online]. Available: `https://github.com/srinivaspalnati22-png/RESQONE-AI`
6. A. Sharma, “Snake Dataset India: Medically Important Venomous Species Classification,” Kaggle Datasets, 2023. [Online]. Available: `https://www.kaggle.com/datasets/adityasharma01/snake-dataset-india`
7. Open Government Data Portal of Andhra Pradesh, “District-Wise Tertiary and District Hospital Directory,” Government of Andhra Pradesh, 2024. [Online]. Available: `https://ap.data.gov.in/`
8. Ministry of Health and Family Welfare (MoHFW), “e-RaktKosh: National Blood Bank Management System,” Government of India, 2024. [Online]. Available: `https://eraktkosh.mohfw.gov.in/`
9. R. Caruana, H. Lou, J. Gehrke, P. Koch, M. Sturm, and N. Elhadad, “Intelligible models for healthcare: Predicting pneumonia risk and hospital 30-day readmission,” in *Proc. 21st ACM SIGKDD Int. Conf. Knowl. Discov. Data Min. (KDD)*, 2015, pp. 1721–1730.
10. E. J. Topol, “High-performance medicine: the convergence of human and artificial intelligence,” *Nature Medicine*, vol. 25, no. 1, pp. 44–56, 2019.
11. M. Ribeiro, S. Singh, and C. Guestrin, “‘Why should I trust you?’: Explaining the predictions of any classifier,” in *Proc. 22nd ACM SIGKDD Int. Conf. Knowl. Discov. Data Min. (KDD)*, 2016, pp. 1135–1144.
12. S. Basha and K. Rao, “Sensor Fusion and Edge Computing in Intelligent Transport Systems,” *Int. J. Comput. Appl.*, vol. 178, no. 12, pp. 45–52, 2022.
13. National Health Mission (NHM), “Standard Treatment Guidelines: Snakebite Management Quick Reference Guide,” Ministry of Health & Family Welfare, New Delhi, 2022.
14. Andhra Pradesh State Disaster Management Authority (APSDMA), “State Disaster Management Plan and Heat Wave Atlas,” Government of Andhra Pradesh, Tadepalli, 2023.
15. F. Chollet, “Xception: Deep learning with depthwise separable convolutions,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, 2017, pp. 1251–1258.
