import 'package:flutter/material.dart';
import '../models/emergency_report_model.dart';
import '../models/hospital_model.dart';
import '../models/accident_record_model.dart';
import '../services/data_service.dart';

class EmergencyMissionProvider extends ChangeNotifier {
  List<EmergencyReportModel> _reports = [];
  List<HospitalModel> _hospitals = [];
  List<AccidentRecordModel> _accidentRecords = [];
  bool _isLoading = true;

  List<EmergencyReportModel> get reports => _reports;
  List<HospitalModel> get hospitals => _hospitals;
  List<AccidentRecordModel> get accidentRecords => _accidentRecords;
  bool get isLoading => _isLoading;

  EmergencyMissionProvider() {
    loadData();
  }

  Future<void> loadData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final hosps = await DataService.getHospitals();
      final accs = await DataService.getAccidentRecords();

      _hospitals = hosps;
      _accidentRecords = accs;

      // Seed Initial Real-Time Live Emergency Missions Feed
      _reports = [
        EmergencyReportModel(
          id: 'rep-live-101',
          type: 'ACCIDENT_RESCUE',
          severity: 'CRITICAL',
          aiConfidence: 96.5,
          aiExplanation:
              'NH-16 Vijayawada Corridor crash: Sensor Fusion detected 12.8G impact. ALS-108 dispatched with ICU bed reserve.',
          address: 'NH-16 Gollapudi Bypass, Vijayawada',
          latitude: 16.5412,
          longitude: 80.5843,
          timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
          status: EmergencyStatus.pending,
        ),
        EmergencyReportModel(
          id: 'rep-live-102',
          type: 'SNAKEBITE',
          severity: 'HIGH',
          aiConfidence: 94.0,
          aiExplanation:
              'Spectacled Cobra envenomation: Neurotoxic symptoms detected. GGH Vijayawada AVS reserved.',
          address: 'Gunadala Rural Sector, Vijayawada',
          latitude: 16.5200,
          longitude: 80.6600,
          timestamp: DateTime.now().subtract(const Duration(minutes: 12)),
          status: EmergencyStatus.pending,
        ),
      ];
    } catch (e) {
      print("Error loading dashboard data: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Hospital Action: Click Accept Case
  void acceptCase(String reportId, String hospitalName) {
    final index = _reports.indexWhere((r) => r.id == reportId);
    if (index != -1) {
      _reports[index].status = EmergencyStatus.accepted;
      _reports[index].acceptedHospitalName = hospitalName;
      _reports[index].dispatchedAmbulanceId = 'ALS-108 (AP-TRAUMA-99)';

      // Decrement ICU Bed for the accepting hospital
      final hospIndex = _hospitals.indexWhere((h) => h.name.contains(hospitalName) || hospitalName.contains(h.name));
      if (hospIndex != -1 && _hospitals[hospIndex].icuAvailable > 0) {
        // Reserve 1 ICU bed
        _hospitals[hospIndex] = HospitalModel(
          id: _hospitals[hospIndex].id,
          name: _hospitals[hospIndex].name,
          state: _hospitals[hospIndex].state,
          district: _hospitals[hospIndex].district,
          category: _hospitals[hospIndex].category,
          contactNumber: _hospitals[hospIndex].contactNumber,
          specializations: _hospitals[hospIndex].specializations,
          latitude: _hospitals[hospIndex].latitude,
          longitude: _hospitals[hospIndex].longitude,
          icuAvailable: _hospitals[hospIndex].icuAvailable - 1,
          icuCapacity: _hospitals[hospIndex].icuCapacity,
          antivenomStock: _hospitals[hospIndex].antivenomStock,
          antivenomAvailable: _hospitals[hospIndex].antivenomAvailable,
          oxygenStatus: _hospitals[hospIndex].oxygenStatus,
          traumaCenter: _hospitals[hospIndex].traumaCenter,
          distanceKm: _hospitals[hospIndex].distanceKm,
        );
      }

      notifyListeners();
    }
  }

  // Add new report (e.g. from crash sensor or SOS button)
  void addNewReport(EmergencyReportModel newReport) {
    _reports.insert(0, newReport);
    notifyListeners();
  }
}
