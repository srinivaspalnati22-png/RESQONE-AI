class SnakeSpeciesModel {
  final String id;
  final String commonName;
  final String scientificName;
  final String venomType;
  final String dangerLevel;
  final String description;
  final List<String> keyFeatures;
  final List<String> firstAidDo;
  final List<String> firstAidDont;
  final String antivenomRequirement;
  final String habitat;

  SnakeSpeciesModel({
    required this.id,
    required this.commonName,
    required this.scientificName,
    required this.venomType,
    required this.dangerLevel,
    required this.description,
    required this.keyFeatures,
    required this.firstAidDo,
    required this.firstAidDont,
    required this.antivenomRequirement,
    required this.habitat,
  });

  factory SnakeSpeciesModel.fromJson(Map<String, dynamic> json) {
    return SnakeSpeciesModel(
      id: json['id'] ?? '',
      commonName: json['common_name'] ?? 'Unknown Snake',
      scientificName: json['scientific_name'] ?? '',
      venomType: json['venom_type'] ?? 'Neurotoxic / Hemotoxic',
      dangerLevel: json['danger_level'] ?? 'HIGH',
      description: json['description'] ?? '',
      keyFeatures: (json['key_features'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      firstAidDo: (json['first_aid_do'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      firstAidDont: (json['first_aid_dont'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      antivenomRequirement: json['antivenom_requirement'] ?? 'Polyvalent Antivenom',
      habitat: json['habitat'] ?? 'Agricultural fields & scrublands',
    );
  }
}
