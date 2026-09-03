import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

output_dir = os.path.join(os.path.dirname(__file__), '..', 'docs', 'figures')
os.makedirs(output_dir, exist_ok=True)

fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')

# Layer definitions with coordinates [x, y, width, height]
layers = [
    {
        'title': 'LAYER 1: EDGE MULTIMODAL SENSING & TELEMETRY',
        'subtitle': 'Continuous 100 Hz IMU Telemetry • MobileNet Vision • GPS Spatial Coordinates',
        'color': '#1e293b',
        'border': '#38bdf8',
        'y': 7.0,
        'boxes': [
            ('3-Axis Accelerometer\n& Gyroscope (100 Hz)\nax, ay, az, roll, pitch', 0.8, 7.15, 2.3, 0.9),
            ('MobileNet Neural Vision\nCamera / Photo Upload\nIndian Reptile Species', 3.4, 7.15, 2.3, 0.9),
            ('Microphone / Voice\nMultilingual Speech\n(TE, HI, TA, KN, EN)', 6.0, 7.15, 2.3, 0.9),
            ('GPS / Geolocation\nHaversine Coordinates\nSpeed & Blackspots', 8.6, 7.15, 2.3, 0.9)
        ]
    },
    {
        'title': 'LAYER 2: EDGE INFERENCE & AUTONOMOUS DECISION ENGINES',
        'subtitle': 'Kinematic Impact Modeling (G >= 4.0G, Jerk, Rotation) • Multilingual Clinical Triage • Uncertainty Gating',
        'color': '#1e293b',
        'border': '#f59e0b',
        'y': 4.9,
        'boxes': [
            ('Zero-Touch Crash Daemon\n||G(t)|| >= 4.0G & Jerk >= 45G/s\n5s Cancellation Countdown', 0.8, 5.05, 2.5, 0.9),
            ('AI Species Classifier\nBig 4 Venom Potency (LD50)\nPolyvalent AVS Titration', 3.6, 5.05, 2.4, 0.9),
            ('Explainable NLP Triage\nTF-IDF + Cosine Medical Scorer\nUncertainty Cutoff (<65%)', 6.3, 5.05, 2.5, 0.9),
            ('ABO/Rh Compatibility\nDeterministic Pairing Matrix\nTemperature Guard (2-6°C)', 9.1, 5.05, 2.2, 0.9)
        ]
    },
    {
        'title': 'LAYER 3: FAULT-TOLERANT OFFLINE RESILIENCE & MESH SYNC',
        'subtitle': 'HTML5 IndexedDB Storage Ledger • ServiceWorker Sync • P2P Bluetooth/WebRTC Emergency Mesh',
        'color': '#1e293b',
        'border': '#10b981',
        'y': 3.1,
        'boxes': [
            ('IndexedDB Client Ledger\nGuaranteed Transactional Buffer\nZero Loss in Blind Spots', 1.5, 3.25, 2.8, 0.85),
            ('Service Worker Background Sync\nAuto-Retry upon 4G/5G Handshake\nPayload Delivery < 850 ms', 4.7, 3.25, 2.9, 0.85),
            ('P2P Emergency Mesh Beacon\nBluetooth LE / WebRTC Direct\nAd-Hoc Network Propagation', 7.9, 3.25, 2.8, 0.85)
        ]
    },
    {
        'title': 'LAYER 4: CLOUD INTEGRATION & POSTGIS SPATIAL MESH',
        'subtitle': 'FastAPI ASGI Gateway • Supabase PostgreSQL 15 • PostGIS Spatial Distance Indexing • Realtime WS',
        'color': '#1e293b',
        'border': '#8b5cf6',
        'y': 1.6,
        'boxes': [
            ('FastAPI Microservices\nPydantic v2 Contract Validation\nRate Limiting & RLS Security', 1.5, 1.75, 2.8, 0.85),
            ('PostGIS Spatial Engine\nHospital Utility U_hosp Scoring\nLive Bed & AVS Stock Tracker', 4.7, 1.75, 2.9, 0.85),
            ('Supabase Realtime Engine\nWebSocket Emergency Broadcast\nMulti-Agency State Synchronization', 7.9, 1.75, 2.8, 0.85)
        ]
    },
    {
        'title': 'LAYER 5: STAKEHOLDER COORDINATION & COMPUTER-AIDED DISPATCH (CAD)',
        'subtitle': 'Automated 108 Ambulance Dispatch • Green Corridor Wave • Hospital Bed Allocation • Family Alerts',
        'color': '#1e293b',
        'border': '#ef4444',
        'y': 0.1,
        'boxes': [
            ('108 ALS Ambulance\nZero-Touch CAD Dispatch\nAutomated GPS Route & ETA', 0.8, 0.25, 2.4, 0.85),
            ('Hospital ER / Trauma ICU\nPre-Alert Patient Telemetry\nTrauma Bay & AVS Reservation', 3.5, 0.25, 2.5, 0.85),
            ('Cryo-Courier Blood Mesh\nRed Cross / Blood Bank Routing\nTemperature Monitored Delivery', 6.3, 0.25, 2.5, 0.85),
            ('Family Kin Broadcast\nAutomated SMS & WhatsApp\nLive Location Tracking Links', 9.1, 0.25, 2.2, 0.85)
        ]
    }
]

# Draw background containers and boxes
for l in layers:
    # Outer layer box
    rect = patches.FancyBboxPatch(
        (0.5, l['y']), 11.0, 1.35,
        boxstyle="round,pad=0.15,rounding_size=0.15",
        facecolor='#111827',
        edgecolor=l['border'],
        linewidth=1.8,
        alpha=0.9
    )
    ax.add_patch(rect)
    
    # Layer Title
    ax.text(0.7, l['y'] + 1.25, l['title'], fontsize=9.5, fontweight='black', color=l['border'], va='center')
    ax.text(6.0, l['y'] + 1.25, l['subtitle'], fontsize=7.5, fontweight='medium', color='#94a3b8', va='center')

    # Inner boxes
    for text, bx, by, bw, bh in l['boxes']:
        b_rect = patches.FancyBboxPatch(
            (bx, by), bw, bh,
            boxstyle="round,pad=0.08,rounding_size=0.1",
            facecolor='#1e293b',
            edgecolor=l['border'],
            linewidth=1.2,
            alpha=0.95
        )
        ax.add_patch(b_rect)
        ax.text(bx + bw/2, by + bh/2, text, fontsize=7.5, fontweight='bold', color='#f8fafc', ha='center', va='center', multialignment='center')

# Connective Flow Arrows between Layers
arrow_style = dict(arrowstyle="->,head_width=0.35,head_length=0.4", color='#38bdf8', lw=2.2)
alt_arrow = dict(arrowstyle="->,head_width=0.35,head_length=0.4", color='#f59e0b', lw=2.2)
mesh_arrow = dict(arrowstyle="->,head_width=0.35,head_length=0.4", color='#10b981', lw=2.2)
cloud_arrow = dict(arrowstyle="->,head_width=0.35,head_length=0.4", color='#ef4444', lw=2.2)

# Arrows from Layer 1 to Layer 2
ax.annotate('', xy=(2.0, 6.0), xytext=(2.0, 7.1), arrowprops=arrow_style)
ax.annotate('', xy=(4.8, 6.0), xytext=(4.8, 7.1), arrowprops=arrow_style)
ax.annotate('', xy=(7.5, 6.0), xytext=(7.5, 7.1), arrowprops=arrow_style)
ax.annotate('', xy=(10.0, 6.0), xytext=(10.0, 7.1), arrowprops=arrow_style)

# Arrows from Layer 2 to Layer 3
ax.annotate('', xy=(2.9, 4.15), xytext=(2.1, 5.0), arrowprops=alt_arrow)
ax.annotate('', xy=(6.1, 4.15), xytext=(6.1, 5.0), arrowprops=alt_arrow)
ax.annotate('', xy=(9.3, 4.15), xytext=(9.8, 5.0), arrowprops=alt_arrow)

# Arrows from Layer 3 to Layer 4
ax.annotate('', xy=(2.9, 2.65), xytext=(2.9, 3.25), arrowprops=mesh_arrow)
ax.annotate('', xy=(6.1, 2.65), xytext=(6.1, 3.25), arrowprops=mesh_arrow)
ax.annotate('', xy=(9.3, 2.65), xytext=(9.3, 3.25), arrowprops=mesh_arrow)

# Arrows from Layer 4 to Layer 5
ax.annotate('', xy=(2.0, 1.15), xytext=(2.9, 1.75), arrowprops=cloud_arrow)
ax.annotate('', xy=(4.8, 1.15), xytext=(5.5, 1.75), arrowprops=cloud_arrow)
ax.annotate('', xy=(7.5, 1.15), xytext=(7.0, 1.75), arrowprops=cloud_arrow)
ax.annotate('', xy=(10.2, 1.15), xytext=(9.3, 1.75), arrowprops=cloud_arrow)

# Main Title Header
ax.text(6.0, 8.8, 'RESQONE-AI+: END-TO-END MULTIMODAL EMERGENCY INTELLIGENCE ARCHITECTURE',
        fontsize=13.5, fontweight='black', color='#ffffff', ha='center', va='center')
ax.text(6.0, 8.55, 'Edge Sensor Telemetry ➔ Kinematic & NLP AI Engines ➔ Offline Mesh ➔ Cloud CAD Dispatch Mesh',
        fontsize=9, fontweight='bold', color='#38bdf8', ha='center', va='center')

ax.set_xlim(0, 12)
ax.set_ylim(-0.1, 9.1)
ax.axis('off')

plt.tight_layout()
fig_path = os.path.join(output_dir, 'fig_architecture_flow.png')
plt.savefig(fig_path, dpi=300, bbox_inches='tight', facecolor='#0f172a')
plt.close()
print(f"Generated architecture flow diagram: {fig_path}")
