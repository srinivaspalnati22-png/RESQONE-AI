import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';

class EmergencyContactsModal extends StatelessWidget {
  final double currentLat;
  final double currentLng;

  const EmergencyContactsModal({
    super.key,
    this.currentLat = AppConstants.defaultLat,
    this.currentLng = AppConstants.defaultLng,
  });

  Future<void> _makeCall(String phoneNumber) async {
    final uri = Uri.parse('tel:$phoneNumber');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _sendLocationSMS(String phoneNumber) async {
    final message =
        "EMERGENCY SOS! I have met with an accident. Live GPS: https://maps.google.com/?q=$currentLat,$currentLng";
    final uri = Uri.parse('sms:$phoneNumber?body=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(
          top: BorderSide(color: AppTheme.emergencyRed, width: 2),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.emergencyRed.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.shield_outlined,
                        color: AppTheme.emergencyRed, size: 22),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    "Emergency SOS Dispatch",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                onPressed: () => Navigator.pop(context),
              )
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1010),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.emergencyRed.withOpacity(0.4)),
            ),
            child: Row(
              children: [
                const Icon(Icons.location_on, color: AppTheme.emergencyRed, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    "GPS Coordinates: $currentLat, $currentLng (Broadcasting to Responders)",
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "Priority Emergency Responders & Family Contacts:",
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          ...AppConstants.emergencyContacts.map((contact) {
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppTheme.surfaceCard,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.surfaceBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          contact['name'] ?? '',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          "${contact['role']} • ${contact['phone']}",
                          style: const TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.message, color: AppTheme.primaryCyan, size: 20),
                    onPressed: () => _sendLocationSMS(contact['phone']!),
                    tooltip: 'Send SOS Location SMS',
                  ),
                  IconButton(
                    icon: const Icon(Icons.phone, color: AppTheme.successGreen, size: 20),
                    onPressed: () => _makeCall(contact['phone']!),
                    tooltip: 'Call Emergency Contact',
                  ),
                ],
              ),
            );
          }).toList(),
          const SizedBox(height: 10),
        ],
      ),
    );
  }
}
