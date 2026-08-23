class HospitalModel {
  final String id;
  final String name;
  final String state;
  final String district;
  final String category;
  final String contactNumber;
  final List<String> specializations;
  final double latitude;
  final double longitude;
  final int icuAvailable;
  final int icuCapacity;
  final int antivenomStock;
  final bool antivenomAvailable;
  final String oxygenStatus;
  final bool traumaCenter;
  double? distanceKm;

  HospitalModel({
    required this.id,
    required this.name,
    required this.state,
    required this.district,
    required this.category,
    required this.contactNumber,
    required this.specializations,
    required this.latitude,
    required this.longitude,
    required this.icuAvailable,
    required this.icuCapacity,
    required this.antivenomStock,
    required this.antivenomAvailable,
    required this.oxygenStatus,
    required this.traumaCenter,
    this.distanceKm,
  });

  factory HospitalModel.fromJson(Map<String, dynamic> json) {
    return HospitalModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown Hospital',
      state: json['state'] ?? '',
      district: json['district'] ?? '',
      category: json['category'] ?? 'General Hospital',
      contactNumber: json['contact_number'] ?? json['phone'] ?? '+91-108',
      specializations: (json['specializations'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      latitude: (json['latitude'] as num?)?.toDouble() ?? 16.5167,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 80.6500,
      icuAvailable: json['icu_available'] ?? 10,
      icuCapacity: json['icu_capacity'] ?? 20,
      antivenomStock: json['antivenom_stock'] ?? 0,
      antivenomAvailable: json['antivenom_available'] ?? false,
      oxygenStatus: json['oxygen_status'] ?? 'NORMAL',
      traumaCenter: json['trauma_center'] ?? true,
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'state': state,
      'district': district,
      'category': category,
      'contact_number': contactNumber,
      'specializations': specializations,
      'latitude': latitude,
      'longitude': longitude,
      'icu_available': icuAvailable,
      'icu_capacity': icuCapacity,
      'antivenom_stock': antivenomStock,
      'antivenom_available': antivenomAvailable,
      'oxygen_status': oxygenStatus,
      'trauma_center': traumaCenter,
      'distanceKm': distanceKm,
    };
  }
}
