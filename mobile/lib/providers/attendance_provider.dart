import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/attendance_model.dart';
import 'package:intl/intl.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Manages attendance data and statistics for the mobile application.
///
/// This provider fetches attendance logs from Supabase, processes them into
/// daily records, and calculates various statistics including:
/// - Attendance rate (percentage of on-time + late days)
/// - Average check-in/check-out times
/// - Work hours and overtime tracking
/// - Monthly activity heatmap data
///
/// Usage:
/// ```dart
/// final provider = Provider.of<AttendanceProvider>(context);
/// await provider.fetchAttendanceData(employeeCode);
/// print(provider.attendanceRate); // 95.5
/// ```
///
/// Also handles local notifications for attendance events.
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

  /// Returns the processed attendance data indexed by date string (yyyy-MM-dd).
  Map<String, ProcessedDayData> get attendanceData => _attendanceData;

  /// Whether attendance data is currently being fetched.
  bool get isLoading => _isLoading;

  /// Error message if the last fetch operation failed.
  String? get error => _error;

  /// Total days with attendance data.
  int get totalDays => _totalDays;

  /// Percentage of days the employee was present (on-time or late).
  double get attendanceRate => _attendanceRate;

  /// Number of days the employee checked in on time.
  int get onTimeCount => _onTimeCount;

  /// Number of days the employee was late.
  int get lateCount => _lateCount;

  /// Average check-in time formatted as HH:mm.
  String get avgCheckIn => _avgCheckIn;

  /// Average check-out time formatted as HH:mm.
  String get avgCheckOut => _avgCheckOut;

  /// Average work hours per day formatted as 'Xh Ym'.
  String get avgWorkHours => _avgWorkHours;

  /// Total overtime hours formatted as 'Xh Ym'.
  String get overtimeHours => _overtimeHours;

  /// Monthly activity data for heatmap visualization (0: absent, 1: present).
  List<int> get monthlyActivity => _monthlyActivity;

  /// Returns today's attendance data, or null if not available.
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
    // Defer notification initialization to after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initNotifications();
    });
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
      final now = DateTime.now();
      // Fetch last 4 months to cover recent history and current month
      final startDate = now.subtract(const Duration(days: 120));
      final endDate = now.add(const Duration(days: 1));

      final params = {
        'p_employee_code': employeeCode,
        'p_start_date': DateFormat('yyyy-MM-dd').format(startDate),
        'p_end_date': DateFormat('yyyy-MM-dd').format(endDate),
      };

      final response = await Supabase.instance.client.rpc(
        'process_attendance_logs',
        params: params,
      );

      final Map<String, dynamic> jsonResponse =
          response as Map<String, dynamic>;

      _attendanceData = {};
      jsonResponse.forEach((date, data) {
        _attendanceData[date] = ProcessedDayData.fromJson(
          data as Map<String, dynamic>,
        );
      });

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
}
