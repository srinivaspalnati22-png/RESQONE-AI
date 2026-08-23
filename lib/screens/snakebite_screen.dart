import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/snake_species_model.dart';
import '../models/hospital_model.dart';
import '../services/data_service.dart';
import '../core/theme/app_theme.dart';

class SnakebiteScreen extends StatefulWidget {
  const SnakebiteScreen({super.key});

  @override
  State<SnakebiteScreen> createState() => _SnakebiteScreenState();
}

class _SnakebiteScreenState extends State<SnakebiteScreen> {
  List<SnakeSpeciesModel> _speciesList = [];
  List<HospitalModel> _avsHospitals = [];
  SnakeSpeciesModel? _selectedSpecies;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final species = await DataService.getSnakeSpecies();
    final hosps = await DataService.getHospitals();

    // Filter hospitals with active antivenom stock
    final avs = hosps.where((h) => h.antivenomAvailable && h.antivenomStock > 0).toList();

    setState(() {
      _speciesList = species;
      _selectedSpecies = species.isNotEmpty ? species.first : null;
      _avsHospitals = avs;
      _isLoading = false;
    });
  }

  Future<void> _callHospital(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.warningAmber.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.shield_alert, color: AppTheme.warningAmber, size: 20),
            ),
            const SizedBox(width: 10),
            const Text("Snakebite AI & Antivenom", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryCyan))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Species Selector
                  const Text(
                    "Select Identified Snake Species:",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),

                  SizedBox(
                    height: 48,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _speciesList.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, idx) {
                        final sp = _speciesList[idx];
                        final isSelected = sp.id == _selectedSpecies?.id;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedSpecies = sp),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? AppTheme.warningAmber : AppTheme.surfaceDark,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected ? AppTheme.warningAmber : AppTheme.surfaceBorder,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                sp.commonName,
                                style: TextStyle(
                                  color: isSelected ? Colors.black : AppTheme.textSecondary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Species Detail Card
                  if (_selectedSpecies != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceDark,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppTheme.warningAmber.withOpacity(0.5)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _selectedSpecies!.commonName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppTheme.emergencyRed.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  _selectedSpecies!.dangerLevel,
                                  style: const TextStyle(
                                    color: AppTheme.emergencyRed,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "Venom Type: ${_selectedSpecies!.venomType}",
                            style: const TextStyle(
                              color: AppTheme.warningAmber,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            _selectedSpecies!.description,
                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11, height: 1.4),
                          ),
                          const SizedBox(height: 14),

                          // WHO Protocol
                          const Text(
                            "WHO First-Aid Guidance:",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          ..._selectedSpecies!.firstAidDo.take(2).map((item) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.check_circle, color: AppTheme.successGreen, size: 14),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(item, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 11)),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),

                  // Section: Antivenom Stock Radar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Antivenom Equipped Hospitals (${_avsHospitals.length})",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text(
                        "POLYVALENT AVS",
                        style: TextStyle(
                          color: AppTheme.primaryCyan,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  ..._avsHospitals.map((hosp) {
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
                                  "${hosp.district}, ${hosp.state} • ${hosp.distanceKm ?? 2.5} km",
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                ),
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryCyan.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    "AVS Stock: ${hosp.antivenomStock} Vials",
                                    style: const TextStyle(
                                      color: AppTheme.primaryCyan,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: () => _callHospital(hosp.contactNumber),
                            icon: const Icon(Icons.phone, size: 14, color: Colors.black),
                            label: const Text("CALL"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryCyan,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
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
