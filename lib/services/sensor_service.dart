import 'dart:async';
import 'dart:math';
import 'package:sensors_plus/sensors_plus.dart';

class SensorReading {
  final double x;
  final double y;
  final double z;
  final double gForce;
  final double gyroRoll;
  final double gyroPitch;
  final double gyroYaw;
  final double speedKmh;
  final bool isImpactDetected;

  SensorReading({
    required this.x,
    required this.y,
    required this.z,
    required this.gForce,
    required this.gyroRoll,
    required this.gyroPitch,
    required this.gyroYaw,
    required this.speedKmh,
    required this.isImpactDetected,
  });
}

class SensorService {
  StreamSubscription<UserAccelerometerEvent>? _accelSub;
  StreamSubscription<GyroscopeEvent>? _gyroSub;

  double _latestX = 0.0;
  double _latestY = 0.0;
  double _latestZ = 9.8;
  double _gyroRoll = 0.0;
  double _gyroPitch = 0.0;
  double _gyroYaw = 0.0;

  final _sensorController = StreamController<SensorReading>.broadcast();
  Stream<SensorReading> get sensorStream => _sensorController.stream;

  void startListening() {
    try {
      _accelSub = userAccelerometerEventStream().listen((UserAccelerometerEvent event) {
        _latestX = event.x;
        _latestY = event.y;
        _latestZ = event.z;
        _evaluateSensorData();
      }, onError: (e) {
        print("Hardware accelerometer not available: $e");
      });

      _gyroSub = gyroscopeEventStream().listen((GyroscopeEvent event) {
        _gyroRoll = event.x;
        _gyroPitch = event.y;
        _gyroYaw = event.z;
      }, onError: (e) {
        print("Hardware gyroscope not available: $e");
      });
    } catch (e) {
      print("Sensor initialization error: $e");
    }
  }

  void _evaluateSensorData() {
    // G-Force Magnitude: sqrt(x^2 + y^2 + z^2) / 9.8
    final magnitude = sqrt(_latestX * _latestX + _latestY * _latestY + _latestZ * _latestZ);
    final gForce = magnitude / 9.8;
    final isImpact = gForce >= 4.5; // High threshold for crash

    _sensorController.add(SensorReading(
      x: _latestX,
      y: _latestY,
      z: _latestZ,
      gForce: double.parse(gForce.toStringAsFixed(2)),
      gyroRoll: double.parse(_gyroRoll.toStringAsFixed(2)),
      gyroPitch: double.parse(_gyroPitch.toStringAsFixed(2)),
      gyroYaw: double.parse(_gyroYaw.toStringAsFixed(2)),
      speedKmh: 45.0,
      isImpactDetected: isImpact,
    ));
  }

  void dispose() {
    _accelSub?.cancel();
    _gyroSub?.cancel();
    _sensorController.close();
  }
}
