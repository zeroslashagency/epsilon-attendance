import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/fir_model.dart';

class FirProvider with ChangeNotifier {
  List<FirReport> _reports = [];
  bool _isLoading = false;

  List<FirReport> get reports => _reports;
  bool get isLoading => _isLoading;

  // Stats
  int get totalReports => _reports.length;
  int get pendingCount => _reports
      .where(
        (r) =>
            r.status == FirStatus.reported ||
            r.status == FirStatus.personResponse ||
            r.status == FirStatus.superAdminReview,
      )
      .length;
  int get resolvedCount =>
      _reports.where((r) => r.status == FirStatus.closed).length;
  int get criticalCount =>
      _reports.where((r) => r.priority == FirPriority.critical).length;
  int get positiveCount =>
      _reports.where((r) => r.type == FirType.positive).length;
  int get negativeCount =>
      _reports.where((r) => r.type == FirType.negative).length;

  // Filters
  List<FirReport> get recentReports {
    final sorted = List<FirReport>.from(_reports);
    sorted.sort((a, b) => b.reportedAt.compareTo(a.reportedAt));
    return sorted.take(5).toList();
  }

  FirProvider() {
    // Defer heavy network fetch to after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      debugPrint('[FirProvider] Starting deferred initialization...');
      fetchReports();
    });
  }

  // Employees
  List<Map<String, dynamic>> _employees = [];
  List<Map<String, dynamic>> get employees => _employees;

  // Categories delay loaded
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> get categories => _categories;

  Future<void> fetchEmployees() async {
    try {
      final response = await Supabase.instance.client
          .from('employee_master')
          .select('id, employee_name, employee_code')
          .order('employee_name');
      _employees = List<Map<String, dynamic>>.from(response);
      notifyListeners();
    } catch (e) {
      debugPrint("Error fetching employees: $e");
    }
  }

  Future<void> fetchCategories() async {
    if (_categories.isNotEmpty) return;
    try {
      final response = await Supabase.instance.client
          .from('report_categories')
          .select('id, name, type');
      _categories = List<Map<String, dynamic>>.from(response);
      notifyListeners();
    } catch (e) {
      debugPrint("Error fetching categories: $e");
    }
  }

  Future<bool> submitReport({
    required int employeeId,
    required String type, // 'GOOD' or 'BAD'
    required String title,
    required String description,
    required String category,
    required String priority,
    required String reporterName,
    required String reporterId,
    List<String>? attachmentPaths,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      await Supabase.instance.client.from('fir_activity').insert({
        'employee_id': employeeId,
        'fir_type': type,
        'title': title,
        'category': category,
        'priority': priority,
        'description': description,
        'status': 'NEW',
        'created_by': reporterName,
        'submitted_person_id': reporterId,
        'attachments': attachmentPaths ?? [],
      });
      await fetchReports(); // Refresh list
      return true;
    } catch (e) {
      debugPrint("Error submitting report: $e");
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchReports() async {
    _isLoading = true;
    notifyListeners();

    try {
      final supabase = Supabase.instance.client;
      // Fetch reports (mocking the join for simplicity or assuming view if complex)
      // For now, simple fetch from fir_activity
      final response = await supabase
          .from('fir_activity')
          .select('*')
          .order('created_at', ascending: false);

      _reports = (response as List).map((data) {
        return FirReport(
          id: data['id'].toString(),
          title: data['title'] ?? 'No Title',
          description: data['description'] ?? '',
          reporterName: data['created_by'] ?? 'Unknown',
          status: _parseStatus(data['status']),
          type: (data['fir_type'] == 'GOOD')
              ? FirType.positive
              : FirType.negative,
          priority: _parsePriority(data['priority']),
          reportedAt: DateTime.tryParse(data['created_at']) ?? DateTime.now(),
          attachments: List<String>.from(data['attachments'] ?? []),
          assignedToId: data['employee_id']
              ?.toString(), // Use employee_id as assignedTo
          responseComment: data['response_comment'],
          responseAttachments: List<String>.from(
            data['stage_2_attachments'] ?? [],
          ),
          finalDecision: data['final_decision'],
          closedBy: data['stage_3_by'],
          closedAt: data['closed_at'] != null
              ? DateTime.tryParse(data['closed_at'])
              : null,
          stage2Status: data['stage_2_status'],
        );
      }).toList();
    } catch (e) {
      debugPrint("Error fetching FIR reports: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Helper methods for workflow actions
  Future<bool> submitResponse({
    required String reportId,
    required bool accepted,
    required String comment,
    List<String>? attachments,
  }) async {
    try {
      await Supabase.instance.client
          .from('fir_activity')
          .update({
            'status': 'SUPER_ADMIN_REVIEW',
            'stage_2_status': accepted ? 'ACCEPTED' : 'REFUSED',
            'response_comment': comment,
            'stage_2_notes': comment,
            'stage_2_attachments': attachments ?? [],
          })
          .eq('id', reportId);
      await fetchReports();
      return true;
    } catch (e) {
      debugPrint("Error submitting response: $e");
      return false;
    }
  }

  Future<bool> adminReview({
    required String reportId,
    required String decision, // 'CONFIRM' or 'SEND_BACK'
    required String comment,
    required String adminName,
  }) async {
    try {
      final Map<String, dynamic> updates = {};

      if (decision == 'CONFIRM') {
        updates.addAll({
          'status': 'CLOSED',
          'final_decision': 'CONFIRMED',
          'closed_at': DateTime.now().toIso8601String(),
          'stage_3_by': adminName,
          'stage_3_notes': comment,
        });
      } else {
        updates.addAll({
          'status': 'PERSON_RESPONSE', // Send back to previous stage
          'final_decision': 'SENT_BACK',
          'stage_3_by': adminName,
          'stage_3_notes': comment,
        });
      }

      await Supabase.instance.client
          .from('fir_activity')
          .update(updates)
          .eq('id', reportId);
      await fetchReports();
      return true;
    } catch (e) {
      debugPrint("Error submitting admin review: $e");
      return false;
    }
  }

  FirStatus _parseStatus(String? status) {
    if (status == null) return FirStatus.reported;
    switch (status.toUpperCase()) {
      case 'CLOSED':
        return FirStatus.closed;
      case 'PERSON_RESPONSE':
        return FirStatus.personResponse;
      case 'SUPER_ADMIN_REVIEW':
        return FirStatus.superAdminReview;
      default:
        return FirStatus.reported; // Default to reported/new
    }
  }

  FirPriority _parsePriority(String? priority) {
    if (priority == null) return FirPriority.low;
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        return FirPriority.critical;
      case 'HIGH':
        return FirPriority.high;
      case 'MEDIUM':
        return FirPriority.medium;
      default:
        return FirPriority.low;
    }
  }
}
