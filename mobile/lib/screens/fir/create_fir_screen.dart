import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../../providers/fir_provider.dart';
import '../../providers/auth_provider.dart';

class CreateFirScreen extends StatefulWidget {
  const CreateFirScreen({super.key});

  @override
  State<CreateFirScreen> createState() => _CreateFirScreenState();
}

class _CreateFirScreenState extends State<CreateFirScreen> {
  int _step = 0; // 0: Select Employee, 1: Fill Form
  bool _isLoading = false;

  // Step 1: Employee Selection
  String _employeeSearchQuery = '';
  Map<String, dynamic>? _selectedEmployee;

  // Step 2: Form Data
  bool _isPositive = true;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  String? _selectedCategory;
  // Priority removed as per user request, defaulting to LOW

  // Evidence
  bool _isRecording = false;
  File? _selectedImage;
  String? _audioPath;
  late final AudioRecorder _audioRecorder;

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<FirProvider>(context, listen: false);
      provider.fetchEmployees();
      provider.fetchCategories();
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    // Request permissions
    PermissionStatus status;
    if (source == ImageSource.camera) {
      status = await Permission.camera.request();
    } else {
      // Android 13+ uses specific media permissions
      if (Platform.isAndroid && (await _isAndroid13OrHigher())) {
        status = await Permission.photos.request();
        // If photos isn't enough, might need Permission.mediaLibrary or just proceed if image_picker handles it
      } else {
        status = await Permission.storage.request();
      }
    }

    if (status.isPermanentlyDenied) {
      _showPermissionSettingsDialog();
      return;
    }

    // Attempt pick even if denied, some OS handle it gracefully or image_picker requests it
    try {
      final XFile? image = await ImagePicker().pickImage(source: source);
      if (image != null) {
        setState(() => _selectedImage = File(image.path));
      }
    } catch (e) {
      debugPrint("Error picking image: $e");
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Failed to pick image: $e")));
    }
  }

  Future<bool> _isAndroid13OrHigher() async {
    if (!Platform.isAndroid) return false;
    // Simple check, or just assume mostly new devices.
    // Ideally check device info, but for now we rely on permission handler logic
    return true;
  }

  Future<void> _toggleRecording() async {
    try {
      if (_isRecording) {
        // Stop
        final path = await _audioRecorder.stop();
        setState(() {
          _isRecording = false;
          _audioPath = path;
        });
      } else {
        // Start
        if (await _audioRecorder.hasPermission()) {
          final tempDir = await getTemporaryDirectory();
          final path =
              '${tempDir.path}/fir_audio_${DateTime.now().millisecondsSinceEpoch}.m4a';

          await _audioRecorder.start(const RecordConfig(), path: path);
          setState(() {
            _isRecording = true;
            _audioPath = null;
          });
        } else {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Microphone permission required")),
          );
        }
      }
    } catch (e) {
      debugPrint("Recording error: $e");
      setState(() => _isRecording = false);
    }
  }

  void _showPermissionSettingsDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Permission Required"),
        content: const Text(
          "Please enable permissions in settings to use this feature.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              openAppSettings();
            },
            child: const Text("Settings"),
          ),
        ],
      ),
    );
  }

  void _submitReport() async {
    if (_titleController.text.isEmpty || _descController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Title and Description are required")),
      );
      return;
    }

    setState(() => _isLoading = true);

    final firProvider = Provider.of<FirProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final reporterName = authProvider.employeeName ?? 'Mobile User';
    final reporterId = authProvider.user?.id ?? 'unknown';

    List<String> attachments = [];
    if (_selectedImage != null) attachments.add(_selectedImage!.path);
    if (_audioPath != null) attachments.add(_audioPath!);

    final success = await firProvider.submitReport(
      employeeId: _selectedEmployee!['id'],
      type: _isPositive ? 'GOOD' : 'BAD',
      title: _titleController.text,
      description: _descController.text,
      category:
          _selectedCategory ??
          (_isPositive ? 'General Positive' : 'General Incident'),
      priority: 'LOW',
      reporterName: reporterName,
      reporterId: reporterId,
      attachmentPaths: attachments,
    );

    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Report submitted successfully!"),
          backgroundColor: Colors.green.shade600,
        ),
      );
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Failed to submit report"),
          backgroundColor: Colors.red.shade600,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? const Color(0xFF0F172A)
          : const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
        elevation: 0,
        leading: BackButton(
          color: isDark ? Colors.white : Colors.black,
          onPressed: () {
            if (_step == 1) {
              setState(() => _step = 0);
            } else {
              Navigator.pop(context);
            }
          },
        ),
        title: Text(
          _step == 0 ? "Select Employee" : "Report Details",
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: _step == 0
            ? _buildEmployeeSelection(isDark)
            : _buildForm(isDark),
      ),
    );
  }

  Widget _buildEmployeeSelection(bool isDark) {
    return Consumer<FirProvider>(
      builder: (context, provider, child) {
        final employees = provider.employees.where((e) {
          final name = (e['employee_name'] as String).toLowerCase();
          final code = (e['employee_code'] as String).toLowerCase();
          final query = _employeeSearchQuery.toLowerCase();
          return name.contains(query) || code.contains(query);
        }).toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                onChanged: (val) => setState(() => _employeeSearchQuery = val),
                style: TextStyle(color: isDark ? Colors.white : Colors.black),
                decoration: InputDecoration(
                  hintText: "Search employee...",
                  hintStyle: TextStyle(
                    color: isDark ? Colors.grey[500] : Colors.grey,
                  ),
                  prefixIcon: const Icon(Icons.search, color: Colors.grey),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),

            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: employees.length,
                itemBuilder: (context, index) {
                  final emp = employees[index];
                  return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          color: isDark
                              ? const Color(0xFF1E293B)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          onTap: () {
                            setState(() {
                              _selectedEmployee = emp;
                              _step = 1;
                            });
                          },
                          title: Text(
                            emp['employee_name'] ?? 'Unknown',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w500,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          subtitle: Text(
                            emp['employee_code'] ?? '',
                            style: GoogleFonts.inter(color: Colors.grey),
                          ),
                          trailing: const Icon(
                            Icons.chevron_right,
                            color: Colors.grey,
                          ),
                        ),
                      )
                      .animate()
                      .fadeIn(
                        duration: 300.ms,
                        delay: (50 * (index < 15 ? index : 0)).ms,
                      )
                      .slideX(begin: 0.1);
                },
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildForm(bool isDark) {
    final primaryColor = _isPositive
        ? const Color(0xFF84CC16)
        : const Color(0xFFEF4444);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Employee Badge
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.indigo.shade100.withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.indigo.shade100,
                  radius: 20,
                  child: Text(
                    _selectedEmployee?['employee_name']?[0] ?? '?',
                    style: const TextStyle(
                      color: Colors.indigo,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _selectedEmployee?['employee_name'] ?? 'Unknown',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      Text(
                        _selectedEmployee?['employee_code'] ?? '',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit, size: 18, color: Colors.grey),
                  onPressed: () => setState(() => _step = 0),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Type Toggle
          Container(
            height: 50,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.grey.shade200,
              borderRadius: BorderRadius.circular(25),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() {
                      _isPositive = true;
                      _selectedCategory = null;
                    }),
                    child: AnimatedContainer(
                      duration: 200.ms,
                      decoration: BoxDecoration(
                        color: _isPositive
                            ? const Color(0xFF84CC16)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Center(
                        child: Text(
                          "Positive",
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            color: _isPositive ? Colors.white : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() {
                      _isPositive = false;
                      _selectedCategory = null;
                    }),
                    child: AnimatedContainer(
                      duration: 200.ms,
                      decoration: BoxDecoration(
                        color: !_isPositive
                            ? const Color(0xFFEF4444)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Center(
                        child: Text(
                          "Negative",
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            color: !_isPositive ? Colors.white : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Form Fields
          _buildLabel("Title", isDark),
          TextField(
            controller: _titleController,
            style: TextStyle(color: isDark ? Colors.white : Colors.black),
            decoration: _inputDecoration("Brief title of the event", isDark),
          ),
          const SizedBox(height: 16),

          _buildLabel("Category", isDark),
          Consumer<FirProvider>(
            builder: (context, provider, _) {
              final filtered = provider.categories
                  .where((c) {
                    final type = c['type'] as String?;
                    return type == (_isPositive ? 'GOOD' : 'BAD');
                  })
                  .map((c) => c['name'] as String)
                  .toList();

              return DropdownButtonFormField<String>(
                key: ValueKey(_isPositive),
                initialValue: _selectedCategory,
                dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                hint: Text(
                  "Select Category",
                  style: TextStyle(color: Colors.grey),
                ),
                items: filtered
                    .map(
                      (c) => DropdownMenuItem(
                        value: c,
                        child: Text(
                          c,
                          style: TextStyle(
                            color: isDark ? Colors.white : Colors.black,
                          ),
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (val) => setState(() => _selectedCategory = val),
                decoration: _inputDecoration("", isDark),
              );
            },
          ),
          const SizedBox(height: 16),

          _buildLabel("Description", isDark),
          TextField(
            controller: _descController,
            maxLines: 4,
            style: TextStyle(color: isDark ? Colors.white : Colors.black),
            decoration: _inputDecoration("Detailed description...", isDark),
          ),

          const SizedBox(height: 24),

          // Evidence Section
          _buildLabel("Evidence", isDark),
          Row(
            children: [
              // Voice Recorder Button
              Expanded(
                child: GestureDetector(
                  onTap: _toggleRecording,
                  child: AnimatedContainer(
                    duration: 300.ms,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: _isRecording
                          ? Colors.red.withValues(alpha: 0.1)
                          : (_audioPath != null
                                ? Colors.green.withValues(alpha: 0.1)
                                : (isDark
                                      ? const Color(0xFF1E293B)
                                      : Colors.white)),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _isRecording
                            ? Colors.red
                            : (_audioPath != null
                                  ? Colors.green
                                  : Colors.transparent),
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          _isRecording
                              ? Icons.stop_circle_outlined
                              : (_audioPath != null
                                    ? Icons.check_circle
                                    : Icons.mic_none_rounded),
                          color: _isRecording
                              ? Colors.red
                              : (_audioPath != null
                                    ? Colors.green
                                    : primaryColor),
                          size: 28,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _isRecording
                              ? "Recording..."
                              : (_audioPath != null
                                    ? "Recorded"
                                    : "Voice Note"),
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: _isRecording
                                ? Colors.red
                                : (_audioPath != null
                                      ? Colors.green
                                      : (isDark
                                            ? Colors.white70
                                            : Colors.black87)),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Camera/Photo Button
              Expanded(
                child: GestureDetector(
                  onTap: () => _pickImage(ImageSource.camera),
                  onLongPress: () =>
                      _pickImage(ImageSource.gallery), // Long press for gallery
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: _selectedImage != null
                          ? Border.all(color: Colors.green)
                          : null,
                    ),
                    child: Column(
                      children: [
                        if (_selectedImage != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: Image.file(
                              _selectedImage!,
                              height: 30,
                              width: 30,
                              fit: BoxFit.cover,
                            ),
                          )
                        else
                          Icon(
                            Icons.camera_alt_outlined,
                            color: primaryColor,
                            size: 28,
                          ),
                        const SizedBox(height: 8),
                        Text(
                          _selectedImage != null ? "Photo Added" : "Add Photo",
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: isDark ? Colors.white70 : Colors.black87,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          if (_selectedImage != null || _audioPath != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => setState(() {
                      _selectedImage = null;
                      _audioPath = null;
                    }),
                    child: Text(
                      "Clear Attachments",
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 32),

          // Submit Button
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _submitReport,
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 4,
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Text(
                      "Submit Report",
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ).animate().fadeIn(),
    );
  }

  Widget _buildLabel(String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4),
      child: Text(
        text.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: isDark ? Colors.grey[400] : Colors.grey[600],
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, bool isDark) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.grey[400]),
      filled: true,
      fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }
}
