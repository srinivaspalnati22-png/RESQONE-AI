import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color background = Color(0xFF030712); // Deep Space Black
  static const Color surfaceDark = Color(0xFF0B1220); // Dark Glass Surface
  static const Color surfaceCard = Color(0xFF0F172A); // Elevated Card Surface
  static const Color surfaceBorder = Color(0xFF1E293B); // Border Slate 800

  static const Color primaryCyan = Color(0xFF06B6D4); // Neon Cyan
  static const Color primaryCyanDark = Color(0xFF0891B2);
  static const Color emergencyRed = Color(0xFFEF4444); // Critical Red
  static const Color emergencyRedDark = Color(0xFF991B1B);
  static const Color successGreen = Color(0xFF10B981); // Emerald Green
  static const Color warningAmber = Color(0xFFF59E0B); // Amber Warning
  static const Color accentPurple = Color(0xFF8B5CF6);

  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Typography Styles
  static TextStyle displayHero({Color color = textPrimary}) =>
      GoogleFonts.plusJakartaSans(fontSize: 30, fontWeight: FontWeight.w800, letterSpacing: -0.8, color: color);

  static TextStyle titleSection({Color color = textPrimary}) =>
      GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w700, letterSpacing: -0.4, color: color);

  static TextStyle subHeader({Color color = textSecondary}) =>
      GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, letterSpacing: -0.1, color: color);

  static TextStyle bodyText({Color color = textPrimary}) =>
      GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w400, color: color);

  static TextStyle telemetryMono({Color color = primaryCyan, double size = 14, FontWeight weight = FontWeight.w600}) =>
      GoogleFonts.jetBrainsMono(fontSize: size, fontWeight: weight, letterSpacing: 0.5, color: color);

  static ThemeData get darkTheme {
    final baseTextTheme = GoogleFonts.interTextTheme(ThemeData.dark().textTheme);
    
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primaryCyan,
      colorScheme: const ColorScheme.dark(
        primary: primaryCyan,
        secondary: emergencyRed,
        surface: surfaceDark,
        background: background,
        error: emergencyRed,
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.plusJakartaSans(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.8,
          color: textPrimary,
        ),
        displayMedium: GoogleFonts.plusJakartaSans(
          fontSize: 26,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.5,
          color: textPrimary,
        ),
        headlineLarge: GoogleFonts.plusJakartaSans(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.4,
          color: textPrimary,
        ),
        headlineMedium: GoogleFonts.plusJakartaSans(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
          color: textPrimary,
        ),
        titleLarge: GoogleFonts.plusJakartaSans(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.2,
          color: textPrimary,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: textPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.w400,
          color: textSecondary,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
          color: textPrimary,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceDark,
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: primaryCyan),
        titleTextStyle: GoogleFonts.plusJakartaSans(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardTheme(
        color: surfaceDark,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: surfaceBorder, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryCyan,
          foregroundColor: Colors.black,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w800,
            fontSize: 14,
            letterSpacing: 0.2,
          ),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: surfaceDark,
        selectedItemColor: primaryCyan,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 11),
        unselectedLabelStyle: GoogleFonts.inter(fontWeight: FontWeight.w500, fontSize: 11),
        elevation: 10,
      ),
    );
  }
}
