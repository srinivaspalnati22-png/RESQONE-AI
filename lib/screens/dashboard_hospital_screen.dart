import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/emergency_mission_provider.dart';
import '../core/theme/app_theme.dart';
import '../widgets/hospital_mission_card.dart';

class DashboardHospitalScreen extends StatelessWidget {
  const DashboardHospitalScreen({super.key});

  Future<void> _callHospital(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final missionProvider = context.watch<EmergencyMissionProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primaryCyan.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.dashboard_customize, color: AppTheme.primaryCyan, size: 20),
            ),
            const SizedBox(width: 10),
            const Text("Hospital Mission Control", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.primaryCyan),
            onPressed: () => missionProvider.loadData(),
          ),
        ],
      ),
      body: missionProvider.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryCyan))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Section: Active Rescue Missions Feed
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.emergency, color: AppTheme.emergencyRed, size: 18),
                          const SizedBox(width: 6),
                          Text(
                            "Incoming Triage Incidents (${missionProvider.reports.length})",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const Text(
                        "LIVE TELEMETRY",
                        style: TextStyle(
                          color: AppTheme.emergencyRed,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  ...missionProvider.reports.map((report) {
                    return HospitalMissionCard(
                      report: report,
                      onAccept: () {
                        missionProvider.acceptCase(
                          report.id,
                          "GGH Vijayawada Apex Center",
                        );
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppTheme.surfaceDark,
                            content: Row(
                              children: [
                                const Icon(Icons.check_circle, color: AppTheme.successGreen, size: 20),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    "Case #${report.id} ACCEPTED! ICU Bed reserved & ALS-108 Dispatched.",
                                    style: const TextStyle(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  }).toList(),
                  const SizedBox(height: 20),

                  // Section: NHP Regional Hospitals Telemetry
                  const Text(
                    "National Health Portal — Regional Hospital Stock:",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),

                  ...missionProvider.hospitals.map((hosp) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceDark,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.surfaceBorder),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  hosp.name,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  "${hosp.district}, ${hosp.state} • ${hosp.distanceKm ?? 2.1} km away",
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppTheme.successGreen.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        "ICU: ${hosp.icuAvailable} Beds",
                                        style: const TextStyle(
                                          color: AppTheme.successGreen,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryCyan.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        "AVS: ${hosp.antivenomStock} Vials",
                                        style: const TextStyle(
                                          color: AppTheme.primaryCyan,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.phone, color: AppTheme.primaryCyan, size: 20),
                            onPressed: () => _callHospital(hosp.contactNumber),
                            tooltip: 'Call Hospital Desk',
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 20),

                  // Section: Zenodo Road Accident Hotspot Corridors
                  const Text(
                    "Zenodo Road Accident Corridor Analysis:",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),

                  ...missionProvider.accidentRecords.map((acc) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.surfaceBorder),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.warning_amber, color: AppTheme.warningAmber, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "${acc.highway} — ${acc.location}",
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  "Cause: ${acc.cause} • ${acc.personsInjured} Injured",
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.emergencyRed.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              acc.riskHotspotLevel,
                              style: const TextStyle(
                                color: AppTheme.emergencyRed,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
    );
  }
}
