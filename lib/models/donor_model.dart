class DonorModel {
  final String id;
  final String name;
  final String bloodGroup;
  final bool isUniversal;
  final double distanceKm;
  final String phone;
  final String lastDonation;
  final bool verified;
  final double latitude;
  final double longitude;
  final String locationName;

  DonorModel({
    required this.id,
    required this.name,
    required this.bloodGroup,
    required this.isUniversal,
    required this.distanceKm,
    required this.phone,
    required this.lastDonation,
    required this.verified,
    required this.latitude,
    required this.longitude,
    required this.locationName,
  });

  factory DonorModel.fromJson(Map<String, dynamic> json) {
    return DonorModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Verified Donor',
      bloodGroup: json['group'] ?? json['bloodGroup'] ?? 'O+',
      isUniversal: json['isUniversal'] ?? false,
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 1.5,
      phone: json['phone'] ?? '+91-9440000000',
      lastDonation: json['lastDonation'] ?? 'Eligible',
      verified: json['verified'] ?? true,
      latitude: (json['lat'] as num?)?.toDouble() ?? 16.5167,
      longitude: (json['lng'] as num?)?.toDouble() ?? 80.6500,
      locationName: json['location'] ?? 'Vijayawada Region',
    );
  }
}

class BloodBankModel {
  final String id;
  final String name;
  final String city;
  final String contactNumber;
  final Map<String, int> stock;
  final double latitude;
  final double longitude;
  double? distanceKm;

  BloodBankModel({
    required this.id,
    required this.name,
    required this.city,
    required this.contactNumber,
    required this.stock,
    required this.latitude,
    required this.longitude,
    this.distanceKm,
  });

  factory BloodBankModel.fromJson(Map<String, dynamic> json) {
    Map<String, int> parsedStock = {};
    if (json['stock'] != null) {
      json['stock'].forEach((k, v) {
        parsedStock[k.toString()] = (v as num).toInt();
      });
    }
    return BloodBankModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Blood Bank',
      city: json['city'] ?? '',
      contactNumber: json['contact_number'] ?? json['phone'] ?? '+91-108',
      stock: parsedStock,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 16.5167,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 80.6500,
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
    );
  }
}
