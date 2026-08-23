import 'package:flutter/material.dart';

class LanguageProvider extends ChangeNotifier {
  String _currentLanguage = 'te'; // Telugu default or English 'en'

  String get currentLanguage => _currentLanguage;
  bool get isTelugu => _currentLanguage == 'te';

  void toggleLanguage() {
    _currentLanguage = (_currentLanguage == 'en') ? 'te' : 'en';
    notifyListeners();
  }

  void setLanguage(String lang) {
    _currentLanguage = lang;
    notifyListeners();
  }

  // Translation dictionary
  static const Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'app_title': 'RESQONE AI+',
      'accident_sensor_title': 'Vehicle Sensor Fusion & Crash Detection',
      'live_sensor_active': 'HARDWARE SENSORS ACTIVE',
      'impact_gforce': 'Impact G-Force',
      'gyro_orientation': '3D Gyro Tilt',
      'speed_telemetry': 'GPS Speed',
      'simulate_crash': 'Simulate 12.8G High Impact Crash',
      'cancel_sos': 'Cancel SOS Countdown',
      'mission_control': 'Hospital Mission Control',
      'active_missions': 'Active Rescue Missions',
      'accept_case': 'Accept Case & Dispatch Ambulance',
      'case_accepted': 'CASE ACCEPTED (ICU LOCKED)',
      'blood_match': 'Smart Blood Donor Matcher',
      'select_blood_group': 'Select Needed Blood Group:',
      'compatible_donors': 'Compatible Verified Donors Nearby',
      'snakebite_title': 'Snakebite AI & Antivenom Stock Radar',
      'call_responder': 'Call Responder',
      'send_location': 'Send Location SMS',
    },
    'te': {
      'app_title': 'RESQONE AI+ ఎమర్జెన్సీ',
      'accident_sensor_title': 'వెహికల్ సెన్సార్ ఫ్యూజన్ & క్రాష్ డిటెక్షన్',
      'live_sensor_active': 'లైవ్ సెన్సార్లు యాక్టివ్',
      'impact_gforce': 'ఇంపాక్ట్ జి-ఫోర్స్',
      'gyro_orientation': '3D గైరో టిల్ట్',
      'speed_telemetry': 'GPS వేగం',
      'simulate_crash': '12.8G యాక్సిడెంట్ క్రాష్ సిమ్యులేట్ చేయండి',
      'cancel_sos': 'SOS కౌంట్‌డౌన్ రద్దు చేయండి',
      'mission_control': 'హాస్పిటల్ మిషన్ కంట్రోల్ డ్యాష్‌బోర్డ్',
      'active_missions': 'లైవ్ రెస్క్యూ మిషన్లు',
      'accept_case': 'కేస్ యాక్సెప్ట్ చేసి అంబులెన్స్ పంపండి',
      'case_accepted': 'కేస్ యాక్సెప్ట్ అయ్యింది (ICU లాక్డ్)',
      'blood_match': 'బ్లడ్ డోనర్ మ్యాచింగ్ మాడ్యూల్',
      'select_blood_group': 'కావలసిన బ్లడ్ గ్రూప్ ఎంచుకోండి:',
      'compatible_donors': 'సమీపంలోని వెరిఫైడ్ డోనర్స్',
      'snakebite_title': 'పాము కాటు AI & యాంటీవెనమ్ రాడార్',
      'call_responder': 'కాల్ చేయండి',
      'send_location': 'లొకేషన్ SMS పంపండి',
    }
  };

  String getText(String key) {
    return _localizedValues[_currentLanguage]?[key] ??
        _localizedValues['en']?[key] ??
        key;
  }
}
