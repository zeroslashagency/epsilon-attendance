enum FirStatus { reported, personResponse, superAdminReview, closed }

enum FirType { positive, negative }

enum FirPriority { low, medium, high, critical }

class FirReport {
  final String id;
  final String title;
  final String description;
  final String reporterName;
  final FirStatus status;
  final FirType type;
  final FirPriority priority;
  final DateTime reportedAt;
  final List<String> attachments;

  FirReport({
    required this.id,
    required this.title,
    required this.description,
    required this.reporterName,
    required this.status,
    required this.type,
    required this.priority,
    required this.reportedAt,
    required this.attachments,
    this.assignedToId,
    this.responseComment,
    this.responseAttachments,
    this.finalDecision,
    this.closedBy,
    this.closedAt,
    this.stage2Status,
  });

  final String? assignedToId;
  final String? responseComment;
  final List<String>? responseAttachments;
  final String? finalDecision; // 'CONFIRMED' or 'SENT_BACK'
  final String? closedBy;
  final DateTime? closedAt;
  final String? stage2Status; // 'ACCEPTED' or 'REFUSED'

  bool get hasAttachments => attachments.isNotEmpty;

  // Helper for UI badges
  String get statusLabel {
    switch (status) {
      case FirStatus.reported:
        return "Pending";
      case FirStatus.personResponse:
        return "Awaiting Response";
      case FirStatus.superAdminReview:
        return "In Review";
      case FirStatus.closed:
        return "Resolved";
    }
  }
}
