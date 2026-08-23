class AppConstants {
  static const String appName = "RESQONE AI+";
  static const String appTagline = "Autonomous Emergency Intelligence & Rescue Mesh";

  // Default Geo Coordinates (Vijayawada / AP Hub)
  static const double defaultLat = 16.5167;
  static const double defaultLng = 80.6500;
  static const String defaultLocationName = "Vijayawada Central Hub, AP";

  // Default Emergency Contacts
  static const List<Map<String, String>> emergencyContacts = [
    {"name": "National Emergency 112", "phone": "112", "role": "Police / Fire / Rescue"},
    {"name": "Ambulance Lifeline 108", "phone": "108", "role": "ALS Medical Emergency"},
    {"name": "Father (Primary Contact)", "phone": "+919440123456", "role": "Family SOS"},
    {"name": "Brother (Secondary Contact)", "phone": "+919440654321", "role": "Family SOS"},
  ];

  // Blood Compatibility Matrix (Recipient -> Compatible Donors)
  static const Map<String, List<String>> bloodCompatibility = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  };
}
