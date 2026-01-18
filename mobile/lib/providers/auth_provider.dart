import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  Session? _session;
  bool _isLoading = false;
  String? _employeeCode;
  String? _employeeName;
  String? _role;
  bool _isStandalone = false;
  String? _employeeId; // References employee_master.id (int) as String

  User? get user => _user;
  Session? get session => _session;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  String? get employeeCode => _employeeCode;
  String? get employeeName => _employeeName;
  String? get employeeId => _employeeId;
  String? get role => _role;
  bool get isStandalone => _isStandalone;
  String? get fullName => _employeeName;

  AuthProvider() {
    // Defer auth initialization to after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initAuth();
    });
  }

  Future<void> _initAuth() async {
    debugPrint('[Auth] Starting auth initialization...');
    await _loadCachedData(); // Load cache immediately

    final session = Supabase.instance.client.auth.currentSession;
    if (session != null) {
      _session = session;
      _user = session.user;
      notifyListeners(); // Notify after setting session
      // We already loaded cached data, but we fetch fresh data in background
      _fetchEmployeeData(session.user.id);
    }

    Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      final AuthChangeEvent event = data.event;
      final Session? session = data.session;

      _session = session;
      _user = session?.user;

      if (event == AuthChangeEvent.signedIn && session != null) {
        _fetchEmployeeData(session.user.id);
      } else if (event == AuthChangeEvent.signedOut) {
        _clearData();
      }
      notifyListeners();
    });

    debugPrint('[Auth] Auth initialization complete');
  }

  Future<void> _loadCachedData() async {
    // SECURITY: Use encrypted storage instead of plain SharedPreferences
    final storage = FlutterSecureStorage();
    _employeeCode = await storage.read(key: 'employee_code');
    _employeeName = await storage.read(key: 'employee_name');
    _employeeId = await storage.read(key: 'employee_id');
    _role = await storage.read(key: 'role');
    final isStandaloneStr = await storage.read(key: 'is_standalone');
    _isStandalone = isStandaloneStr == 'true';
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      if (response.user != null) {
        await _fetchEmployeeData(response.user!.id);
      }
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    await Supabase.instance.client.auth.signOut();
    _clearData();
    notifyListeners();
  }

  Future<void> logout() async {
    await signOut();
  }

  Future<void> _fetchEmployeeData(String userId) async {
    try {
      // Fetch Profile
      final profileData = await Supabase.instance.client
          .from('profiles')
          .select('employee_code, role, full_name, standalone_attendance')
          .eq('id', userId)
          .single();

      _employeeCode = profileData['employee_code'];
      _role = profileData['role'];
      _isStandalone = profileData['standalone_attendance'] == 'YES';

      // Default name from profile
      _employeeName = profileData['full_name'];

      // Fetch Real Name from Employee Master
      if (_employeeCode != null) {
        final employeeData = await Supabase.instance.client
            .from('employee_master')
            .select('id, employee_name')
            .eq('employee_code', _employeeCode!)
            .maybeSingle();

        if (employeeData != null) {
          if (employeeData['employee_name'] != null) {
            _employeeName = employeeData['employee_name'];
          }
          if (employeeData['id'] != null) {
            _employeeId = employeeData['id'].toString();
          }
        }
      }

      // Cache Data - SECURITY: Use encrypted storage
      final storage = FlutterSecureStorage();
      if (_employeeCode != null) {
        await storage.write(key: 'employee_code', value: _employeeCode!);
      }
      if (_employeeName != null) {
        await storage.write(key: 'employee_name', value: _employeeName!);
      }
      if (_employeeId != null) {
        await storage.write(key: 'employee_id', value: _employeeId!);
      }
      if (_role != null) await storage.write(key: 'role', value: _role!);
      await storage.write(
        key: 'is_standalone',
        value: _isStandalone.toString(),
      );

      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching employee data: $e');
    }
  }

  Future<void> _clearData() async {
    _employeeCode = null;
    _employeeName = null;
    _role = null;
    _isStandalone = false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('employee_code');
    await prefs.remove('employee_name');
    await prefs.remove('role');
    await prefs.remove('is_standalone');
  }
}
