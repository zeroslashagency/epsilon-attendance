import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../models/attendance_model.dart';

class DayDetailsSheet extends StatelessWidget {
  final ProcessedDayData data;

  const DayDetailsSheet({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final date = DateTime.parse(data.date);
    final formattedDate = DateFormat('EEEE, MMMM d, yyyy').format(date);
    // Use a dark background as requested/inferred from mockup, or theme card color
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final labelColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;

    return Container(
      decoration: BoxDecoration(color: backgroundColor),
      child: Column(
        children: [
          // Custom Header
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 60, 24, 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today_rounded,
                      color: textColor,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Day Details',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: Icon(Icons.close, color: textColor),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'View detailed attendance information including work intervals, punch events, and audit data for $formattedDate',
                    style: TextStyle(color: labelColor, height: 1.5),
                  ),
                  const SizedBox(height: 32),

                  // Date & Badges
                  Text(
                    formattedDate,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _buildStatusBadge(data.status),
                      const SizedBox(width: 12),
                      _buildConfidenceBadge(data.confidence),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Work Summary Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.03)
                          : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.1)
                            : Colors.grey.shade200,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.access_time_rounded,
                              size: 18,
                              color: labelColor,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Work Summary',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: labelColor,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Total Work Time',
                                  style: TextStyle(
                                    color: labelColor,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  data.totalHours,
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: textColor,
                                    letterSpacing: -1,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Intervals',
                                  style: TextStyle(
                                    color: labelColor,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${data.intervals.length}',
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: textColor,
                                    letterSpacing: -1,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 20),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Work Intervals
                  Text(
                    'Work Intervals',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (data.intervals.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.03)
                            : Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.1)
                              : Colors.grey.shade200,
                        ),
                      ),
                      child: Text(
                        'No work intervals recorded',
                        style: TextStyle(color: labelColor),
                        textAlign: TextAlign.center,
                      ),
                    )
                  else
                    ...data.intervals.map(
                      (interval) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 16,
                        ),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.transparent : Colors.white,
                          border: Border.all(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.15)
                                : Colors.grey.shade300,
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${interval.checkIn} - ${interval.checkOut}',
                              style: TextStyle(
                                color: textColor.withValues(alpha: 0.9),
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              interval.duration,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: textColor,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  const SizedBox(height: 32),

                  // Punch Events
                  Text(
                    'Punch Events',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ...(() {
                    final sortedLogs = List<PunchLog>.from(data.punchLogs)
                      ..sort((a, b) => b.time.compareTo(a.time));

                    return List.generate(sortedLogs.length, (index) {
                      final log = sortedLogs[index];
                      final isLast = index == sortedLogs.length - 1;
                      final isFirst = index == 0;

                      final dateTimeStr = '${data.date} ${log.time}';
                      DateTime? logDateTime;
                      try {
                        logDateTime = DateFormat(
                          'yyyy-MM-dd HH:mm',
                        ).parse(dateTimeStr);
                      } catch (e) {
                        logDateTime = DateTime.now();
                      }

                      return IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Time Column
                            SizedBox(
                              width: 60,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 0.0,
                                ),
                                child: Text(
                                  log.time,
                                  textAlign: TextAlign.right,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: textColor,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 20),

                            // Timeline Column
                            SizedBox(
                              width: 24,
                              child: Stack(
                                alignment: Alignment.topCenter,
                                children: [
                                  if (sortedLogs.length > 1)
                                    Positioned(
                                      top: isFirst ? 10 : 0,
                                      bottom: isLast ? null : 0,
                                      height: isLast ? 10 : null,
                                      child: Container(
                                        width: 2,
                                        color: Colors.grey.withValues(
                                          alpha: 0.3,
                                        ),
                                      ),
                                    ),

                                  Container(
                                    margin: const EdgeInsets.only(
                                      top: 2,
                                    ), // Vertical alignment adjustment
                                    width: 16,
                                    height: 16,
                                    decoration: BoxDecoration(
                                      color: backgroundColor,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: log.direction == 'in'
                                            ? Colors.greenAccent
                                            : Colors.orangeAccent,
                                        width: 3,
                                      ),
                                    ),
                                    child: Center(
                                      child: Container(
                                        width: 6,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: log.direction == 'in'
                                              ? Colors.greenAccent
                                              : Colors.orangeAccent,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 20),

                            // Content Column
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.only(bottom: 32.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                          color: log.direction == 'in'
                                              ? Colors.green.withValues(
                                                  alpha: 0.5,
                                                )
                                              : Colors.orange.withValues(
                                                  alpha: 0.5,
                                                ),
                                        ),
                                      ),
                                      child: Text(
                                        log.direction.toUpperCase(),
                                        style: TextStyle(
                                          color: log.direction == 'in'
                                              ? Colors.greenAccent
                                              : Colors.orangeAccent,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            timeago.format(
                                              logDateTime,
                                              locale: 'en_short',
                                            ),
                                            style: TextStyle(
                                              color: labelColor,
                                              fontSize: 13,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            'Device: ${log.deviceId}',
                                            style: TextStyle(
                                              color: labelColor.withValues(
                                                alpha: 0.7,
                                              ),
                                              fontSize: 11,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    });
                  })(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'present':
        color = Colors.green;
        break;
      case 'late':
        color = Colors.orange;
        break;
      case 'absent':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.toLowerCase(),
        style: const TextStyle(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildConfidenceBadge(String confidence) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.greenAccent),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        '$confidence confidence',
        style: const TextStyle(
          color: Colors.greenAccent,
          fontSize: 13,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
