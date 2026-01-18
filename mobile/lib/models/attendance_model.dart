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

  factory ProcessedDayData.fromJson(Map<String, dynamic> json) {
    return ProcessedDayData(
      date: json['date'] as String,
      status: json['status'] as String,
      checkIn: json['checkIn'] as String?,
      checkOut: json['checkOut'] as String?,
      totalHours: json['totalHours'] as String? ?? '0:00',
      confidence: json['confidence'] as String? ?? 'high',
      hasAmbiguousPunches: json['hasAmbiguousPunches'] as bool? ?? false,
      intervals:
          (json['intervals'] as List<dynamic>?)
              ?.map(
                (e) => AttendanceInterval.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
      punchLogs:
          (json['punchLogs'] as List<dynamic>?)
              ?.map((e) => PunchLog.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
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

  factory AttendanceInterval.fromJson(Map<String, dynamic> json) {
    return AttendanceInterval(
      checkIn: json['checkIn'] as String,
      checkOut: json['checkOut'] as String,
      duration: json['duration'] as String,
      type: json['type'] as String,
    );
  }
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

  factory PunchLog.fromJson(Map<String, dynamic> json) {
    return PunchLog(
      time: json['time'] as String,
      direction: json['direction'] as String,
      deviceId: json['deviceId'] as String? ?? 'unknown',
      confidence: json['confidence'] as String? ?? 'high',
      inferred: json['inferred'] as bool? ?? false,
    );
  }
}
