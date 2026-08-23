class AccidentRecordModel {
  final String id;
  final String highway;
  final String location;
  final String severity;
  final String cause;
  final int personsInjured;
  final int fatalities;
  final String riskHotspotLevel;
  final double latitude;
  final double longitude;

  AccidentRecordModel({
    required this.id,
    required this.highway,
    required this.location,
    required this.severity,
    required this.cause,
    required this.personsInjured,
    required this.fatalities,
    required this.riskHotspotLevel,
    required this.latitude,
    required this.longitude,
  });

  factory AccidentRecordModel.fromJson(Map<String, dynamic> json) {
    return AccidentRecordModel(
      id: json['id'] ?? '',
      highway: json['highway'] ?? 'National Highway',
      location: json['location'] ?? '',
      severity: json['severity'] ?? 'HIGH',
      cause: json['cause'] ?? 'Vehicle Collision',
      personsInjured: json['persons_injured'] ?? 0,
      fatalities: json['fatalities'] ?? 0,
      riskHotspotLevel: json['risk_hotspot_level'] ?? 'HIGH',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 16.5167,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 80.6500,
    );
  }
}
