import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'attendance_screen.dart';
import 'calendar_screen.dart';
import 'overview_screen.dart';
import 'profile_screen.dart';
import 'fir/fir_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = [
    AttendanceScreen(),
    CalendarScreen(),
    OverviewScreen(),
    FirScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    HapticFeedback.lightImpact(); // Match haptic feedback from image vibe (premium)
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true, // Important for floating navbar
      body: _screens[_selectedIndex],
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(left: 20, right: 20, bottom: 20),
          child: Container(
            height: 70,
            decoration: BoxDecoration(
              color: const Color(0xFF0F1115), // Dark/Black color from image
              borderRadius: BorderRadius.circular(40), // Pill shape
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildNavItem(0, Icons.home_outlined), // Attendance
                _buildNavItem(1, Icons.grid_view), // Calendar (Grid visual)
                _buildNavItem(2, Icons.bar_chart_rounded), // Overview (Stats)
                _buildNavItem(3, Icons.shield_outlined), // FIR
                _buildNavItem(4, Icons.person_outline), // Profile
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon) {
    final isSelected = _selectedIndex == index;

    return GestureDetector(
      onTap: () => _onItemTapped(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: isSelected ? Colors.black : Colors.white,
          size: 24,
        ),
      ),
    );
  }
}
