import os
import matplotlib.pyplot as plt
import numpy as np

# Ensure target figures directory exists
output_dir = os.path.join(os.path.dirname(__file__), '..', 'docs', 'figures')
os.makedirs(output_dir, exist_ok=True)

# Publication styling configuration
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
plt.rcParams['axes.edgecolor'] = '#333333'
plt.rcParams['axes.linewidth'] = 0.8
plt.rcParams['grid.color'] = '#e2e8f0'
plt.rcParams['grid.linestyle'] = '--'
plt.rcParams['grid.alpha'] = 0.7

# -------------------------------------------------------------
# Figure 1: CAD Dispatch Latency Benchmarking (Manual vs RESQONE-AI+)
# -------------------------------------------------------------
phases = [
    'Incident Detection\n& Verification',
    'Clinical Triage\n& Assessment',
    'Hospital Bed\n& AVS Search',
    'CAD Dispatch\nTrigger'
]
manual_times = [8.50, 4.20, 3.10, 2.60] # in minutes
resqone_times = [0.08, 0.003, 0.02, 0.05] # in minutes

x = np.arange(len(phases))
width = 0.35

fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
rects1 = ax.bar(x - width/2, manual_times, width, label='Manual EMS Baseline', color='#ef4444', edgecolor='#991b1b', alpha=0.9)
rects2 = ax.bar(x + width/2, resqone_times, width, label='RESQONE-AI+ CAD', color='#0ea5e9', edgecolor='#0369a1', alpha=0.95)

ax.set_ylabel('Latency (Minutes)', fontsize=11, fontweight='bold', labelpad=8)
ax.set_title('Emergency CAD Dispatch Latency by Operational Phase', fontsize=12, fontweight='bold', pad=12)
ax.set_xticks(x)
ax.set_xticklabels(phases, fontsize=9.5, fontweight='medium')
ax.legend(frameon=True, facecolor='white', edgecolor='#cbd5e1', fontsize=10)
ax.grid(axis='y')
ax.set_axisbelow(True)

# Add value labels
for rect in rects1:
    height = rect.get_height()
    ax.annotate(f'{height:.2f}m',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 3), textcoords="offset points",
                ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#991b1b')

for rect in rects2:
    height = rect.get_height()
    ax.annotate(f'{height:.3f}m\n(>98%)',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 3), textcoords="offset points",
                ha='center', va='bottom', fontsize=8, fontweight='bold', color='#0369a1')

ax.set_ylim(0, 10.2)
plt.tight_layout()
fig_path1 = os.path.join(output_dir, 'fig_dispatch_latency_bar.png')
plt.savefig(fig_path1, dpi=300)
plt.close()
print(f"Generated: {fig_path1}")

# -------------------------------------------------------------
# Figure 2: Multimodal Emergency Classification & Triage Metrics
# -------------------------------------------------------------
categories = [
    'Spectacled Cobra\n(N. naja)',
    "Russell's Viper\n(D. russelii)",
    'Common Krait\n(B. caeruleus)',
    'Vehicular Crash\nImpact',
    'Hemorrhagic\nShock (Blood)'
]
precision = [0.948, 0.932, 0.961, 0.988, 0.975]
recall =    [0.937, 0.948, 0.925, 0.980, 0.962]
f1_score =  [0.942, 0.940, 0.943, 0.984, 0.968]

x = np.arange(len(categories))
width = 0.25

fig, ax = plt.subplots(figsize=(9, 4.8), dpi=300)
r1 = ax.bar(x - width, precision, width, label='Precision', color='#3b82f6', edgecolor='#1d4ed8')
r2 = ax.bar(x, recall, width, label='Recall', color='#10b981', edgecolor='#047857')
r3 = ax.bar(x + width, f1_score, width, label='F1-Score', color='#8b5cf6', edgecolor='#6d28d9')

ax.set_ylabel('Metric Score (0.0 - 1.0)', fontsize=11, fontweight='bold', labelpad=8)
ax.set_title('AI Multimodal Triage Classification Performance by Emergency Domain', fontsize=12, fontweight='bold', pad=12)
ax.set_xticks(x)
ax.set_xticklabels(categories, fontsize=9, fontweight='medium')
ax.set_ylim(0.85, 1.02)
ax.legend(loc='lower right', frameon=True, facecolor='white', edgecolor='#cbd5e1', fontsize=9.5)
ax.grid(axis='y')
ax.set_axisbelow(True)

# Add labels on F1 bars
for rect in r3:
    height = rect.get_height()
    ax.annotate(f'{height:.3f}',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 3), textcoords="offset points",
                ha='center', va='bottom', fontsize=8, fontweight='bold', color='#4c1d95')

plt.tight_layout()
fig_path2 = os.path.join(output_dir, 'fig_model_performance_bar.png')
plt.savefig(fig_path2, dpi=300)
plt.close()
print(f"Generated: {fig_path2}")

# -------------------------------------------------------------
# Figure 3: Crash Detection Telemetry Evaluation Metrics
# -------------------------------------------------------------
metrics = ['Sensitivity\n(Recall)', 'Specificity', 'Precision', 'F1-Score', 'Overall\nAccuracy']
scores = [98.40, 99.20, 99.79, 99.09, 98.56]
colors = ['#0284c7', '#059669', '#d97706', '#7c3aed', '#db2777']

fig, ax = plt.subplots(figsize=(7, 4.2), dpi=300)
bars = ax.bar(metrics, scores, width=0.48, color=colors, edgecolor='#1e293b', alpha=0.9)

ax.set_ylabel('Validation Rate (%)', fontsize=11, fontweight='bold', labelpad=8)
ax.set_title('Zero-Touch Kinematic Crash Detection Benchmark (N=1,250 Trials)', fontsize=11.5, fontweight='bold', pad=12)
ax.set_ylim(95, 100.8)
ax.grid(axis='y')
ax.set_axisbelow(True)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f'{height:.2f}%',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 4), textcoords="offset points",
                ha='center', va='bottom', fontsize=9.5, fontweight='bold', color='#0f172a')

plt.tight_layout()
fig_path3 = os.path.join(output_dir, 'fig_crash_detection_metrics_bar.png')
plt.savefig(fig_path3, dpi=300)
plt.close()
print(f"Generated: {fig_path3}")

# -------------------------------------------------------------
# Figure 4: Total Golden Hour Emergency Response Time Reduction
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(6.5, 3.8), dpi=300)
systems = ['Manual 108 EMS Baseline', 'RESQONE-AI+ Unified Ecosystem']
total_latencies = [18.40, 2.10]
bar_colors = ['#e11d48', '#10b981']

bars = ax.barh(systems, total_latencies, height=0.45, color=bar_colors, edgecolor='#1e293b')
ax.set_xlabel('End-to-End Incident Dispatch Latency (Minutes)', fontsize=10.5, fontweight='bold', labelpad=8)
ax.set_title('End-to-End Emergency Response Time (88.58% Reduction)', fontsize=11.5, fontweight='bold', pad=12)
ax.set_xlim(0, 22)
ax.grid(axis='x')
ax.set_axisbelow(True)

for bar in bars:
    width_val = bar.get_width()
    ax.annotate(f'{width_val:.2f} min',
                xy=(width_val, bar.get_y() + bar.get_height() / 2),
                xytext=(6, 0), textcoords="offset points",
                ha='left', va='center', fontsize=10, fontweight='bold', color='#0f172a')

ax.annotate('88.58% Latency Reduction\n(Saving Critical Golden Hour Window)',
            xy=(2.10, 1), xytext=(8.5, 0.7),
            arrowprops=dict(facecolor='#059669', shrink=0.08, width=1.5, headwidth=6),
            fontsize=9, fontweight='bold', color='#065f46',
            bbox=dict(boxstyle="round,pad=0.4", fc="#d1fae5", ec="#10b981", lw=1))

plt.tight_layout()
fig_path4 = os.path.join(output_dir, 'fig_response_reduction_bar.png')
plt.savefig(fig_path4, dpi=300)
plt.close()
print(f"Generated: {fig_path4}")
print("All publication figures successfully generated!")
