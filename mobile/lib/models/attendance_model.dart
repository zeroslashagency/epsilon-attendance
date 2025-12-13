class ProcessedDayData {
  final String date;
  final String status; // 'present', 'late', 'absent', 'weekend', 'holiday'
  final String? checkIn;
  final String? checkOut;
  final String totalHours;
  final String confidence; // 'high', 'medium', 'low'
  final bool hasAmbiguousPunches;
  final List<AttendanceInterval> intervals;
  final List<PunchLog> punchLogs;

  String? get firstPunch => checkIn;
  String? get lastPunch => checkOut;

  ProcessedDayData({
    required this.date,
    required this.status,
    this.checkIn,
    this.checkOut,
    required this.totalHours,
    required this.confidence,
    required this.hasAmbiguousPunches,
    required this.intervals,
    required this.punchLogs,
  });
}

class AttendanceInterval {
  final String checkIn;
  final String checkOut;
  final String duration;
  final String type; // 'work', 'break'

  AttendanceInterval({
    required this.checkIn,
    required this.checkOut,
    required this.duration,
    required this.type,
  });
}

class PunchLog {
  final String time;
  final String direction; // 'in', 'out'
  final String deviceId;
  final String confidence;
  final bool inferred;

  PunchLog({
    required this.time,
    required this.direction,
    required this.deviceId,
    required this.confidence,
    required this.inferred,
  });
}
