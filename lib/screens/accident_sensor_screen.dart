import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sensor_provider.dart';
import '../providers/language_provider.dart';
import '../core/theme/app_theme.dart';
import '../widgets/sensor_gauge_card.dart';
import '../widgets/live_rescue_map_card.dart';
import '../widgets/emergency_contacts_modal.dart';

class AccidentSensorScreen extends StatelessWidget {
  const AccidentSensorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sensor = context.watch<SensorProvider>();
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.emergencyRed.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.car_crash, color: AppTheme.emergencyRed, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                lang.getText('accident_sensor_title'),
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: AppTheme.primaryCyan),
            onPressed: () => lang.toggleLanguage(),
            tooltip: 'Toggle Telugu / English',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.surfaceBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: sensor.isCrashTriggered
                              ? AppTheme.emergencyRed
                              : AppTheme.successGreen,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        sensor.isCrashTriggered
                            ? "CRASH IMPACT DETECTED"
                            : lang.getText('live_sensor_active'),
                        style: TextStyle(
                          color: sensor.isCrashTriggered
                              ? AppTheme.emergencyRed
                              : AppTheme.successGreen,
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                  const Text(
                    "3-AXIS FUSION",
                    style: TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Live Sensor Gauges Grid
            Row(
              children: [
                Expanded(
                  child: SensorGaugeCard(
                    title: lang.getText('impact_gforce'),
                    value: sensor.gForce.toStringAsFixed(1),
                    unit: "G",
                    icon: Icons.speed,
                    accentColor: sensor.gForce >= 4.0
                        ? AppTheme.emergencyRed
                        : AppTheme.primaryCyan,
                    isAlert: sensor.gForce >= 4.0,
                    subtitle: sensor.gForce >= 4.0
                        ? "High Velocity Impact"
                        : "Normal driving range (<2G)",
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SensorGaugeCard(
                    title: lang.getText('gyro_orientation'),
                    value: "${sensor.roll.abs().toStringAsFixed(0)}°",
                    unit: "ROLL",
                    icon: Icons.screen_rotation_alt,
                    accentColor: sensor.roll.abs() > 60
                        ? AppTheme.emergencyRed
                        : AppTheme.warningAmber,
                    isAlert: sensor.roll.abs() > 60,
                    subtitle: sensor.roll.abs() > 60
                        ? "Vehicle Rollover detected"
                        : "Level trajectory",
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Speed Telemetry
            SensorGaugeCard(
              title: lang.getText('speed_telemetry'),
              value: sensor.speedKmh.toStringAsFixed(0),
              unit: "KM/H",
              icon: Icons.directions_car,
              accentColor: AppTheme.primaryCyan,
              subtitle: sensor.speedKmh == 0 && sensor.isCrashTriggered
                  ? "Sudden deceleration from 85 km/h to 0 km/h"
                  : "Cruising speed on NH-16 highway",
            ),
            const SizedBox(height: 20),

            // SOS Countdown Banner (If Crash Triggered)
            if (sensor.isCrashTriggered) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF2A0A0A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.emergencyRed, width: 2),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.warning, color: AppTheme.emergencyRed, size: 28),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "AUTOMATIC SOS BROADCAST IN ${sensor.sosCountdown}s",
                                style: const TextStyle(
                                  color: AppTheme.emergencyRed,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const Text(
                                "Dispatching coordinates to 4 Hospitals & Family Contacts...",
                                style: TextStyle(
                                  color: AppTheme.textSecondary,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (_) => const EmergencyContactsModal(),
                              );
                            },
                            icon: const Icon(Icons.phone_in_talk, size: 16),
                            label: const Text("VIEW SOS CONTACTS"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.emergencyRed,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        OutlinedButton(
                          onPressed: () => sensor.cancelSOS(),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.textMuted),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: const Text("CANCEL SOS", style: TextStyle(color: Colors.white, fontSize: 11)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Live Rescue Navigation Map
              const Text(
                "Multi-Agency Live Radar & Route Tracking:",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              const LiveRescueMapCard(),
              const SizedBox(height: 20),
            ],

            // Simulation Action Buttons
            if (!sensor.isCrashTriggered) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => sensor.triggerSimulatedCrash(),
                  icon: const Icon(Icons.car_crash, color: Colors.white),
                  label: Text(
                    lang.getText('simulate_crash'),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.emergencyRed,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => const EmergencyContactsModal(),
                    );
                  },
                  icon: const Icon(Icons.contacts, color: AppTheme.primaryCyan, size: 18),
                  label: const Text("MANAGE EMERGENCY CONTACTS (112 / 108 / SOS)"),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.primaryCyanDark),
                    foregroundColor: AppTheme.primaryCyan,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
