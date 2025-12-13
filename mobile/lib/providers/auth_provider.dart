import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
    _initAuth();
  }

  Future<void> _initAuth() async {
    await _loadCachedData(); // Load cache immediately

    final session = Supabase.instance.client.auth.currentSession;
    if (session != null) {
      _session = session;
      _user = session.user;
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
  }

  Future<void> _loadCachedData() async {
    final prefs = await SharedPreferences.getInstance();
    _employeeCode = prefs.getString('employee_code');
    _employeeName = prefs.getString('employee_name');
    _employeeId = prefs.getString('employee_id');
    _role = prefs.getString('role');
    _isStandalone = prefs.getBool('is_standalone') ?? false;
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

      // Cache Data
      final prefs = await SharedPreferences.getInstance();
      if (_employeeCode != null) {
        await prefs.setString('employee_code', _employeeCode!);
      }
      if (_employeeName != null) {
        await prefs.setString('employee_name', _employeeName!);
      }
      if (_employeeId != null) {
        await prefs.setString('employee_id', _employeeId!);
      }
      if (_role != null) await prefs.setString('role', _role!);
      await prefs.setBool('is_standalone', _isStandalone);

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
