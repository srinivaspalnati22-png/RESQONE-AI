enum EmergencyStatus {
  pending,
  transmitting,
  accepted,
  enRoute,
  patientPickup,
  completed
}

class EmergencyReportModel {
  final String id;
  final String type; // 'ACCIDENT_RESCUE', 'SNAKEBITE', 'CARDIAC'
  final String severity; // 'CRITICAL', 'HIGH', 'MODERATE'
  final double aiConfidence;
  final String aiExplanation;
  final String address;
  final double latitude;
  final double longitude;
  final DateTime timestamp;
  EmergencyStatus status;
  String? acceptedHospitalName;
  String? dispatchedAmbulanceId;

  EmergencyReportModel({
    required this.id,
    required this.type,
    required this.severity,
    required this.aiConfidence,
    required this.aiExplanation,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.status = EmergencyStatus.pending,
    this.acceptedHospitalName,
    this.dispatchedAmbulanceId,
  });

  factory EmergencyReportModel.fromJson(Map<String, dynamic> json) {
    return EmergencyReportModel(
      id: json['id'] ?? '',
      type: json['type'] ?? 'EMERGENCY',
      severity: json['severity'] ?? 'CRITICAL',
      aiConfidence: (json['ai_confidence'] as num?)?.toDouble() ?? 95.0,
      aiExplanation: json['ai_explanation'] ?? json['reason'] ?? '',
      address: json['address'] ?? 'Vijayawada Corridor',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 16.5167,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 80.6500,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      status: json['status'] == 'EN_ROUTE'
          ? EmergencyStatus.enRoute
          : json['status'] == 'ACCEPTED'
              ? EmergencyStatus.accepted
              : EmergencyStatus.pending,
      acceptedHospitalName: json['accepted_hospital_name'],
      dispatchedAmbulanceId: json['dispatched_ambulance_id'],
    );
  }
}
