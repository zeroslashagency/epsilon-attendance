import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../providers/fir_provider.dart';
import '../../../models/fir_model.dart';
import '../../../widgets/fir/fir_report_card.dart';
import '../fir_report_detail_screen.dart';

class FirReportsTab extends StatefulWidget {
  const FirReportsTab({super.key});

  @override
  State<FirReportsTab> createState() => _FirReportsTabState();
}

class _FirReportsTabState extends State<FirReportsTab> {
  String _searchQuery = '';
  String _selectedFilter = 'All'; // All, Pending, Critical, Resolved

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<FirProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Filter Logic
    List<FirReport> displayedReports = provider.reports.where((report) {
      final matchesSearch =
          report.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          report.reporterName.toLowerCase().contains(
            _searchQuery.toLowerCase(),
          );

      if (!matchesSearch) return false;

      switch (_selectedFilter) {
        case 'Pending':
          return report.status == FirStatus.reported ||
              report.status == FirStatus.personResponse;
        case 'Critical':
          return report.priority == FirPriority.critical ||
              report.priority == FirPriority.high;
        case 'Resolved':
          return report.status == FirStatus.closed;
        default:
          return true;
      }
    }).toList();

    return Column(
      children: [
        // 1. Search & Filter Header
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
          child: Column(
            children: [
              // Search Bar
              TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                style: GoogleFonts.inter(
                  color: isDark ? Colors.white : Colors.black87,
                ),
                decoration: InputDecoration(
                  hintText: 'Search reports...',
                  hintStyle: GoogleFonts.inter(color: Colors.grey),
                  prefixIcon: const Icon(Icons.search, color: Colors.grey),
                  filled: true,
                  fillColor: isDark
                      ? const Color(0xFF1E293B)
                      : Colors.grey[100],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Filter Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['All', 'Pending', 'Critical', 'Resolved'].map((
                    filter,
                  ) {
                    final isSelected = _selectedFilter == filter;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(filter),
                        selected: isSelected,
                        onSelected: (_) =>
                            setState(() => _selectedFilter = filter),
                        backgroundColor: isDark
                            ? const Color(0xFF1E293B)
                            : Colors.white,
                        selectedColor: Colors.blue.withValues(
                          alpha: 0.2,
                        ), // Fixed color
                        checkmarkColor: Colors.blue,
                        labelStyle: GoogleFonts.inter(
                          color: isSelected ? Colors.blue : Colors.grey,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.w500,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: BorderSide(
                            color: isSelected
                                ? Colors.blue
                                : (isDark
                                      ? Colors.grey[800]!
                                      : Colors.grey[300]!),
                          ),
                        ),
                        showCheckmark: false,
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),

        // 2. Reports List
        Expanded(
          child: provider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : displayedReports.isEmpty
              ? _buildEmptyState(isDark)
              : RefreshIndicator(
                  onRefresh: () async {
                    await provider.fetchReports();
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: displayedReports.length,
                    itemBuilder: (context, index) {
                      final report = displayedReports[index];
                      return FirReportCard(
                            report: report,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (ctx) =>
                                      FirReportDetailScreen(report: report),
                                ),
                              );
                            },
                          )
                          .animate()
                          .slideY(
                            begin: 0.1,
                            duration: 300.ms,
                            delay: (index * 50).ms,
                          )
                          .fadeIn();
                    },
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_rounded, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            "No reports found",
            style: GoogleFonts.inter(
              fontSize: 16,
              color: isDark ? Colors.grey[300] : Colors.grey[600],
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
