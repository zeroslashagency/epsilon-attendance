import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../models/fir_model.dart';

class FirReportCard extends StatelessWidget {
  final FirReport report;
  final VoidCallback onTap;

  const FirReportCard({super.key, required this.report, required this.onTap});

  // Gradient Themes matching the Vivid Design
  List<Color> _getGradient(FirType type, FirPriority priority, bool isDark) {
    if (type == FirType.positive) {
      // Emerald/Teal for Positive
      return [
        const Color(0xFF10B981).withValues(alpha: 0.8),
        const Color(0xFF14B8A6).withValues(alpha: 0.6),
      ];
    }

    switch (priority) {
      case FirPriority.critical:
        // Vivid Purple/Pink for High/Critical
        return [
          const Color(0xFFA855F7).withValues(alpha: 0.8), // Purple
          const Color(0xFFEC4899).withValues(alpha: 0.8), // Pink
        ];
      case FirPriority.high:
        // Orange/Amber for High (Medium visually in web map, but mapping strict types)
        // Let's stick to the mockup: High -> Purple/Pink, Medium -> Orange, Low -> Blue
        return [
          const Color(0xFFA855F7).withValues(alpha: 0.8),
          const Color(0xFFEC4899).withValues(alpha: 0.8),
        ];
      case FirPriority.medium:
        // Vivid Orange/Amber
        return [
          const Color(0xFFF97316).withValues(alpha: 0.8),
          const Color(0xFFEAB308).withValues(alpha: 0.8),
        ];
      case FirPriority.low:
        // Vivid Blue/Sky
        return [
          const Color(0xFF3B82F6).withValues(alpha: 0.8),
          const Color(0xFF0EA5E9).withValues(alpha: 0.8),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gradientColors = _getGradient(report.type, report.priority, isDark);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24), // Large rounded corners
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: gradientColors.first.withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Priority Badge & Avatar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(
                        alpha: 0.2,
                      ), // Glassy dark pill
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      report.type == FirType.positive
                          ? 'POSITIVE'
                          : report.priority.name.toUpperCase(),
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: Colors.white.withValues(alpha: 0.3),
                    child: Text(
                      report.reporterName.isNotEmpty
                          ? report.reporterName[0]
                          : '?',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Title
              Text(
                report.title,
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  height: 1.2,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 16),

              // Footer: Status & Date
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      report.statusLabel,
                      style: GoogleFonts.inter(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today_rounded,
                        size: 12,
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        timeago.format(report.reportedAt),
                        style: GoogleFonts.inter(
                          color: Colors.white.withValues(alpha: 0.8),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
