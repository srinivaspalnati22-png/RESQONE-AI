import 'package:flutter/material.dart';
import 'accident_sensor_screen.dart';
import 'dashboard_hospital_screen.dart';
import 'blood_donor_screen.dart';
import 'snakebite_screen.dart';
import '../core/theme/app_theme.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    AccidentSensorScreen(),
    DashboardHospitalScreen(),
    BloodDonorScreen(),
    SnakebiteScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppTheme.surfaceBorder, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.car_crash_outlined),
              activeIcon: Icon(Icons.car_crash, color: AppTheme.emergencyRed),
              label: 'Accident SOS',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard, color: AppTheme.primaryCyan),
              label: 'Hospital Base',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.water_drop_outlined),
              activeIcon: Icon(Icons.water_drop, color: AppTheme.emergencyRed),
              label: 'Blood Match',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.shield_outlined),
              activeIcon: Icon(Icons.shield, color: AppTheme.warningAmber),
              label: 'Snakebite AVS',
            ),
          ],
        ),
      ),
    );
  }
}
