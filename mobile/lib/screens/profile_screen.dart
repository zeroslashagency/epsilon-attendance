import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    // Theme Colors
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final bgColor = theme.scaffoldBackgroundColor;
    final cardColor = theme.cardColor;
    const primaryOrange = Color(0xFFF2994A);
    const primaryPurple = Color(0xFF9C27B0);
    const primaryGreen = Color(0xFF4CAF50);
    final textColor = colorScheme.onSurface;
    // Header text is always white because it's on a colored gradient
    const headerTextColor = Colors.white;

    // Data from AuthProvider (or fallback to User Request data)
    final name = authProvider.employeeName ?? 'mr1398463@gmail.com';
    final email = authProvider.user?.email ?? 'mr1398463@gmail.com';
    final employeeCode = authProvider.employeeCode ?? 'EE 65';
    final role = authProvider.role ?? 'Super Admin';
    final accountId =
        authProvider.user?.id ?? 'e86467e3-25aa-4025-9c7c-67a99372899b';

    // Static/Mock Data for fields not in Provider yet
    final memberSince = "Aug 2025";
    final lastLogin = DateFormat(
      "MMM d, hh:mm a",
    ).format(DateTime.now()); // Dynamic for "Now" effect

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Floating Header Card
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [primaryPurple, primaryOrange],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 20, 24, 40),
                  child: Column(
                    children: [
                      // Avatar with Glow
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.white.withValues(alpha: 0.2),
                              blurRadius: 15,
                              spreadRadius: 2,
                            ),
                          ],
                          image: const DecorationImage(
                            image: NetworkImage(
                              "https://i.pinimg.com/originals/af/89/3e/af893ef77c62353ce8590e418a94783a.gif",
                            ), // Pinterest visual
                            fit: BoxFit.cover,
                          ),
                        ),
                      ).animate().scale(
                        duration: 600.ms,
                        curve: Curves.easeOutBack,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        name,
                        style: GoogleFonts.inter(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: headerTextColor,
                        ),
                      ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.3),
                      Text(
                        email,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: headerTextColor.withValues(alpha: 0.8),
                        ),
                      ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.3),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          role,
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ).animate().fadeIn(delay: 400.ms).scale(),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),

            // Account Status Section
            _buildSectionHeader("Account Status", textColor),
            const SizedBox(height: 10),
            _buildInfoCard(context, cardColor, colorScheme.outline, [
                  _buildRowItem(
                    "Status",
                    "Active",
                    textColor,
                    valueColor: primaryOrange,
                  ),
                  _buildRowItem("Member Since", memberSince, textColor),
                  _buildRowItem("Last Login", lastLogin, textColor), // Dynamic
                  _buildRowItem(
                    "Security",
                    "Protected",
                    textColor,
                    valueColor: primaryGreen,
                  ),
                ])
                .animate()
                .slideX(
                  begin: 0.2,
                  end: 0,
                  duration: 500.ms,
                  curve: Curves.easeOutQuad,
                )
                .fadeIn(),

            const SizedBox(height: 24),

            // Profile Information
            _buildSectionHeader("Profile Information", textColor),
            const SizedBox(height: 10),
            _buildInfoCard(context, cardColor, colorScheme.outline, [
                  _buildRowItem("Full Name", name, textColor),
                  _buildRowItem("Email Address", email, textColor),
                  _buildRowItem("Employee Code", employeeCode, textColor),
                  _buildRowItem("Role", role, textColor),
                  _buildRowItem(
                    "Account ID",
                    accountId,
                    textColor,
                    isSmall: true,
                  ),
                ])
                .animate()
                .slideX(
                  begin: 0.2,
                  end: 0,
                  delay: 100.ms,
                  duration: 500.ms,
                  curve: Curves.easeOutQuad,
                )
                .fadeIn(),

            const SizedBox(height: 24),

            // Security & Settings
            _buildSectionHeader("Security & Settings", textColor),
            const SizedBox(height: 10),
            _buildActionCard(
                  "Password",
                  "Reset your password via email",
                  "Change Password",
                  cardColor,
                  colorScheme.outline,
                  textColor,
                  colorScheme.onSurfaceVariant,
                  () {},
                )
                .animate()
                .slideX(
                  begin: 0.2,
                  end: 0,
                  delay: 200.ms,
                  duration: 500.ms,
                  curve: Curves.easeOutQuad,
                )
                .fadeIn(),

            const SizedBox(height: 12),

            _buildActionCard(
                  "Email Address",
                  "Update your email address",
                  "Change Email",
                  cardColor,
                  colorScheme.outline,
                  textColor,
                  colorScheme.onSurfaceVariant,
                  () {},
                )
                .animate()
                .slideX(
                  begin: 0.2,
                  end: 0,
                  delay: 300.ms,
                  duration: 500.ms,
                  curve: Curves.easeOutQuad,
                )
                .fadeIn(),

            const SizedBox(height: 40),

            // Logout Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => authProvider.signOut(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.withValues(alpha: 0.1),
                  foregroundColor: Colors.redAccent,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  "Log Out",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ).animate().fadeIn(delay: 500.ms).moveY(begin: 20, end: 0),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: TextStyle(
          color: color,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context,
    Color bgColor,
    Color outlineColor,
    List<Widget> children,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: outlineColor.withValues(alpha: 0.1)),
      ),
      child: Column(
        children: children.asMap().entries.map((entry) {
          final index = entry.key;
          final isLast = index == children.length - 1;
          return Column(
            children: [
              entry.value,
              if (!isLast)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Divider(
                    color: outlineColor.withValues(alpha: 0.1),
                    height: 1,
                  ),
                ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildRowItem(
    String label,
    String value,
    Color textColor, {
    Color? valueColor,
    bool isSmall = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: textColor.withValues(alpha: 0.6),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: valueColor ?? textColor,
              fontSize: isSmall ? 12 : 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionCard(
    String title,
    String subtitle,
    String buttonText,
    Color bgColor,
    Color outlineColor,
    Color textColor,
    Color subColor,
    VoidCallback onTap,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: outlineColor.withValues(alpha: 0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 4),
              Text(subtitle, style: TextStyle(color: subColor, fontSize: 12)),
            ],
          ),
          TextButton(
            onPressed: onTap,
            style: TextButton.styleFrom(
              foregroundColor: Colors.blueAccent,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              backgroundColor: Colors.blueAccent.withValues(alpha: 0.1),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              buttonText,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
