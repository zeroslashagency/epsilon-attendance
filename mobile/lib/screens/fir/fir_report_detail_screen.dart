import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fir_provider.dart';
import '../../models/fir_model.dart';
import '../../widgets/fir/voice_message_bubble.dart';

class FirReportDetailScreen extends StatefulWidget {
  final FirReport report;
  const FirReportDetailScreen({super.key, required this.report});

  @override
  State<FirReportDetailScreen> createState() => _FirReportDetailScreenState();
}

class _FirReportDetailScreenState extends State<FirReportDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<FirProvider>(context, listen: false);
      if (provider.employees.isEmpty) {
        provider.fetchEmployees();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final provider = Provider.of<FirProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final cardColor = isDark ? const Color(0xFF1E293B) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1E293B);
    final subTextColor = isDark ? Colors.grey[400] : Colors.grey[500];

    final currentUser = auth.user;
    final currentUserId = currentUser?.id;
    final isSuperAdmin = auth.role == 'Super Admin';
    final isAssignee =
        widget.report.assignedToId == auth.employeeCode ||
        widget.report.assignedToId == currentUserId ||
        (auth.employeeId != null &&
            widget.report.assignedToId == auth.employeeId.toString());

    final canRespond =
        (widget.report.status == FirStatus.reported ||
            widget.report.status == FirStatus.personResponse) &&
        isAssignee;
    final canAdminReview =
        widget.report.status == FirStatus.superAdminReview && isSuperAdmin;
    final showActions = canRespond || canAdminReview;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(
          "Report Details",
          style: GoogleFonts.inter(fontWeight: FontWeight.w600),
        ),
        backgroundColor: cardColor,
        elevation: 0,
        centerTitle: true,
        leading: const BackButton(),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Header Card (Status, Priority, Meta)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: cardColor,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildStatusBadge(
                              widget.report.statusLabel,
                              isDark,
                            ),
                            _buildPriorityBadge(widget.report.priority),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.report.title,
                          style: GoogleFonts.inter(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              Icons.person_outline,
                              size: 16,
                              color: subTextColor,
                            ),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                "Reported by ${widget.report.reporterName}",
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.inter(
                                  color: subTextColor,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Icon(
                              Icons.access_time,
                              size: 16,
                              color: subTextColor,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              timeago.format(widget.report.reportedAt),
                              style: GoogleFonts.inter(
                                color: subTextColor,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ).animate().slideY(begin: 0.1, duration: 400.ms),

                  const SizedBox(height: 24),

                  // 1.5 Workflow Summary
                  _buildWorkflowSummary(context, isDark),

                  const SizedBox(height: 24),

                  // 2. Chat / Activity Feed
                  Text(
                    "ACTIVITY & DISCUSSION",
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: subTextColor,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Initial Report Bubble
                  _buildChatBubble(
                    context,
                    title: "Report Description",
                    content: widget.report.description,
                    senderName: widget.report.reporterName,
                    timestamp: widget.report.reportedAt,
                    isMe: false,
                    attachments: widget.report.attachments,
                    isDark: isDark,
                  ),

                  // Response Bubble
                  if (widget.report.responseComment != null) ...[
                    const SizedBox(height: 16),
                    _buildChatBubble(
                      context,
                      title: "Response",
                      content: widget.report.responseComment!,
                      senderName: _getAssignedToName(
                        context,
                      ), // Estimated sender
                      timestamp: widget.report.reportedAt.add(
                        const Duration(hours: 1),
                      ), // Mock/Estimated if not tracked
                      isMe: true,
                      attachments: widget.report.responseAttachments,
                      isDark: isDark,
                      isResponse: true,
                    ),
                  ],

                  // Closure Bubble
                  if (widget.report.finalDecision != null) ...[
                    const SizedBox(height: 16),
                    _buildChatBubble(
                      context,
                      title: "Admin Decision: ${widget.report.finalDecision}",
                      content:
                          "The report has been ${widget.report.finalDecision == 'CONFIRMED' ? 'confirmed and closed' : 'sent back'} by the administrator.",
                      senderName: widget.report.closedBy ?? "Admin",
                      timestamp: widget.report.closedAt ?? DateTime.now(),
                      isMe: false,
                      isAdmin: true,
                      isDark: isDark,
                    ),
                  ],

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
          // ... Sticky Action Bar (kept same)
          if (showActions)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardColor,
                border: Border(
                  top: BorderSide(
                    color: isDark ? Colors.white10 : Colors.grey[200]!,
                  ),
                ),
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    if (canRespond) ...[
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _showRejectDialog(context, provider),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red,
                            side: const BorderSide(color: Colors.red),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text("Reject"),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () =>
                              _handleResponse(context, provider, true, ""),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text("Accept"),
                        ),
                      ),
                    ],

                    if (canAdminReview) ...[
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () =>
                              _showAdminSendBackDialog(context, provider),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.orange,
                            side: const BorderSide(color: Colors.orange),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text("Send Back"),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _handleAdminReview(
                            context,
                            provider,
                            'CONFIRM',
                            "",
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text("Confirm & Close"),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildChatBubble(
    BuildContext context, {
    required String title,
    required String content,
    required String senderName,
    required DateTime timestamp,
    required bool isMe,
    List<String>? attachments,
    bool isAdmin = false,
    bool isResponse = false,
    required bool isDark,
  }) {
    final bgColor = isMe
        ? (isDark ? Colors.blue[900]!.withValues(alpha: 0.3) : Colors.blue[50])
        : (isAdmin
              ? (isDark
                    ? Colors.green[900]!.withValues(alpha: 0.2)
                    : Colors.green[50])
              : (isDark ? const Color(0xFF1E293B) : Colors.white));

    final borderColor = isMe
        ? Colors.blue.withValues(alpha: 0.3)
        : (isAdmin
              ? Colors.green.withValues(alpha: 0.3)
              : (isDark ? Colors.white10 : Colors.grey[200]!));

    final align = isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start;

    return Column(
      crossAxisAlignment: align,
      children: [
        // Sender Name & Time
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                senderName,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                timeago.format(timestamp),
                style: GoogleFonts.inter(fontSize: 10, color: Colors.grey),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.all(16),
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.85,
          ),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(16),
              topRight: const Radius.circular(16),
              bottomLeft: isMe
                  ? const Radius.circular(16)
                  : const Radius.circular(4),
              bottomRight: isMe
                  ? const Radius.circular(4)
                  : const Radius.circular(16),
            ),
            border: Border.all(color: borderColor),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (title.isNotEmpty) ...[
                Text(
                  title.toUpperCase(),
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isMe
                        ? Colors.blue
                        : (isAdmin ? Colors.green : Colors.grey),
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 8),
              ],
              Text(
                content,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  height: 1.5,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),

              if (attachments != null && attachments.isNotEmpty) ...[
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: attachments.map((path) {
                    final isAudio =
                        path.endsWith('.m4a') ||
                        path.endsWith('.mp3') ||
                        path.endsWith('.aac');
                    if (isAudio) {
                      return VoiceMessageBubble(audioUrl: path, isMe: isMe);
                    }
                    // Initial Image Preview (Thumbnail)
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 100,
                        height: 100,
                        color: Colors.grey[300],
                        child: Image.network(
                          path,
                          fit: BoxFit.cover,
                          errorBuilder: (c, e, s) =>
                              const Icon(Icons.broken_image),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  // --- Action Handlers ---

  void _showRejectDialog(BuildContext context, FirProvider provider) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Reject Report"),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: "Enter reason for rejection...",
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _handleResponse(context, provider, false, controller.text);
            },
            child: const Text(
              "Submit Rejection",
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  void _showAdminSendBackDialog(BuildContext context, FirProvider provider) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Send Back Report"),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: "Enter notes for sending back...",
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _handleAdminReview(
                context,
                provider,
                'SEND_BACK',
                controller.text,
              );
            },
            child: const Text(
              "Send Back",
              style: TextStyle(color: Colors.orange),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleResponse(
    BuildContext context,
    FirProvider provider,
    bool accepted,
    String comment,
  ) async {
    final success = await provider.submitResponse(
      reportId: widget.report.id,
      accepted: accepted,
      comment: accepted
          ? "Accepted without comment"
          : comment, // Auto-comment logic if empty
    );
    if (success && context.mounted) {
      Navigator.pop(
        context,
      ); // Close detail screen or refresh? Ideally stay and show update.
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Response submitted successfully")),
      );
    }
  }

  Future<void> _handleAdminReview(
    BuildContext context,
    FirProvider provider,
    String decision,
    String comment,
  ) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await provider.adminReview(
      reportId: widget.report.id,
      decision: decision,
      comment: decision == 'CONFIRM' ? "Confirmed via Mobile" : comment,
      adminName: auth.employeeName ?? "Admin",
    );
    if (success && context.mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Review submitted successfully")),
      );
    }
  }

  Widget _buildStatusBadge(String status, bool isDark) {
    Color color = Colors.blue;
    if (status == 'Resolved' || status == 'Closed') color = Colors.green;
    if (status == 'Pending') color = Colors.orange;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        status.toUpperCase(),
        style: GoogleFonts.inter(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(FirPriority priority) {
    Color color;
    switch (priority) {
      case FirPriority.critical:
        color = Colors.red;
        break;
      case FirPriority.high:
        color = Colors.deepOrange;
        break;
      case FirPriority.medium:
        color = Colors.orange;
        break;
      default:
        color = Colors.green;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.flag, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            priority.name.toUpperCase(),
            style: GoogleFonts.inter(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  // --- New UI Components ---

  String _getAssignedToName(BuildContext context) {
    if (widget.report.assignedToId == null) return "Unassigned";
    final provider = Provider.of<FirProvider>(context, listen: false);

    // Check if ID matches checking the ID field first (numeric as string)
    final employee = provider.employees.firstWhere(
      (e) => e['id'].toString() == widget.report.assignedToId,
      orElse: () => {'employee_name': 'Unknown'}, // Fallback
    );

    // Also try matching by employee_code if needed (legacy check)
    if (employee['employee_name'] == 'Unknown') {
      final empByCode = provider.employees.firstWhere(
        (e) => e['employee_code'] == widget.report.assignedToId,
        orElse: () => {
          'employee_name': widget.report.assignedToId ?? "Unknown",
        },
      );
      return empByCode['employee_name'];
    }

    return employee['employee_name'] ?? "Unknown";
  }

  Widget _buildWorkflowSummary(BuildContext context, bool isDark) {
    final cardColor = isDark ? const Color(0xFF1E293B) : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey[200]!;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Row 1: Submitted & Assigned
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: _buildWorkflowItem(
                    "Submitted By",
                    widget.report.reporterName,
                    Icons.person_outline,
                    isDark,
                  ),
                ),
                Container(
                  width: 1,
                  height: 40,
                  color: borderColor,
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                ),
                Expanded(
                  child: _buildWorkflowItem(
                    "Assigned To",
                    _getAssignedToName(context),
                    Icons.admin_panel_settings_outlined,
                    isDark,
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: borderColor),
          // Row 2: Reviewed & Closed
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: _buildWorkflowItem(
                    "Reviewed By",
                    widget.report.closedBy ?? "-",
                    Icons.fact_check_outlined,
                    isDark,
                  ),
                ),
                Container(
                  width: 1,
                  height: 40,
                  color: borderColor,
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                ),
                Expanded(
                  child: _buildWorkflowItem(
                    "Closed By",
                    widget.report.closedBy ?? "-",
                    Icons.lock_outline,
                    isDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkflowItem(
    String label,
    String value,
    IconData icon,
    bool isDark,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : Colors.grey[100],
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            size: 16,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: isDark ? Colors.grey[500] : Colors.grey[500],
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: isDark ? Colors.white : Colors.black87,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
