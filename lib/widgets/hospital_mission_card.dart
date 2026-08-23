import 'package:flutter/material.dart';
import '../models/emergency_report_model.dart';
import '../core/theme/app_theme.dart';

class HospitalMissionCard extends StatelessWidget {
  final EmergencyReportModel report;
  final VoidCallback onAccept;

  const HospitalMissionCard({
    super.key,
    required this.report,
    required this.onAccept,
  });

  @override
  Widget build(BuildContext context) {
    final isAccepted = report.status == EmergencyStatus.accepted ||
        report.status == EmergencyStatus.enRoute;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isAccepted ? AppTheme.successGreen : AppTheme.emergencyRed.withOpacity(0.5),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: (isAccepted ? AppTheme.successGreen : AppTheme.emergencyRed).withOpacity(0.12),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Type & Severity & AI Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (isAccepted ? AppTheme.successGreen : AppTheme.emergencyRed).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: (isAccepted ? AppTheme.successGreen : AppTheme.emergencyRed).withOpacity(0.4),
                  ),
                ),
                child: Text(
                  "${report.type} • ${report.severity}",
                  style: TextStyle(
                    color: isAccepted ? AppTheme.successGreen : AppTheme.emergencyRed,
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.primaryCyan.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  "AI ${report.aiConfidence.toInt()}% CONF",
                  style: const TextStyle(
                    color: AppTheme.primaryCyan,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // AI Explanation / Situation Report
          Text(
            "\"${report.aiExplanation}\"",
            style: const TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 13,
              height: 1.4,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 10),

          // Location details
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  report.address,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 11,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Action Section: Accept Button or Accepted Status
          if (!isAccepted) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onAccept,
                icon: const Icon(Icons.check_circle_outline, size: 18, color: Colors.black),
                label: const Text("ACCEPT CASE & DISPATCH ALS AMBULANCE"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryCyan,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.successGreen.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.successGreen.withOpacity(0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified, color: AppTheme.successGreen, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "CASE ACCEPTED by ${report.acceptedHospitalName ?? 'GGH Vijayawada'} • Ambulance Dispatched",
                      style: const TextStyle(
                        color: AppTheme.successGreen,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
