import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../providers/fir_provider.dart';
import '../../../models/fir_model.dart';
import 'package:timeago/timeago.dart' as timeago;

class FirOverviewTab extends StatelessWidget {
  const FirOverviewTab({super.key});

  @override
  Widget build(BuildContext context) {
    debugPrint("Building FIR Overview Tab"); // Debug
    final provider = Provider.of<FirProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stats Grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.4,
            children: [
              _StatCard(
                title: "Total Reports",
                value: provider.totalReports.toString(),
                subtitle: "Last 7 days",
                icon: Icons.description_outlined,
                color: Colors.blue,
                isDark: isDark,
              ),
              _StatCard(
                title: "Pending",
                value: provider.pendingCount.toString(),
                subtitle: "Awaiting Action",
                icon: Icons.history_toggle_off,
                color: Colors.orange,
                isDark: isDark,
              ),
              _StatCard(
                title: "Resolved",
                value: provider.resolvedCount.toString(),
                subtitle: "Completed",
                icon: Icons.check_circle_outline,
                color: Colors.green,
                isDark: isDark,
              ),
              _StatCard(
                title: "Critical",
                value: provider.criticalCount.toString(),
                subtitle: "Urgent Attention",
                icon: Icons.warning_amber_rounded,
                color: Colors.red,
                isDark: isDark,
              ),
            ],
          ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1),

          const SizedBox(height: 32),

          // Activity Trends
          Text(
            "Activity Trends",
            style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Container(
            height: 200,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark ? Colors.white10 : Colors.grey.shade100,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: const FlTitlesData(
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  topTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                ),
                borderData: FlBorderData(show: false),
                minX: 0,
                maxX: 6,
                minY: 0,
                maxY: 6,
                lineBarsData: [
                  LineChartBarData(
                    spots: const [
                      FlSpot(0, 1),
                      FlSpot(1, 1.5),
                      FlSpot(2, 1.2),
                      FlSpot(3, 3),
                      FlSpot(4, 2.4),
                      FlSpot(5, 4),
                      FlSpot(6, 3.5),
                    ],
                    isCurved: true,
                    color: Colors.blue.shade400,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          Colors.blue.shade400.withValues(alpha: 0.3),
                          Colors.blue.shade400.withValues(alpha: 0.0),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(delay: 200.ms),

          const SizedBox(height: 32),

          // Recent Reports
          Text(
            "Recent Reports",
            style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          ...provider.recentReports.map(
            (report) => _ReportListItem(report: report, isDark: isDark),
          ),

          const SizedBox(height: 80), // Fab spacing
        ],
      ),
    );
  }
}

// Helper Widgets

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;
  final bool isDark;

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark
            ? color.withValues(alpha: 0.1)
            : color.withValues(alpha: 0.05), // Very light tint
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: isDark ? 0.2 : 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: color),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const Spacer(),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: isDark ? Colors.white60 : Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportListItem extends StatelessWidget {
  final FirReport report;
  final bool isDark;

  const _ReportListItem({required this.report, required this.isDark});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    if (report.type == FirType.positive) {
      statusColor = Colors.green;
    } else {
      // Negative
      switch (report.priority) {
        case FirPriority.critical:
          statusColor = Colors.red;
          break;
        case FirPriority.high:
          statusColor = Colors.orange;
          break;
        default:
          statusColor = Colors.blue;
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? Colors.white10 : Colors.grey.shade100,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              report.type == FirType.positive
                  ? Icons.thumb_up_rounded
                  : Icons.warning_amber_rounded,
              color: statusColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  report.title,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  "${report.statusLabel} • ${timeago.format(report.reportedAt)}",
                  style: GoogleFonts.inter(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              report.type == FirType.positive ? "Positive" : "Incident",
              style: GoogleFonts.inter(
                color: statusColor,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
