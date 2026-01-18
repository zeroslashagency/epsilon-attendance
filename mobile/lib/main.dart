import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'utils/app_palette.dart';

import 'providers/auth_provider.dart';
import 'providers/attendance_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/fir_provider.dart';
import 'providers/call_recording_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/splash_screen.dart';
import 'screens/intro_video_screen.dart';

import 'utils/secure_storage.dart';

// ... imports

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  await dotenv.load(fileName: ".env");

  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL'] ?? '',
    anonKey: dotenv.env['SUPABASE_ANON_KEY'] ?? '',
    authOptions: FlutterAuthClientOptions(localStorage: SecureLocalStorage()),
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => FirProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => CallRecordingProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: 'Epsilon',
            debugShowCheckedModeBanner: false,
            themeMode: themeProvider.themeMode,
            theme: ThemeData(
              colorScheme: ColorScheme.fromSeed(
                seedColor: Colors.deepPurple,
                brightness: Brightness.light,
                primary: const Color(0xFF111827),
                secondary: Colors.greenAccent,
              ),
              useMaterial3: true,
              textTheme: GoogleFonts.outfitTextTheme(),
              pageTransitionsTheme: const PageTransitionsTheme(
                builders: {
                  TargetPlatform.android: ZoomPageTransitionsBuilder(),
                  TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
                },
              ),
            ),
            darkTheme: ThemeData(
              colorScheme: ColorScheme.fromSeed(
                seedColor: AppPalette.accentCyan,
                brightness: Brightness.dark,
                primary: AppPalette.accentCyan,
                secondary: AppPalette.accentGreen,
                surface: AppPalette.cardDark,
                onSurface: AppPalette.textPrimaryDark,
              ),
              useMaterial3: true,
              textTheme: GoogleFonts.outfitTextTheme(
                ThemeData.dark().textTheme,
              ),
              scaffoldBackgroundColor: AppPalette.primaryDark,
              cardColor: AppPalette.cardDark,
              appBarTheme: const AppBarTheme(
                backgroundColor: AppPalette.primaryDark,
                elevation: 0,
              ),
              pageTransitionsTheme: const PageTransitionsTheme(
                builders: {
                  TargetPlatform.android: ZoomPageTransitionsBuilder(),
                  TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
                },
              ),
            ),
            home: const InitialScreenWrapper(),
          );
        },
      ),
    );
  }
}

class InitialScreenWrapper extends StatefulWidget {
  const InitialScreenWrapper({super.key});

  @override
  State<InitialScreenWrapper> createState() => _InitialScreenWrapperState();
}

class _InitialScreenWrapperState extends State<InitialScreenWrapper> {
  bool? _hasSeenIntro;

  @override
  void initState() {
    super.initState();
    _checkIntroStatus();
  }

  Future<void> _checkIntroStatus() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _hasSeenIntro = prefs.getBool('has_seen_intro') ?? false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_hasSeenIntro == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF111827),
        body: Center(
          child: CircularProgressIndicator(color: Colors.greenAccent),
        ),
      );
    }

    if (!_hasSeenIntro!) {
      return const IntroVideoScreen();
    }

    return const AuthWrapper();
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    // If we are still initializing auth check
    if (authProvider.session == null && authProvider.isLoading) {
      return const SplashScreen();
    }

    // If authenticated, show Home
    if (authProvider.isAuthenticated) {
      return const HomeScreen();
    }

    // Otherwise show Login
    return const LoginScreen();
  }
}
