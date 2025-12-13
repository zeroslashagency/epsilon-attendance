import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/attendance_provider.dart';
import '../providers/theme_provider.dart';
import '../models/attendance_model.dart';
import '../widgets/day_details_sheet.dart';
import '../widgets/premium_loading_indicator.dart';
import 'package:animations/animations.dart';
import 'package:timeago/timeago.dart' as timeago;

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  // Dark Aubergine/Purple Color (Matching Calendar) - Header only
  final Color _darkPurple = const Color(0xFF2D2135);
  // Orange Accent
  final Color _orangeAccent = const Color(0xFFF2994A);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshData();
    });
  }

  Future<void> _refreshData() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.employeeCode != null) {
      await Provider.of<AttendanceProvider>(
        context,
        listen: false,
      ).fetchAttendanceData(authProvider.employeeCode!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final attendanceProvider = Provider.of<AttendanceProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final todayData = attendanceProvider.todayData;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Dynamic Body Color
    final bodyColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Scaffold(
      backgroundColor: _darkPurple,
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: _refreshData,
          color: _orangeAccent,
          backgroundColor: bodyColor,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      // Top Row: Company Title & Actions
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Epsilon',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Row(
                            children: [
                              _buildHeaderIcon(
                                Icons.notifications_outlined,
                                () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text("No new notifications"),
                                      duration: Duration(seconds: 1),
                                    ),
                                  );
                                },
                              ),
                              const SizedBox(width: 12),
                              _buildHeaderIcon(
                                themeProvider.isDarkMode
                                    ? Icons.light_mode_outlined
                                    : Icons.dark_mode_outlined,
                                () {
                                  themeProvider.toggleTheme(
                                    !themeProvider.isDarkMode,
                                  );
                                },
                              ),
                              const SizedBox(width: 12),
                              _buildHeaderIcon(Icons.person_outline, () {
                                showDialog(
                                  context: context,
                                  builder: (context) => AlertDialog(
                                    // Make dialog dark mode aware if needed, relying on Theme usually works
                                    title: const Text('Logout'),
                                    content: const Text(
                                      'Are you sure you want to logout?',
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () => Navigator.pop(context),
                                        child: const Text('Cancel'),
                                      ),
                                      TextButton(
                                        onPressed: () {
                                          Navigator.pop(context);
                                          authProvider.signOut();
                                        },
                                        child: const Text(
                                          'Logout',
                                          style: TextStyle(color: Colors.red),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),

                      // User Greeting & Name
                      Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Welcome back,',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.8),
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                authProvider.fullName ?? 'Employee',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),

                      // Weekly Streak (Check background color)
                      _buildWeeklyStreak(attendanceProvider.currentWeekStreak),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),

              // Bottom Section: Dynamic Color Card
              SliverToBoxAdapter(
                child: Container(
                  width: double.infinity,
                  constraints: BoxConstraints(
                    minHeight: MediaQuery.of(context).size.height * 0.7,
                  ),
                  decoration: BoxDecoration(
                    color: bodyColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(40),
                      topRight: Radius.circular(40),
                    ),
                  ),
                  child: Padding(
                    // INCREASED BOTTOM PADDING for scrolling (120 instead of 80)
                    padding: const EdgeInsets.only(
                      top: 30,
                      left: 20,
                      right: 20,
                      bottom: 120,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Today's Attendance",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (attendanceProvider.isLoading)
                          Center(
                            child: PremiumLoadingIndicator(
                              size: 50,
                              startColor: _orangeAccent,
                              endColor: Colors.deepPurple,
                            ),
                          )
                        else if (todayData == null)
                          _buildEmptyState(isDark)
                        else
                          _buildTodayCard(context, todayData, isDark),

                        const SizedBox(height: 32),
                        Text(
                          "Recent History",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (attendanceProvider.isLoading)
                          Center(
                            child: PremiumLoadingIndicator(
                              size: 50,
                              startColor: _orangeAccent,
                              endColor: Colors.deepPurple,
                            ),
                          )
                        else if (attendanceProvider.recentHistory.isEmpty)
                          _buildEmptyState(isDark)
                        else
                          ListView.builder(
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: attendanceProvider.recentHistory.length,
                            itemBuilder: (context, index) {
                              final data =
                                  attendanceProvider.recentHistory[index];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 16.0),
                                child: _buildHistoryCard(context, data, isDark),
                              );
                            },
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderIcon(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(50),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.grey.shade900
            : Colors.grey.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          Icon(Icons.event_note_rounded, size: 48, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            "No records found",
            style: TextStyle(color: Colors.grey.shade500, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildTodayCard(
    BuildContext context,
    ProcessedDayData data,
    bool isDark,
  ) {
    final sortedLogs = List<PunchLog>.from(data.punchLogs);
    sortedLogs.sort((a, b) => b.time.compareTo(a.time));
    final totalPunches = sortedLogs.length;

    return Column(
      children: List.generate(sortedLogs.length, (index) {
        final log = sortedLogs[index];
        final punchNumber = totalPunches - index;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: _buildPunchCard(context, data.date, log, punchNumber, isDark),
        );
      }),
    );
  }

  Widget _buildPunchCard(
    BuildContext context,
    String dateStr,
    PunchLog log,
    int punchNumber,
    bool isDark,
  ) {
    // Add TimeAgo logic
    final dateTimeStr = '$dateStr ${log.time}';
    DateTime? logDateTime;
    try {
      logDateTime = DateFormat('yyyy-MM-dd HH:mm').parse(dateTimeStr);
    } catch (e) {
      logDateTime = DateTime.now();
    }

    final isCheckIn = log.direction == 'in';
    final accentColor = isCheckIn ? _orangeAccent : Colors.grey.shade600;

    // Background color for card
    final cardColor = isDark ? const Color(0xFF2C2C2C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Time
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    isCheckIn ? "Check In" : "Check Out",
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade500,
                    ),
                  ),
                  const SizedBox(width: 8),
                  // TIME AGO DISPLAY
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: accentColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      timeago.format(logDateTime, locale: 'en_short'),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: accentColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                log.time,
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 24,
                  color: textColor,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),

          // Status Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              children: [
                Icon(
                  isCheckIn ? Icons.login : Icons.logout,
                  size: 16,
                  color: accentColor,
                ),
                const SizedBox(width: 8),
                Text(
                  '#$punchNumber',
                  style: TextStyle(
                    color: accentColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(
    BuildContext context,
    ProcessedDayData data,
    bool isDark,
  ) {
    final cardColor = isDark ? const Color(0xFF252525) : Colors.grey.shade50;
    final textColor = isDark ? Colors.white : Colors.black87;
    final iconBgColor = isDark ? const Color(0xFF333333) : Colors.white;

    return OpenContainer(
      transitionType: ContainerTransitionType.fadeThrough,
      openBuilder: (context, _) => Scaffold(
        backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        body: SafeArea(child: DayDetailsSheet(data: data)),
      ),
      closedElevation: 0,
      closedShape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      closedColor: cardColor,
      closedBuilder: (context, openContainer) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: iconBgColor,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 5,
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.calendar_today_rounded,
                      color: _orangeAccent,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        DateFormat(
                          'MMM d, yyyy',
                        ).format(DateTime.parse(data.date)),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: textColor,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${data.firstPunch ?? "--:--"} - ${data.lastPunch ?? "--:--"}',
                        style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    data.totalHours,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: textColor,
                    ),
                  ),
                  Text(
                    data.status.toUpperCase(),
                    style: TextStyle(
                      color: data.status == 'present'
                          ? Colors.green
                          : data.status == 'absent'
                          ? Colors.red
                          : Colors.orange,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWeeklyStreak(List<Map<String, dynamic>> streak) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: streak.map((day) {
          final isPresent = day['status'] == 'present';
          final isFuture = day['status'] == 'future';

          return Column(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isPresent
                      ? _orangeAccent // Orange for active streak
                      : Colors.white.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: isPresent
                    ? const Icon(Icons.check, color: Colors.white, size: 20)
                    : null,
              ),
              const SizedBox(height: 8),
              Text(
                day['day'],
                style: TextStyle(
                  color: Colors.white.withValues(alpha: isFuture ? 0.5 : 0.9),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
