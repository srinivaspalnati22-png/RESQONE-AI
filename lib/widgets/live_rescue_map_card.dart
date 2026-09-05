import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme/app_theme.dart';

class LiveRescueMapCard extends StatelessWidget {
  final LatLng victimLocation;
  final LatLng hospitalLocation;
  final List<LatLng> routeWaypoints;
  final String hospitalName;

  const LiveRescueMapCard({
    super.key,
    this.victimLocation = const LatLng(16.5412, 80.5843), // Gollapudi Crash Site
    this.hospitalLocation = const LatLng(16.5167, 80.6500), // GGH Vijayawada
    this.routeWaypoints = const [
      LatLng(16.5167, 80.6500), // Hospital
      LatLng(16.5240, 80.6220), // Bhavanipuram
      LatLng(16.5335, 80.6020), // NH-16 Flyover
      LatLng(16.5412, 80.5843), // Crash Site
    ],
    this.hospitalName = 'GGH Vijayawada (Trauma Bay)',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 240,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.surfaceBorder),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          FlutterMap(
            options: MapOptions(
              initialCenter: const LatLng(16.5280, 80.6170),
              initialZoom: 12.8,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.resqone.ai',
              ),
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: routeWaypoints,
                    color: AppTheme.emergencyRed,
                    strokeWidth: 4.0,
                  ),
                ],
              ),
              MarkerLayer(
                markers: [
                  // Victim Marker
                  Marker(
                    point: victimLocation,
                    width: 44,
                    height: 44,
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.emergencyRed,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.emergencyRed.withOpacity(0.8),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: const Icon(Icons.warning, color: Colors.white, size: 22),
                    ),
                  ),
                  // Hospital Marker
                  Marker(
                    point: hospitalLocation,
                    width: 44,
                    height: 44,
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.primaryCyan,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryCyan.withOpacity(0.8),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: const Icon(Icons.local_hospital, color: Colors.black, size: 22),
                    ),
                  ),
                ],
              ),
            ],
          ),
          Positioned(
            bottom: 10,
            left: 10,
            right: 10,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark.withOpacity(0.92),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.surfaceBorder),
              ),
              child: Row(
                children: [
                  const Icon(Icons.navigation, color: AppTheme.primaryCyan, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "Active GPS Corridor: $hospitalName ➔ Crash Site",
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
