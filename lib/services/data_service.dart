import 'dart:convert';
import 'dart:math';
import 'package:flutter/services.dart';
import '../models/hospital_model.dart';
import '../models/donor_model.dart';
import '../models/snake_species_model.dart';
import '../models/accident_record_model.dart';

class DataService {
  // Haversine Distance Calculation (Km)
  static double calculateDistance(
      double lat1, double lon1, double lat2, double lon2) {
    const p = 0.017453292519943295; // Math.PI / 180
    final c = cos;
    final a = 0.5 -
        c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
    return double.parse((12742 * asin(sqrt(a))).toStringAsFixed(1)); // 2 * R; R = 6371 km
  }

  // Load Hospitals
  static Future<List<HospitalModel>> getHospitals(
      {double userLat = 16.5167, double userLng = 80.6500}) async {
    try {
      final String jsonString =
          await rootBundle.loadString('assets/data/hospitals.json');
      final List<dynamic> jsonList = json.decode(jsonString);
      final hospitals =
          jsonList.map((j) => HospitalModel.fromJson(j)).toList();

      for (var h in hospitals) {
        h.distanceKm =
            calculateDistance(userLat, userLng, h.latitude, h.longitude);
      }

      hospitals.sort((a, b) => (a.distanceKm ?? 0).compareTo(b.distanceKm ?? 0));
      return hospitals;
    } catch (e) {
      print("Error loading hospitals: $e");
      return [];
    }
  }

  // Load Blood Banks
  static Future<List<BloodBankModel>> getBloodBanks(
      {double userLat = 16.5167, double userLng = 80.6500}) async {
    try {
      final String jsonString =
          await rootBundle.loadString('assets/data/blood_banks.json');
      final List<dynamic> jsonList = json.decode(jsonString);
      final bloodBanks =
          jsonList.map((j) => BloodBankModel.fromJson(j)).toList();

      for (var b in bloodBanks) {
        b.distanceKm =
            calculateDistance(userLat, userLng, b.latitude, b.longitude);
      }

      bloodBanks.sort((a, b) => (a.distanceKm ?? 0).compareTo(b.distanceKm ?? 0));
      return bloodBanks;
    } catch (e) {
      print("Error loading blood banks: $e");
      return [];
    }
  }

  // Load Verified Community Donors
  static List<DonorModel> getVerifiedCommunityDonors() {
    return [
      DonorModel(
        id: 'dnr-1',
        name: 'K. Venkata Ramana',
        bloodGroup: 'O-',
        isUniversal: true,
        distanceKm: 1.4,
        phone: '+919440123401',
        lastDonation: '4 months ago (Eligible)',
        verified: true,
        latitude: 16.5210,
        longitude: 80.6440,
        locationName: 'Governorpet, Vijayawada',
      ),
      DonorModel(
        id: 'dnr-2',
        name: 'S. Srinivas Rao',
        bloodGroup: 'O-',
        isUniversal: true,
        distanceKm: 2.3,
        phone: '+919440123402',
        lastDonation: '6 months ago (Eligible)',
        verified: true,
        latitude: 16.5100,
        longitude: 80.6550,
        locationName: 'Bhavanipuram, Vijayawada',
      ),
      DonorModel(
        id: 'dnr-3',
        name: 'Dr. P. Rajesh Kumar',
        bloodGroup: 'A+',
        isUniversal: false,
        distanceKm: 1.8,
        phone: '+919440123403',
        lastDonation: '3 months ago (Eligible)',
        verified: true,
        latitude: 16.5280,
        longitude: 80.6320,
        locationName: 'Suryaraopet, Vijayawada',
      ),
      DonorModel(
        id: 'dnr-4',
        name: 'M. Anjaneyulu',
        bloodGroup: 'B+',
        isUniversal: false,
        distanceKm: 2.9,
        phone: '+919440123404',
        lastDonation: '5 months ago (Eligible)',
        verified: true,
        latitude: 16.5050,
        longitude: 80.6400,
        locationName: 'Labbipet, Vijayawada',
      ),
      DonorModel(
        id: 'dnr-5',
        name: 'G. Lakshmi Narayana',
        bloodGroup: 'O+',
        isUniversal: false,
        distanceKm: 2.1,
        phone: '+919440123405',
        lastDonation: '2 months ago (Eligible)',
        verified: true,
        latitude: 16.5330,
        longitude: 80.6200,
        locationName: 'Satyanarayanapuram, Vijayawada',
      ),
      DonorModel(
        id: 'dnr-6',
        name: 'B. Kishore Varma',
        bloodGroup: 'AB+',
        isUniversal: false,
        distanceKm: 3.4,
        phone: '+919440123406',
        lastDonation: '4 months ago (Eligible)',
        verified: true,
        latitude: 16.4950,
        longitude: 80.6600,
        locationName: 'Benz Circle, Vijayawada',
      ),
    ];
  }

  // Load Snake Species
  static Future<List<SnakeSpeciesModel>> getSnakeSpecies() async {
    try {
      final String jsonString =
          await rootBundle.loadString('assets/data/snake_species.json');
      final List<dynamic> jsonList = json.decode(jsonString);
      return jsonList.map((j) => SnakeSpeciesModel.fromJson(j)).toList();
    } catch (e) {
      print("Error loading snake species: $e");
      return [];
    }
  }

  // Load Zenodo Accident Records
  static Future<List<AccidentRecordModel>> getAccidentRecords() async {
    try {
      final String jsonString =
          await rootBundle.loadString('assets/data/accident_records.json');
      final List<dynamic> jsonList = json.decode(jsonString);
      return jsonList.map((j) => AccidentRecordModel.fromJson(j)).toList();
    } catch (e) {
      print("Error loading accident records: $e");
      return [];
    }
  }
}
