import 'package:flutter/material.dart';
import '../models/donor_model.dart';
import '../services/data_service.dart';
import '../core/constants/app_constants.dart';

class BloodDonorProvider extends ChangeNotifier {
  String _selectedBloodGroup = 'O-';
  List<DonorModel> _allDonors = [];
  List<BloodBankModel> _bloodBanks = [];
  bool _isLoading = true;

  String get selectedBloodGroup => _selectedBloodGroup;
  bool get isLoading => _isLoading;

  BloodDonorProvider() {
    loadData();
  }

  Future<void> loadData() async {
    _isLoading = true;
    notifyListeners();

    try {
      _allDonors = DataService.getVerifiedCommunityDonors();
      _bloodBanks = await DataService.getBloodBanks();
    } catch (e) {
      print("Error loading blood data: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectBloodGroup(String group) {
    _selectedBloodGroup = group;
    notifyListeners();
  }

  // Get Compatible Donors sorted by distance
  List<DonorModel> get filteredDonors {
    final compatibleGroups =
        AppConstants.bloodCompatibility[_selectedBloodGroup] ?? [_selectedBloodGroup];

    final list = _allDonors
        .where((d) => compatibleGroups.contains(d.bloodGroup))
        .toList();

    list.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
    return list;
  }

  // Get Blood Banks with stock for selected group
  List<BloodBankModel> get filteredBloodBanks {
    return _bloodBanks.where((b) {
      final stock = b.stock[_selectedBloodGroup] ?? 0;
      return stock > 0;
    }).toList();
  }
}
