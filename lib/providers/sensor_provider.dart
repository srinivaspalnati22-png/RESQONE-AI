import 'dart:async';
import 'package:flutter/material.dart';
import '../services/sensor_service.dart';

class SensorProvider extends ChangeNotifier {
  final SensorService _sensorService = SensorService();

  double _gForce = 1.0;
  double _roll = 0.0;
  double _pitch = 0.0;
  double _speedKmh = 85.0;
  bool _isCrashTriggered = false;
  bool _isHardwareSensorActive = false;
  int _sosCountdown = 5;
  Timer? _countdownTimer;

  double get gForce => _gForce;
  double get roll => _roll;
  double get pitch => _pitch;
  double get speedKmh => _speedKmh;
  bool get isCrashTriggered => _isCrashTriggered;
  bool get isHardwareSensorActive => _isHardwareSensorActive;
  int get sosCountdown => _sosCountdown;

  SensorProvider() {
    _initSensors();
  }

  void _initSensors() {
    _sensorService.startListening();
    _sensorService.sensorStream.listen((reading) {
      _gForce = reading.gForce;
      _roll = reading.gyroRoll;
      _pitch = reading.gyroPitch;
      _isHardwareSensorActive = true;
      if (reading.isImpactDetected && !_isCrashTriggered) {
        triggerSimulatedCrash();
      }
      notifyListeners();
    });
  }

  // Crash Simulation Trigger for Demo / Testing
  void triggerSimulatedCrash({
    double customGForce = 12.8,
    double customRoll = 180.0,
    double customPitch = 45.0,
  }) {
    _isCrashTriggered = true;
    _gForce = customGForce;
    _roll = customRoll;
    _pitch = customPitch;
    _speedKmh = 0.0; // Sudden stop from 85 km/h
    _sosCountdown = 5;
    notifyListeners();

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_sosCountdown > 0) {
        _sosCountdown--;
        notifyListeners();
      } else {
        _countdownTimer?.cancel();
      }
    });
  }

  void cancelSOS() {
    _countdownTimer?.cancel();
    _isCrashTriggered = false;
    _gForce = 1.0;
    _roll = 0.0;
    _pitch = 0.0;
    _speedKmh = 80.0;
    _sosCountdown = 5;
    notifyListeners();
  }

  void resetSimulation() {
    cancelSOS();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _sensorService.dispose();
    super.dispose();
  }
}
