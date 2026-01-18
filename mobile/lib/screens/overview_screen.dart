import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../providers/attendance_provider.dart';
import '../providers/auth_provider.dart';

class OverviewScreen extends StatelessWidget {
  const OverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final attendanceProvider = Provider.of<AttendanceProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Theme-aware colors
    // Theme-aware colors derived from global theme
    final bgBase = Theme.of(context).scaffoldBackgroundColor;
    final cardBg = Theme.of(context).cardColor;
    final colorScheme = Theme.of(context).colorScheme;

    // Accents now pull from the global theme's colorScheme or AppPalette directly if needed
    final accentGreen = colorScheme.secondary;
    final accentCyan = colorScheme.primary;

    final textPrimary =
        Theme.of(context).textTheme.bodyLarge?.color ?? Colors.white;
    final textSecondary =
        Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey.shade400;

    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);

    return Scaffold(
      backgroundColor: bgBase,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _getGreeting(),
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          color: textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ).animate().fadeIn().slideX(),
                      Text(
                        authProvider.employeeName?.split(' ').first ??
                            'Employee',
                        style: GoogleFonts.outfit(
                          fontSize: 28,
                          color: textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ).animate().fadeIn(delay: 100.ms).slideX(),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: borderColor),
                    ),
                    child: CircleAvatar(
                      radius: 24,
                      backgroundColor: cardBg,
                      child: Text(
                        (authProvider.employeeName ?? 'U')[0],
                        style: GoogleFonts.outfit(
                          color: textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ).animate().scale(delay: 200.ms),
                ],
              ),

              const SizedBox(height: 8),
              Text(
                DateFormat('MMMM d, yyyy').format(DateTime.now()),
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  color: textSecondary.withValues(alpha: 0.7),
                  letterSpacing: 0.5,
                ),
              ).animate().fadeIn(delay: 150.ms),

              const SizedBox(height: 32),

              // Hero Attendance Card
              Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(32),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark
                        ? [
                            const Color(0xFF2A2D35).withValues(alpha: 0.9),
                            const Color(0xFF1F2228).withValues(alpha: 0.95),
                          ]
                        : [const Color(0xFFE8F5E9), const Color(0xFFC8E6C9)],
                  ),
                  border: Border.all(color: borderColor, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: isDark
                          ? Colors.black.withValues(alpha: 0.3)
                          : Colors.black.withValues(alpha: 0.08),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                    BoxShadow(
                      color: accentGreen.withValues(alpha: isDark ? 0.05 : 0.1),
                      blurRadius: 30,
                      offset: const Offset(0, 0),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    // Background Glow
                    Positioned(
                      right: -50,
                      top: -50,
                      child:
                          Container(
                                width: 150,
                                height: 150,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: accentGreen.withValues(
                                    alpha: isDark ? 0.15 : 0.2,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: accentGreen.withValues(
                                        alpha: isDark ? 0.3 : 0.15,
                                      ),
                                      blurRadius: 50,
                                      spreadRadius: 10,
                                    ),
                                  ],
                                ),
                              )
                              .animate(
                                onPlay: (controller) =>
                                    controller.repeat(reverse: true),
                              )
                              .scale(
                                duration: 3.seconds,
                                begin: const Offset(1, 1),
                                end: const Offset(1.2, 1.2),
                              ),
                    ),

                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "${attendanceProvider.attendanceRate.toStringAsFixed(0)}%",
                                    style: GoogleFonts.outfit(
                                      fontSize: 44,
                                      fontWeight: FontWeight.bold,
                                      color: textPrimary,
                                      height: 1.0,
                                    ),
                                  ).animate().fadeIn().scale(),
                                  const SizedBox(height: 4),
                                  Text(
                                    "Attendance Rate",
                                    style: GoogleFonts.outfit(
                                      fontSize: 14,
                                      color: textSecondary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: accentGreen.withValues(
                                    alpha: isDark ? 0.15 : 0.2,
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: accentGreen.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Text(
                                  attendanceProvider.attendanceRate >= 90
                                      ? 'Exemplary'
                                      : 'Good',
                                  style: GoogleFonts.outfit(
                                    color: accentGreen,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ).animate().slideX(begin: 1).fadeIn(),
                            ],
                          ),
                          const Spacer(),
                          // Chart
                          SizedBox(
                            height: 60,
                            child: _PulseChart(
                              activity: attendanceProvider.monthlyActivity
                                  .map((e) => e.toDouble())
                                  .toList(),
                              color: accentGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().slideY(
                begin: 0.2,
                duration: 600.ms,
                curve: Curves.easeOutQuint,
              ),

              const SizedBox(height: 16),

              // Middle Row: On Time & Work Hours
              Row(
                children: [
                  // On Time Card
                  Expanded(
                    child: Container(
                      height: 140,
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: borderColor),
                        boxShadow: isDark
                            ? []
                            : [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "On Time",
                            style: GoogleFonts.outfit(
                              color: textSecondary,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const Spacer(),
                          Center(
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                SizedBox(
                                  height: 60,
                                  width: 60,
                                  child: CircularProgressIndicator(
                                    value: attendanceProvider.totalDays > 0
                                        ? attendanceProvider.onTimeCount /
                                              attendanceProvider.totalDays
                                        : 0,
                                    backgroundColor: isDark
                                        ? bgBase
                                        : Colors.grey.shade200,
                                    color: accentCyan,
                                    strokeWidth: 6,
                                    strokeCap: StrokeCap.round,
                                  ),
                                ),
                                Icon(
                                      Icons.bolt_rounded,
                                      color: accentCyan,
                                      size: 24,
                                    )
                                    .animate(
                                      onPlay: (controller) =>
                                          controller.repeat(reverse: true),
                                    )
                                    .scale(
                                      duration: 1.seconds,
                                      begin: const Offset(1, 1),
                                      end: const Offset(1.15, 1.15),
                                    ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          Center(
                            child: Text(
                              "${attendanceProvider.onTimeCount} Days",
                              style: GoogleFonts.outfit(
                                color: accentCyan,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ).animate(delay: 200.ms).scale(),
                  ),
                  const SizedBox(width: 12),

                  // Work Hours Card
                  Expanded(
                    child: Container(
                      height: 140,
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: borderColor),
                        boxShadow: isDark
                            ? []
                            : [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Work Hours",
                            style: GoogleFonts.outfit(
                              color: textSecondary,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            attendanceProvider.avgWorkHours,
                            style: GoogleFonts.outfit(
                              color: textPrimary,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ).animate().fadeIn(),
                          const Spacer(),
                          // Mini Bar Chart representation
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [24, 36, 22, 42, 32].map((h) {
                              return Container(
                                width: 6,
                                height: h.toDouble(),
                                decoration: BoxDecoration(
                                  color: accentCyan.withValues(alpha: 0.5),
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ).animate(delay: 300.ms).scale(),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Activity History Heatmap
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: borderColor),
                  boxShadow: isDark
                      ? []
                      : [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Activity History",
                          style: GoogleFonts.outfit(
                            color: textPrimary,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Icon(
                          Icons.calendar_month_rounded,
                          color: textSecondary,
                          size: 20,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Heatmap Grid
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final cellSize = (constraints.maxWidth - 56) / 8;
                        return Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: List.generate(30, (index) {
                            double val = 0;
                            if (index <
                                attendanceProvider.monthlyActivity.length) {
                              val = attendanceProvider.monthlyActivity[index]
                                  .toDouble();
                            }

                            Color dotColor = isDark
                                ? const Color(0xFF2C2C2E)
                                : Colors.grey.shade200;
                            if (val == 2) dotColor = accentGreen;
                            if (val == 1) dotColor = Colors.redAccent;

                            return Container(
                              width: cellSize,
                              height: cellSize,
                              decoration: BoxDecoration(
                                color: dotColor,
                                borderRadius: BorderRadius.circular(5),
                                boxShadow: val > 0
                                    ? [
                                        BoxShadow(
                                          color: dotColor.withValues(
                                            alpha: 0.4,
                                          ),
                                          blurRadius: 4,
                                          spreadRadius: 0,
                                        ),
                                      ]
                                    : [],
                              ),
                            ).animate(delay: (index * 20).ms).fadeIn().scale();
                          }),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    // Legend
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        _LegendDot(
                          color: isDark
                              ? const Color(0xFF2C2C2E)
                              : Colors.grey.shade200,
                          label: "Off",
                          textColor: textSecondary,
                        ),
                        const SizedBox(width: 10),
                        _LegendDot(
                          color: Colors.redAccent,
                          label: "Late",
                          textColor: textSecondary,
                        ),
                        const SizedBox(width: 10),
                        _LegendDot(
                          color: accentGreen,
                          label: "Present",
                          textColor: textSecondary,
                        ),
                      ],
                    ),
                  ],
                ),
              ).animate(delay: 400.ms).slideY(begin: 0.1).fadeIn(),

              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  final Color textColor;

  const _LegendDot({
    required this.color,
    required this.label,
    required this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 11,
            color: textColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _PulseChart extends StatelessWidget {
  final List<double> activity;
  final Color color;

  const _PulseChart({required this.activity, required this.color});

  @override
  Widget build(BuildContext context) {
    final spots = activity.asMap().entries.map((e) {
      double y = 0;
      if (e.value >= 1) y = e.value.toDouble();
      return FlSpot(e.key.toDouble(), y);
    }).toList();

    if (spots.isEmpty) {
      spots.add(const FlSpot(0, 0));
      spots.add(const FlSpot(10, 0));
    }

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
            curveSmoothness: 0.4,
            preventCurveOverShooting: true,
            color: color,
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  color.withValues(alpha: 0.25),
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
