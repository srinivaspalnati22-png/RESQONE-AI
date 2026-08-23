import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/blood_donor_provider.dart';
import '../core/theme/app_theme.dart';

class BloodDonorScreen extends StatelessWidget {
  const BloodDonorScreen({super.key});

  final List<String> bloodGroups = const [
    'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'
  ];

  Future<void> _callDonor(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _smsDonor(String phone, String group) async {
    final message = "URGENT BLOOD REQUEST for $group blood group in Vijayawada. Please confirm if available to donate.";
    final uri = Uri.parse('sms:$phone?body=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BloodDonorProvider>();

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
              child: const Icon(Icons.water_drop, color: AppTheme.emergencyRed, size: 20),
            ),
            const SizedBox(width: 10),
            const Text("Smart Blood Matcher", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryCyan))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Blood Group Selector Header
                  const Text(
                    "Select Recipient Blood Group:",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Horizontal Chips
                  SizedBox(
                    height: 44,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: bloodGroups.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, idx) {
                        final bg = bloodGroups[idx];
                        final isSelected = bg == provider.selectedBloodGroup;
                        return GestureDetector(
                          onTap: () => provider.selectBloodGroup(bg),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppTheme.emergencyRed
                                  : AppTheme.surfaceDark,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected
                                    ? AppTheme.emergencyRed
                                    : AppTheme.surfaceBorder,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                bg,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : AppTheme.textSecondary,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Compatibility Explainer Card
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.surfaceBorder),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, color: AppTheme.primaryCyan, size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            provider.selectedBloodGroup == 'O-'
                                ? "O- Negative is the Universal Red Blood Cell Donor. Only O- donors are medically compatible for O- patients."
                                : "Displaying matching ABO/Rh compatible donors for patient requiring ${provider.selectedBloodGroup}.",
                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Section: Compatible Verified Donors List
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Compatible Donors Nearby (${provider.filteredDonors.length})",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text(
                        "RANKED BY GPS",
                        style: TextStyle(
                          color: AppTheme.successGreen,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  ...provider.filteredDonors.map((donor) {
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
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: AppTheme.emergencyRed.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.emergencyRed.withOpacity(0.4)),
                            ),
                            child: Center(
                              child: Text(
                                donor.bloodGroup,
                                style: const TextStyle(
                                  color: AppTheme.emergencyRed,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 15,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      donor.name,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.verified, color: AppTheme.primaryCyan, size: 14),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  "${donor.locationName} • ${donor.distanceKm} km away",
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  donor.lastDonation,
                                  style: const TextStyle(color: AppTheme.successGreen, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.message, color: AppTheme.primaryCyan, size: 20),
                            onPressed: () => _smsDonor(donor.phone, donor.bloodGroup),
                            tooltip: 'Send SMS',
                          ),
                          IconButton(
                            icon: const Icon(Icons.phone, color: AppTheme.successGreen, size: 20),
                            onPressed: () => _callDonor(donor.phone),
                            tooltip: 'Call Donor',
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 20),

                  // Section: Blood Banks Stock
                  const Text(
                    "Government & Red Cross Blood Banks:",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),

                  ...provider.filteredBloodBanks.map((bank) {
                    final stockCount = bank.stock[provider.selectedBloodGroup] ?? 0;
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
                          const Icon(Icons.local_hospital, color: AppTheme.primaryCyan, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  bank.name,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  "${bank.city} • Stock: $stockCount Units available",
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.phone, color: AppTheme.primaryCyan, size: 18),
                            onPressed: () => _callDonor(bank.contactNumber),
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
