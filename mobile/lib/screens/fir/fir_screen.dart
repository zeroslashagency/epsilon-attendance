import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'tabs/fir_overview_tab.dart';
import 'tabs/fir_reports_tab.dart';
import 'create_fir_screen.dart';

class FirAnalyticsTab extends StatelessWidget {
  const FirAnalyticsTab({super.key});
  @override
  Widget build(BuildContext context) => Center(
    child: Text(
      "Analytics Coming Soon",
      style: GoogleFonts.inter(color: Colors.white),
    ),
  );
}

class FirScreen extends StatefulWidget {
  const FirScreen({super.key});

  @override
  State<FirScreen> createState() => _FirScreenState();
}

class _FirScreenState extends State<FirScreen> {
  int _selectedIndex = 0;

  final List<String> _tabs = ["Overview", "Reports", "Analytics"];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = Theme.of(context).scaffoldBackgroundColor;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Text(
                "FIR",
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Custom Segmented Control
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.05)
                    : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: List.generate(_tabs.length, (index) {
                  final isSelected = _selectedIndex == index;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedIndex = index),
                      child: AnimatedContainer(
                        duration: 200.ms,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (isDark
                                    ? const Color(
                                        0xFF3B82F6,
                                      ).withValues(alpha: 0.2)
                                    : Colors.white)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: isSelected && !isDark
                              ? [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.05),
                                    blurRadius: 4,
                                  ),
                                ]
                              : null,
                          border: isSelected && isDark
                              ? Border.all(
                                  color: const Color(
                                    0xFF3B82F6,
                                  ).withValues(alpha: 0.3),
                                )
                              : null,
                        ),
                        child: Text(
                          _tabs[index],
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: isSelected
                                ? FontWeight.w600
                                : FontWeight.w500,
                            color: isSelected
                                ? (isDark
                                      ? const Color(0xFF60A5FA)
                                      : Colors.black)
                                : (isDark ? Colors.grey : Colors.grey.shade600),
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 24),

            // Main Content
            Expanded(
              child: IndexedStack(
                index: _selectedIndex,
                children: const [
                  FirOverviewTab(),
                  FirReportsTab(),
                  FirAnalyticsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: _selectedIndex == 0 || _selectedIndex == 1
          ? Padding(
              padding: const EdgeInsets.only(bottom: 90.0),
              child: FloatingActionButton.extended(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const CreateFirScreen(),
                    ),
                  );
                },
                backgroundColor: const Color(0xFF3B82F6),
                icon: const Icon(Icons.add, color: Colors.white),
                label: Text(
                  "Create Report",
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ).animate().scale(),
            )
          : null,
    );
  }
}
