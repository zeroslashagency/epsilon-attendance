import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart'; // Ensure this is added
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/attendance_provider.dart';

class OverviewScreen extends StatelessWidget {
  const OverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final attendanceProvider = Provider.of<AttendanceProvider>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Palette (Clean/Premium Theme)
    final bgBase = isDark ? const Color(0xFF050505) : const Color(0xFFF9FAFB);
    final accentGreen = const Color(0xFF34D399); // Soft Emerald
    final accentBlue = const Color(0xFF38BDF8); // Sky Blue
    final accentPink = const Color(0xFFFB7185); // Rose
    final textMain = isDark ? Colors.white : const Color(0xFF111827);
    final textSub = isDark ? Colors.white54 : Colors.grey.shade600;

    return Scaffold(
      backgroundColor: bgBase,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "OVERVIEW",
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: textSub,
                      letterSpacing: 2,
                      fontWeight: FontWeight.w600,
                    ),
                  ).animate().fadeIn().slideX(),
                  const SizedBox(height: 8),
                  Text(
                    "Dashboard",
                    style: GoogleFonts.inter(
                      fontSize: 32,
                      color: textMain,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -1,
                    ),
                  ).animate().fadeIn(delay: 200.ms),
                ],
              ),
              const SizedBox(height: 32),

              // BENTO GRID LAYOUT
              // Row 1: Pulse Chart (Large) + Efficiency (Small)
              SizedBox(
                height: 240, // Slightly taller for cleaner layout
                child: Row(
                  children: [
                    // Attendance Pulse (2/3 width)
                    Expanded(
                      flex: 2,
                      child: _GlassCard(
                        isDark: isDark,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Attendance Rate",
                              style: GoogleFonts.inter(
                                color: textSub,
                                fontSize: 13, // Standard readable size
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const Spacer(),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: Alignment.centerLeft,
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.baseline,
                                textBaseline: TextBaseline.alphabetic,
                                children: [
                                  Text(
                                    "${attendanceProvider.attendanceRate.toStringAsFixed(0)}%",
                                    style: GoogleFonts.inter(
                                      fontSize: 42, // Big clean number
                                      color: textMain,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: -2,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: accentGreen.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      attendanceProvider.attendanceRate >= 90
                                          ? "Exemplary"
                                          : "Good",
                                      style: GoogleFonts.inter(
                                        color: accentGreen,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                            // Line Chart Area
                            Expanded(
                              flex: 2,
                              child: _PulseChart(
                                activity: attendanceProvider.monthlyActivity
                                    .map((e) => e.toDouble())
                                    .toList(),
                                color: accentGreen,
                                isDark: isDark,
                              ),
                            ),
                          ],
                        ),
                      ).animate().scale(delay: 100.ms, duration: 400.ms),
                    ),
                    const SizedBox(width: 16),
                    // On Time (1/3 width)
                    Expanded(
                      flex: 1,
                      child: _GlassCard(
                        isDark: isDark,
                        // No colored BG, just clean
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "On Time",
                              style: GoogleFonts.inter(
                                color: textSub,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Expanded(
                              child: Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Stack(
                                      alignment: Alignment.center,
                                      children: [
                                        SizedBox(
                                          height: 80,
                                          width: 80,
                                          child: CircularProgressIndicator(
                                            value:
                                                attendanceProvider.totalDays > 0
                                                ? attendanceProvider
                                                          .onTimeCount /
                                                      attendanceProvider
                                                          .totalDays
                                                : 0,
                                            backgroundColor: isDark
                                                ? Colors.grey.shade800
                                                : Colors.grey.shade200,
                                            color: accentBlue,
                                            strokeWidth: 8,
                                            strokeCap: StrokeCap.round,
                                          ),
                                        ),
                                        Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Icons.bolt_rounded,
                                              color: accentBlue,
                                              size: 28,
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      "${attendanceProvider.onTimeCount}",
                                      style: GoogleFonts.inter(
                                        fontSize: 28,
                                        color: textMain,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: -1,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ).animate().scale(delay: 200.ms, duration: 450.ms),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Row 2: Heatmap (Full Width)
              _GlassCard(
                    isDark: isDark,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Activity History",
                              style: GoogleFonts.inter(
                                color: textSub,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            // Legend
                            Row(
                              children: [
                                _LegendDot(
                                  color: isDark
                                      ? const Color(0xFF2C2C2E)
                                      : Colors.grey.shade300,
                                  label: "Off",
                                ),
                                const SizedBox(width: 12),
                                _LegendDot(color: accentPink, label: "Late"),
                                const SizedBox(width: 12),
                                _LegendDot(
                                  color: accentGreen,
                                  label: "Present",
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        _HeatmapGrid(
                          activity: attendanceProvider.monthlyActivity
                              .map((e) => e.toDouble())
                              .toList(),
                          accentGreen: accentGreen,
                          accentPink: accentPink,
                          baseColor: isDark
                              ? const Color(0xFF2C2C2E)
                              : Colors.grey.shade300,
                        ),
                      ],
                    ),
                  )
                  .animate()
                  .fadeIn(delay: 300.ms)
                  .slideY(begin: 0.1, end: 0, duration: 500.ms),

              const SizedBox(height: 16),

              // Row 3: Detail Grid (2x2)
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 1.6, // Wider cards
                children: [
                  _StatTile(
                    label: "Work Hours",
                    value: attendanceProvider.avgWorkHours,
                    icon: Icons.access_time_filled,
                    color: Colors.purpleAccent,
                    isDark: isDark,
                  ),
                  _StatTile(
                    label: "Overtime",
                    value: attendanceProvider.overtimeHours,
                    icon: Icons.timer,
                    color: Colors.amber,
                    isDark: isDark,
                  ),
                  _StatTile(
                    label: "Late Days",
                    value: "${attendanceProvider.lateCount}",
                    icon: Icons.warning_rounded,
                    color: accentPink,
                    isDark: isDark,
                  ),
                  _StatTile(
                    label: "Total Days",
                    value: "${attendanceProvider.totalDays}",
                    icon: Icons.calendar_today,
                    color: Colors.blueGrey,
                    isDark: isDark,
                  ),
                ],
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

// --- SUB WIDGETS ---

class _GlassCard extends StatelessWidget {
  final Widget child;
  final bool isDark;

  const _GlassCard({required this.child, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: (isDark
            ? const Color(0xFF141416).withValues(alpha: 0.8)
            : Colors.white),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: (isDark
              ? Colors.white.withValues(alpha: 0.05)
              : Colors.grey.shade200),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withValues(alpha: 0.2)
                : Colors.grey.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _PulseChart extends StatelessWidget {
  final List<double> activity;
  final Color color;
  final bool isDark;

  const _PulseChart({
    required this.activity,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    // Generate synthetic smooth data logic just for visual "Pulse" effect
    // We'll map 0->0, 1->0.5, 2->1 for the Y axis
    final spots = activity.asMap().entries.map((e) {
      double y = 0;
      if (e.value == 1) y = 1; // Late
      if (e.value == 2) y = 2; // Present
      return FlSpot(e.key.toDouble(), y);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        minY: -0.5,
        maxY: 2.5,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            curveSmoothness: 0.35, // Smoother curve
            color: color,
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  color.withValues(alpha: 0.2),
                  color.withValues(alpha: 0.0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeatmapGrid extends StatelessWidget {
  final List<double> activity;
  final Color accentGreen;
  final Color accentPink;
  final Color baseColor;

  const _HeatmapGrid({
    required this.activity,
    required this.accentGreen,
    required this.accentPink,
    required this.baseColor,
  });

  @override
  Widget build(BuildContext context) {
    // Display last 28 days (4 weeks) for perfect grid (7 columns x 4 rows? No, 7 days x 4 weeks)
    // Actually typically horizontal scroll or fixed rows.
    // Let's do 7 columns (days) logic. Or just a wrap.
    // Design screenshot shows dots.

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 10, // 10 dots per row
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
      ),
      itemCount: 30, // Limit to 30 dots
      itemBuilder: (context, index) {
        // Handle index out of range if activity < 30
        double val = 0;
        if (index < activity.length) {
          val = activity[index];
        }

        Color color = baseColor;
        if (val == 2) color = accentGreen;
        if (val == 1) color = accentPink;

        return AnimatedContainer(
          duration: 600.ms,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(6), // Slightly softer square
            boxShadow: val > 0
                ? [
                    BoxShadow(
                      color: color.withValues(alpha: 0.5),
                      blurRadius: 6,
                      spreadRadius: 1,
                    ),
                  ]
                : null,
          ),
        ).animate(delay: (index * 20).ms).fadeIn(); // Staggered fade in
      },
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            color: Colors.grey.shade500,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final bool isDark;

  const _StatTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final textMain = isDark ? Colors.white : const Color(0xFF111827);

    return _GlassCard(
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(
                  color: isDark ? Colors.grey.shade500 : Colors.grey.shade600,
                  fontSize: 12, // Subtitle size
                  fontWeight: FontWeight.w500,
                ),
              ),
              Icon(icon, color: color, size: 18),
            ],
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              color: textMain,
              fontSize: 22,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    ).animate().scale(duration: 400.ms, curve: Curves.easeOut);
  }
}
