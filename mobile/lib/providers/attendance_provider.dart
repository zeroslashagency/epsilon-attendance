import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/attendance_model.dart';
import 'package:intl/intl.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class AttendanceProvider with ChangeNotifier {
  Map<String, ProcessedDayData> _attendanceData = {};
  bool _isLoading = false;
  String? _error;

  // Stats
  int _totalDays = 0;
  double _attendanceRate = 0.0;
  int _onTimeCount = 0;
  int _lateCount = 0;
  String _avgCheckIn = '--:--';
  String _avgCheckOut = '--:--';
  String _avgWorkHours = '0h 0m';
  String _overtimeHours = '0h 0m';
  List<int> _monthlyActivity = []; // 0: absent, 1: present/late

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  Map<String, ProcessedDayData> get attendanceData => _attendanceData;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get totalDays => _totalDays;
  double get attendanceRate => _attendanceRate;
  int get onTimeCount => _onTimeCount;
  int get lateCount => _lateCount;
  String get avgCheckIn => _avgCheckIn;
  String get avgCheckOut => _avgCheckOut;
  String get avgWorkHours => _avgWorkHours;
  String get overtimeHours => _overtimeHours;
  List<int> get monthlyActivity => _monthlyActivity;

  // Getters for UI
  ProcessedDayData? get todayData {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    return _attendanceData[today];
  }

  List<ProcessedDayData> get recentHistory {
    final now = DateTime.now();
    final todayStr = DateFormat('yyyy-MM-dd').format(now);

    // Calculate start of previous month
    // Logic: Month - 1. If Month is 1, go to Dec of previous year.
    final currentMonth = DateTime(now.year, now.month);
    final prevMonth = DateTime(
      currentMonth.month == 1 ? currentMonth.year - 1 : currentMonth.year,
      currentMonth.month == 1 ? 12 : currentMonth.month - 1,
    );
    // Start date is the 1st of the previous month
    final startDate = prevMonth;

    final allHistory =
        _attendanceData.entries
            .where((entry) {
              final date = DateTime.parse(entry.key);
              // Include if it's not today AND it's after or on startDate
              return entry.key != todayStr &&
                  (date.isAfter(startDate) || date.isAtSameMomentAs(startDate));
            })
            .map((entry) => entry.value)
            .toList()
          ..sort((a, b) => b.date.compareTo(a.date)); // Sort by date descending

    return allHistory;
  }

  List<Map<String, dynamic>> get currentWeekStreak {
    final now = DateTime.now();
    // Find Monday of this week (weekday: Mon=1, Sun=7)
    final monday = now.subtract(Duration(days: now.weekday - 1));

    List<Map<String, dynamic>> streak = [];

    for (int i = 0; i < 7; i++) {
      final date = monday.add(Duration(days: i));
      final dateStr = DateFormat('yyyy-MM-dd').format(date);
      final dayLabel = DateFormat('E').format(date).substring(0, 3); // Mon, Tue

      String status = 'future';
      // Check if date is in the future (ignoring time)
      final today = DateTime(now.year, now.month, now.day);
      final checkDate = DateTime(date.year, date.month, date.day);

      if (checkDate.isAfter(today)) {
        status = 'future';
      } else {
        final data = _attendanceData[dateStr];
        if (data != null &&
            (data.status == 'present' || data.status == 'late')) {
          status = 'present';
        } else {
          status = 'absent';
        }
      }

      streak.add({'day': dayLabel, 'status': status, 'date': dateStr});
    }
    return streak;
  }

  AttendanceProvider() {
    _initNotifications();
  }

  Future<void> _initNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/launcher_icon');
    const DarwinInitializationSettings initializationSettingsDarwin =
        DarwinInitializationSettings();
    const InitializationSettings initializationSettings =
        InitializationSettings(
          android: initializationSettingsAndroid,
          iOS: initializationSettingsDarwin,
        );
    await _notificationsPlugin.initialize(initializationSettings);
  }

  Future<void> fetchAttendanceData(String employeeCode) async {
    if (employeeCode.isEmpty) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await Supabase.instance.client
          .from('employee_raw_logs')
          .select()
          .eq('employee_code', employeeCode)
          .order('log_date', ascending: false)
          .limit(1000);

      final List<dynamic> rawLogs = data;
      _attendanceData = _processRealPunchLogs(rawLogs);
      _calculateStats();

      _setupRealtimeSubscription(employeeCode);
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching attendance: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _calculateStats() {
    if (_attendanceData.isEmpty) return;

    final now = DateTime.now();

    int present = 0;
    int late = 0;
    int total = 0;
    int onTime = 0;
    int totalCheckInMinutes = 0;
    int totalCheckOutMinutes = 0;

    // Sort dates
    final sortedDates = _attendanceData.keys.toList()
      ..sort((a, b) => a.compareTo(b)); // Oldest first

    // Filter for current month/relevant period if needed, but for now let's take all loaded data (last 1000 logs -> approx 3-6 months)
    // Actually, let's just calculate based on available data for the "Achievements" section

    for (var dateStr in sortedDates) {
      final data = _attendanceData[dateStr]!;
      final date = DateTime.parse(dateStr);

      // Only count past days or today
      if (date.isAfter(now)) continue;

      total++;

      if (data.status == 'present') {
        present++;
        onTime++;
      } else if (data.status == 'late') {
        late++;
      }

      if (data.checkIn != null) {
        final parts = data.checkIn!.split(':');
        totalCheckInMinutes += int.parse(parts[0]) * 60 + int.parse(parts[1]);
      }
      if (data.checkOut != null) {
        final parts = data.checkOut!.split(':');
        totalCheckOutMinutes += int.parse(parts[0]) * 60 + int.parse(parts[1]);
      }
    }

    _totalDays = total;
    _onTimeCount = onTime;
    _lateCount = late;
    _attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0.0;

    // Calculate Averages
    if (totalCheckInMinutes > 0 && total > 0) {
      final avgIn = totalCheckInMinutes ~/ total;
      final h = avgIn ~/ 60;
      final m = avgIn % 60;
      _avgCheckIn =
          '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}';
    }

    if (totalCheckOutMinutes > 0 && total > 0) {
      final avgOut = totalCheckOutMinutes ~/ total;
      final h = avgOut ~/ 60;
      final m = avgOut % 60;
      _avgCheckOut =
          '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}';
    }

    // Calculate Work Efficiency (Avg Work Hours & Overtime)
    int totalWorkMinutes = 0;
    int totalOvertimeMinutes = 0;
    int workedDays = 0;

    for (var dateStr in sortedDates) {
      final data = _attendanceData[dateStr]!;
      final date = DateTime.parse(dateStr);
      if (date.isAfter(now)) continue;

      if (data.totalHours != '0:00') {
        final parts = data.totalHours.split(':');
        final hours = int.parse(parts[0]);
        final minutes = int.parse(parts[1]);
        final durationMinutes = hours * 60 + minutes;

        totalWorkMinutes += durationMinutes;
        workedDays++;

        // Assuming 8 hours (480 mins) is standard work day
        if (durationMinutes > 480) {
          totalOvertimeMinutes += (durationMinutes - 480);
        }
      }
    }

    if (workedDays > 0) {
      final avgWorkMins = totalWorkMinutes ~/ workedDays;
      final h = avgWorkMins ~/ 60;
      final m = avgWorkMins % 60;
      _avgWorkHours = '${h}h ${m}m';

      // Total overtime or Avg overtime? Let's show Total Overtime for the period
      final oh = totalOvertimeMinutes ~/ 60;
      final om = totalOvertimeMinutes % 60;
      _overtimeHours = '${oh}h ${om}m';
    } else {
      _avgWorkHours = '0h 0m';
      _overtimeHours = '0h 0m';
    }

    // Monthly Activity for Chart (Last 30 days)
    _monthlyActivity = [];
    for (int i = 29; i >= 0; i--) {
      final d = now.subtract(Duration(days: i));
      final dStr = DateFormat('yyyy-MM-dd').format(d);
      final data = _attendanceData[dStr];

      if (data == null || data.status == 'absent') {
        _monthlyActivity.add(0); // Absent/No Data
      } else if (data.status == 'present') {
        _monthlyActivity.add(2); // Present
      } else if (data.status == 'late') {
        _monthlyActivity.add(1); // Late
      } else {
        _monthlyActivity.add(0);
      }
    }
  }

  void _setupRealtimeSubscription(String employeeCode) {
    Supabase.instance.client
        .channel('public:employee_raw_logs')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'employee_raw_logs',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'employee_code',
            value: employeeCode,
          ),
          callback: (payload) {
            _showNotification(
              'New Punch Recorded',
              'Your attendance has been updated.',
            );
            fetchAttendanceData(employeeCode); // Refresh data
          },
        )
        .subscribe();
  }

  Future<void> _showNotification(String title, String body) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
          'attendance_channel',
          'Attendance Updates',
          importance: Importance.max,
          priority: Priority.high,
        );
    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
    );
    await _notificationsPlugin.show(0, title, body, platformChannelSpecifics);
  }

  Map<String, ProcessedDayData> _processRealPunchLogs(List<dynamic> punchLogs) {
    final Map<String, ProcessedDayData> data = {};
    final Map<String, List<PunchLog>> logsByDate = {};

    // Group logs by date
    for (var log in punchLogs) {
      final dateTime = DateTime.parse(log['log_date']);
      final dateStr = DateFormat('yyyy-MM-dd').format(dateTime);

      if (!logsByDate.containsKey(dateStr)) {
        logsByDate[dateStr] = [];
      }

      logsByDate[dateStr]!.add(
        PunchLog(
          time: DateFormat('HH:mm').format(dateTime),
          direction: (log['punch_direction'] as String).toLowerCase(),
          deviceId: 'device-1',
          confidence: 'high',
          inferred: false,
        ),
      );
    }

    // Process each date
    logsByDate.forEach((date, logs) {
      // Sort logs by time
      logs.sort((a, b) => a.time.compareTo(b.time));

      final inLogs = logs.where((l) => l.direction == 'in').toList();
      final outLogs = logs.where((l) => l.direction == 'out').toList();

      String? checkIn = inLogs.isNotEmpty ? inLogs.first.time : null;
      String? checkOut = outLogs.isNotEmpty ? outLogs.last.time : null;

      // Calculate status
      String status = 'present';
      if (checkIn == null) {
        status = 'absent';
      } else if (checkIn.compareTo('09:00') > 0) {
        status = 'late';
      }

      // Calculate total hours using First and Last punch
      String totalHours = '0:00';
      List<AttendanceInterval> intervals = [];

      if (logs.isNotEmpty) {
        // Always take the first punch as Check In
        final firstPunch = logs.first;
        checkIn = firstPunch.time;

        // If there are multiple punches, take the last one as Check Out
        if (logs.length > 1) {
          final lastPunch = logs.last;
          checkOut = lastPunch.time;

          final inTime = DateFormat('HH:mm').parse(checkIn);
          final outTime = DateFormat('HH:mm').parse(checkOut);

          final diff = outTime.difference(inTime);
          final hours = diff.inHours;
          final minutes = diff.inMinutes.remainder(60);

          totalHours = '$hours:${minutes.toString().padLeft(2, '0')}';

          intervals.add(
            AttendanceInterval(
              checkIn: checkIn,
              checkOut: checkOut,
              duration: totalHours,
              type: 'work',
            ),
          );
        }
      }

      data[date] = ProcessedDayData(
        date: date,
        status: status,
        checkIn: checkIn,
        checkOut: checkOut,
        totalHours: totalHours,
        confidence: 'high',
        hasAmbiguousPunches: false,
        intervals: intervals,
        punchLogs: logs,
      );
    });

    return data;
  }
}
