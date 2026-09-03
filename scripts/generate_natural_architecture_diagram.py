import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

output_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'figures', 'fig_architecture_flow.png')
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# 16 x 12.5 inches at 300 DPI for ultra-clear publication quality
fig, ax = plt.subplots(figsize=(16, 12.5), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')
ax.set_xlim(0, 16)
ax.set_ylim(0, 12.5)
ax.axis('off')

# Main Title & Subtitle banner (clean, human-engineered publication style)
ax.text(8.0, 12.10, "RESQONE-AI+ : End-to-End Emergency Intelligence & CAD Architecture",
        ha='center', va='center', fontsize=16, fontweight='bold', color='#0f172a',
        fontfamily='sans-serif')
ax.text(8.0, 11.75, "Hierarchical Workflow: Multimodal Edge Sensing  ->  Autonomous Inference  ->  Fault-Tolerant Mesh  ->  Cloud PostGIS  ->  Multi-Agency CAD",
        ha='center', va='center', fontsize=9.5, style='italic', color='#475569',
        fontfamily='sans-serif')

def draw_card(ax, x, y, w, h, title, subtitle, bullets, bg_color, border_color, title_color, badge=""):
    # Subtle natural drop shadow
    shadow = FancyBboxPatch((x + 0.05, y - 0.05), w, h,
                            boxstyle="round,pad=0.06,rounding_size=0.14",
                            facecolor='#cbd5e1', edgecolor='none', zorder=1, alpha=0.6)
    ax.add_patch(shadow)
    
    # Main card container
    card = FancyBboxPatch((x, y), w, h,
                          boxstyle="round,pad=0.06,rounding_size=0.14",
                          facecolor=bg_color, edgecolor=border_color, linewidth=1.6, zorder=2)
    ax.add_patch(card)
    
    # Header background band
    header_h = 0.40
    header_band = FancyBboxPatch((x, y + h - header_h), w, header_h,
                                 boxstyle="round,pad=0.04,rounding_size=0.10",
                                 facecolor=border_color, edgecolor='none', zorder=3, alpha=0.14)
    ax.add_patch(header_band)
    
    # Title
    ax.text(x + 0.15, y + h - 0.22, title, fontsize=9.2, fontweight='bold',
            color=title_color, va='center', zorder=4, fontfamily='sans-serif')
    
    # Badge (e.g. HARDWARE, VISION, CAD FLEET)
    if badge:
        ax.text(x + w - 0.12, y + h - 0.22, badge, fontsize=7.2, fontweight='bold',
                color=title_color, ha='right', va='center', zorder=4,
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#ffffff', edgecolor=border_color, linewidth=1.0))
    
    # Subtitle
    curr_y = y + h - 0.52
    if subtitle:
        ax.text(x + 0.15, curr_y, subtitle, fontsize=7.8, fontweight='bold', color='#334155',
                va='center', zorder=4, fontfamily='sans-serif')
        curr_y -= 0.22
        
    # Bullets
    for b in bullets:
        ax.text(x + 0.20, curr_y, f"•  {b}", fontsize=7.4, color='#1e293b',
                va='center', zorder=4, fontfamily='sans-serif')
        curr_y -= 0.22

def draw_tier_container(ax, x, y, w, h, tier_label, sub_label, color):
    # Container box with soft colored background and dashed border
    box = FancyBboxPatch((x, y), w, h,
                         boxstyle="round,pad=0.08,rounding_size=0.18",
                         facecolor=color, edgecolor='#94a3b8', linewidth=1.2,
                         linestyle='--', zorder=0, alpha=0.32)
    ax.add_patch(box)
    
    # Top tier label positioned cleanly above cards without overlap
    ax.text(x + 0.25, y + h - 0.18, tier_label, fontsize=9.0, fontweight='bold',
            color='#1e293b', va='center', zorder=2, fontfamily='sans-serif')
    if sub_label:
        ax.text(x + w - 0.25, y + h - 0.18, sub_label, fontsize=8.0, style='italic',
                color='#64748b', ha='right', va='center', zorder=2, fontfamily='sans-serif')

def draw_straight_arrow(ax, x1, y1, x2, y2, text="", color='#0284c7'):
    arrow = FancyArrowPatch((x1, y1), (x2, y2),
                            arrowstyle='-|>,head_width=4,head_length=6',
                            linewidth=1.8, color=color, zorder=5)
    ax.add_patch(arrow)
    if text:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        ax.text(mx, my, text, fontsize=7.0, fontweight='bold',
                color='#1e293b', ha='center', va='center', zorder=6,
                bbox=dict(boxstyle='round,pad=0.16', facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=0.8, alpha=0.95))

# =========================================================================
# TIER 1: MULTIMODAL EDGE SENSING & INGESTION LAYER
# =========================================================================
draw_tier_container(ax, 0.5, 9.30, 15.0, 2.15,
                    "TIER 1: MULTIMODAL EDGE SENSING & INGESTION LAYER",
                    "Continuous 100 Hz IMU Stream • MobileNet Camera • WebSpeech API • GPS Telemetry",
                    '#f0f9ff')

draw_card(ax, 0.75, 9.45, 3.4, 1.55,
          "In-Vehicle 3-Axis IMU", "100 Hz Hardware Sensor Stream",
          ["Tri-axial Accel (ax, ay, az)", "3D Gyroscope (Roll, Pitch, Yaw)", "Kinematic Jerk Vector dG/dt"],
          '#f8fafc', '#0284c7', '#0369a1', "HARDWARE")

draw_card(ax, 4.45, 9.45, 3.4, 1.55,
          "Mobile Neural Camera", "Edge Visual Species Ingestion",
          ["Camera video feed / photo capture", "Snake morphology visual cues", "RGB normalization (224x224)"],
          '#f8fafc', '#0284c7', '#0369a1', "VISION")

draw_card(ax, 8.15, 9.45, 3.4, 1.55,
          "Multilingual Audio Mic", "Hands-Free Voice Ingestion",
          ["Telugu, Hindi, Tamil, Kannada, EN", "Speech recognition NLP tokenizer", "Hands-free voice SOS trigger"],
          '#f8fafc', '#0284c7', '#0369a1', "AUDIO")

draw_card(ax, 11.85, 9.45, 3.4, 1.55,
          "GNSS / GPS Receiver", "Real-Time Spatial Coordinate Stream",
          ["High-precision lat/long telemetry", "Highway vehicle speed & altitude", "NH-16 blackspot geo-fencing"],
          '#f8fafc', '#0284c7', '#0369a1', "GPS")


# --- ARROWS: TIER 1 -> TIER 2 ---
draw_straight_arrow(ax, 2.45, 9.45, 2.45, 8.85, "[1] 100 Hz Stream", color='#0284c7')
draw_straight_arrow(ax, 6.15, 9.45, 6.15, 8.85, "[1] Image RGB", color='#0284c7')
draw_straight_arrow(ax, 9.85, 9.45, 9.85, 8.85, "[1] Voice Tokens", color='#0284c7')
draw_straight_arrow(ax, 13.55, 9.45, 13.55, 8.85, "[1] GPS Stream", color='#0284c7')


# =========================================================================
# TIER 2: AUTONOMOUS EDGE INFERENCE & CLINICAL DECISION ENGINES
# =========================================================================
draw_tier_container(ax, 0.5, 6.70, 15.0, 2.15,
                    "TIER 2: AUTONOMOUS EDGE INFERENCE & CLINICAL DECISION ENGINES",
                    "Deterministic Physics Crash Gate • MobileNet Herpetology • Explainable Clinical NLP • ABO/Rh Matrix",
                    '#fffbeb')

draw_card(ax, 0.75, 6.85, 3.4, 1.55,
          "Zero-Touch Crash Daemon", "Kinematic Physics Threshold Gate",
          ["||G(t)|| >= 4.0G & Jerk >= 45G/s", "Angular deflection Omega >= 120°/s", "25s life-critical countdown timer"],
          '#fefce8', '#d97706', '#b45309', "< 12 ms")

draw_card(ax, 4.45, 6.85, 3.4, 1.55,
          "MobileNet AI Classifier", "Herpetology Neural Vision Model",
          ["Big Four venom potency (LD50)", "Top-1 accuracy 91.5% confidence", "WHO AVS dosage titration (10V)"],
          '#fefce8', '#d97706', '#b45309', "VISION AI")

draw_card(ax, 8.15, 6.85, 3.4, 1.55,
          "Explainable NLP Triage", "TF-IDF + Cosine Medical Gate",
          ["5 clinical triage classes", "Uncertainty gate cutoff (P >= 65%)", "Supervisor escalation fallback"],
          '#fefce8', '#d97706', '#b45309', "< 3 ms")

draw_card(ax, 11.85, 6.85, 3.4, 1.55,
          "Deterministic ABO/Rh Matcher", "Transfusion Compatibility Matrix",
          ["Universal donor O- prioritization", "Cold-chain thermal monitor (2-6°C)", "Cross-match validation matrix"],
          '#fefce8', '#d97706', '#b45309', "RULE-BASE")


# --- ARROWS: TIER 2 -> TIER 3 ---
draw_straight_arrow(ax, 2.45, 6.85, 2.45, 6.25, "[2] Offline Queue", color='#059669')
draw_straight_arrow(ax, 6.15, 6.85, 4.45, 6.25, "[2] Species Packet", color='#059669')
draw_straight_arrow(ax, 9.85, 6.85, 9.85, 6.25, "[2] Validated CAD (P >= 65%)", color='#7c3aed')
draw_straight_arrow(ax, 13.55, 6.85, 13.55, 6.25, "[2] Blood Request", color='#7c3aed')


# =========================================================================
# TIER 3: OFFLINE RESILIENCE & CLOUD SPATIAL CAD MESH
# =========================================================================
draw_tier_container(ax, 0.5, 4.30, 15.0, 1.95,
                    "TIER 3: FAULT-TOLERANT OFFLINE RESILIENCE & CLOUD SPATIAL CAD MESH",
                    "HTML5 IndexedDB Storage Ledger • ServiceWorker Replay (<850ms) • FastAPI Microservices • PostGIS U_hosp",
                    '#f5f3ff')

draw_card(ax, 0.75, 4.45, 3.4, 1.40,
          "HTML5 IndexedDB Ledger", "Zero-Loss Client Storage Engine",
          ["Transactional local queue", "Persists during 0-bar disconnect", "Crash binary payload buffer"],
          '#f0fdf4', '#059669', '#047857', "OFFLINE")

draw_card(ax, 4.45, 4.45, 3.4, 1.40,
          "ServiceWorker Auto-Sync", "Background Replay Engine",
          ["Auto-retry on 4G/5G handshake", "Replay latency < 850 ms", "P2P BLE / WebRTC fallback"],
          '#f0fdf4', '#059669', '#047857', "SYNC")

# Arrow between Offline Sync and Cloud FastAPI
draw_straight_arrow(ax, 7.85, 5.15, 8.15, 5.15, "Sync < 850ms", color='#059669')

draw_card(ax, 8.15, 4.45, 3.4, 1.40,
          "FastAPI ASGI Gateway", "Pydantic v2 Contract Validation",
          ["Role-based access control (RLS)", "Async CAD dispatch broker", "Zero-polling state updates"],
          '#faf5ff', '#7c3aed', '#6d28d9', "REST / WS")

draw_card(ax, 11.85, 4.45, 3.4, 1.40,
          "PostGIS Spatial Engine", "PostgreSQL 15 + Supabase",
          ["Hospital utility U_hosp scoring", "Live ICU bed & AVS inventory", "Dynamic Haversine routing"],
          '#faf5ff', '#7c3aed', '#6d28d9', "POSTGIS")


# =========================================================================
# CENTRAL CAD EMERGENCY DISPATCH BUS (Horizontal Manhattan Bus)
# =========================================================================
# Bus line from Cloud Engine down to a clean horizontal bar
bus_y = 3.75
ax.plot([10.0, 10.0], [4.45, bus_y], color='#e11d48', linewidth=2.0, zorder=4)
ax.plot([2.45, 13.55], [bus_y, bus_y], color='#e11d48', linewidth=2.4, zorder=4)

# Bus badge
ax.text(8.0, bus_y + 0.16, "[STEP 3] Multi-Agency Real-Time CAD Emergency Dispatch Bus (WebSocket / Push)",
        fontsize=8.0, fontweight='bold', color='#9f1239', ha='center', va='center', zorder=6,
        bbox=dict(boxstyle='round,pad=0.2', facecolor='#ffffff', edgecolor='#e11d48', linewidth=1.2))

# 4 Clean vertical drop-down arrows from bus into each stakeholder card in Tier 4
draw_straight_arrow(ax, 2.45, bus_y, 2.45, 3.15, "108 CAD Trigger", color='#e11d48')
draw_straight_arrow(ax, 6.15, bus_y, 6.15, 3.15, "Trauma Bed Reserve", color='#e11d48')
draw_straight_arrow(ax, 9.85, bus_y, 9.85, 3.15, "Cryo-Courier Route", color='#e11d48')
draw_straight_arrow(ax, 13.55, bus_y, 13.55, 3.15, "Family SMS Alerts", color='#e11d48')


# =========================================================================
# TIER 4: MULTI-AGENCY COMPUTER-AIDED DISPATCH (CAD) & EMERGENCY BROADCAST
# =========================================================================
draw_tier_container(ax, 0.5, 0.45, 15.0, 2.70,
                    "TIER 4: MULTI-AGENCY COMPUTER-AIDED DISPATCH (CAD) & EMERGENCY BROADCAST",
                    "Automated 108 Fleet Routing • Green Wave Corridor • ICU Bed Allocation • Family Kin Alerts",
                    '#fff1f2')

draw_card(ax, 0.75, 0.60, 3.4, 2.10,
          "108 ALS Ambulance", "Fleet CAD Auto-Dispatch",
          ["Zero-touch CAD dispatch trigger", "Turn-by-turn GPS route & ETA (3.5 min)", "Green corridor traffic wave pre-emption", "4 traffic signals cleared automatically", "Live telemetry mirrored to rescue crew"],
          '#fff1f2', '#e11d48', '#9f1239', "CAD FLEET")

draw_card(ax, 4.45, 0.60, 3.4, 2.10,
          "Hospital ER & Trauma ICU", "Tertiary Care Pre-Alert & Reservation",
          ["GGH Vijayawada lead hospital accepted", "Trauma Bay #4 reserved before arrival", "150 Polyvalent AVS vials pre-thawed", "Direct telemetry uplink to ER physician", "Paperless hospital pre-admission entry"],
          '#fff1f2', '#e11d48', '#9f1239', "HOSPITAL")

draw_card(ax, 8.15, 0.60, 3.4, 2.10,
          "Cold-Chain Cryo-Courier", "Blood Bank & Component Logistics",
          ["Red Cross & GGH blood bank mesh", "18 Units O- reserve routed immediately", "Temperature guard enforced (2°C - 6°C)", "Live donor activation (K. Venkata, 1.4 km)", "IoT thermal tamper-evident logging"],
          '#fff1f2', '#e11d48', '#9f1239', "LOGISTICS")

draw_card(ax, 11.85, 0.60, 3.4, 2.10,
          "Family Kin Emergency SMS", "Automated Citizen Notification Broadcast",
          ["5/5 Registered family contacts alerted", "Live GPS tracking link broadcast to kin", "SMS & WhatsApp simultaneous delivery", "Real-time ambulance & ICU status feeds", "Zero citizen manual effort required"],
          '#fff1f2', '#e11d48', '#9f1239', "KIN ALERT")

plt.tight_layout()
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.close()
print(f"Successfully generated clean human architecture flow diagram at: {output_path}")
