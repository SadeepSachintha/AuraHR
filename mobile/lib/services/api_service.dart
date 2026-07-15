import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config.dart';
import '../models/employee.dart';
import '../models/attendance.dart';
import '../models/leave.dart';
import '../models/claim.dart';
import '../models/payslip.dart';
import '../models/task.dart';

class ApiService {
  final String companyId;
  final _secureStorage = const FlutterSecureStorage();
  static const String _offlineQueueKey = 'aura_offline_attendance_queue';

  ApiService({this.companyId = Config.companyId});

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'X-Company-ID': companyId,
  };

  // Fetch employee profile
  Future<Employee?> fetchEmployeeProfile(String empId) async {
    try {
      final response = await http.get(
        Uri.parse('${Config.apiUrl}/employees?id=eq.$empId'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        if (data.isNotEmpty) {
          return Employee.fromJson(data.first);
        }
      }
    } catch (e) {
      print('Error fetching profile: $e');
    }
    return null;
  }

  // Fetch all employees in current company
  Future<List<Employee>> fetchEmployees() async {
    try {
      final response = await http.get(
        Uri.parse('${Config.apiUrl}/employees'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        return data.map((json) => Employee.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching employees: $e');
    }
    return [];
  }

  // Clock in or out with geofence validation
  Future<Map<String, dynamic>> clockInOrOut(Attendance attendance) async {
    try {
      final response = await http.post(
        Uri.parse('${Config.apiUrl}/attendance'),
        headers: _headers,
        body: json.encode(attendance.toJson()),
      ).timeout(const Duration(seconds: 5));
      
      final Map<String, dynamic> resData = json.decode(response.body);
      if (response.statusCode == 200) {
        return {'success': true};
      } else {
        // If it's a server logic rejection (e.g. Geofence violation), don't queue offline.
        return {'success': false, 'error': resData['error'] ?? 'Server error'};
      }
    } catch (e) {
      // Network timeout, DNS lookup error, socket exception etc.
      // Queue offline for later sync
      await _queueOfflineAttendance(attendance);
      return {'success': true, 'offline': true};
    }
  }

  Future<void> _queueOfflineAttendance(Attendance attendance) async {
    try {
      final dataStr = await _secureStorage.read(key: _offlineQueueKey);
      List<dynamic> queue = [];
      if (dataStr != null && dataStr.isNotEmpty) {
        queue = json.decode(dataStr);
      }
      queue.add(attendance.toJson());
      await _secureStorage.write(key: _offlineQueueKey, value: json.encode(queue));
    } catch (e) {
      print('Error queueing offline attendance: $e');
    }
  }

  Future<int> syncOfflineQueue() async {
    try {
      final dataStr = await _secureStorage.read(key: _offlineQueueKey);
      if (dataStr == null || dataStr.isEmpty) return 0;
      
      final List<dynamic> queue = json.decode(dataStr);
      if (queue.isEmpty) return 0;

      int syncedCount = 0;
      List<dynamic> remaining = [];

      for (var item in queue) {
        final attendance = Attendance.fromJson(item);
        try {
          final response = await http.post(
            Uri.parse('${Config.apiUrl}/attendance'),
            headers: _headers,
            body: json.encode(attendance.toJson()),
          ).timeout(const Duration(seconds: 5));

          if (response.statusCode == 200) {
            syncedCount++;
          } else {
            remaining.add(item);
          }
        } catch (e) {
          remaining.add(item);
        }
      }

      await _secureStorage.write(key: _offlineQueueKey, value: json.encode(remaining));
      return syncedCount;
    } catch (e) {
      print('Error syncing offline queue: $e');
      return 0;
    }
  }

  // Fetch attendance logs for employee
  Future<List<Attendance>> fetchAttendanceLogs(String empId) async {
    try {
      final response = await http.get(
        Uri.parse('${Config.apiUrl}/attendance?emp_id=eq.$empId'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        return data.map((json) => Attendance.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching attendance logs: $e');
    }
    return [];
  }

  // Apply for leave
  Future<bool> submitLeave(Leave leave) async {
    try {
      final response = await http.post(
        Uri.parse('${Config.apiUrl}/leaves'),
        headers: _headers,
        body: json.encode(leave.toJson()),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error applying for leave: $e');
      return false;
    }
  }

  // Fetch leaves history
  Future<List<Leave>> fetchLeaves(String empId) async {
    try {
      final response = await http.get(
        Uri.parse('${Config.apiUrl}/leaves?emp_id=eq.$empId'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        return data.map((json) => Leave.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching leaves: $e');
    }
    return [];
  }

  // Submit expense claim
  Future<bool> submitClaim(Claim claim) async {
    try {
      final response = await http.post(
        Uri.parse('${Config.apiUrl}/claims'),
        headers: _headers,
        body: json.encode(claim.toJson()),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error submitting claim: $e');
      return false;
    }
  }

  // Fetch claims history
  Future<List<Claim>> fetchClaims(String empId) async {
    try {
      final response = await http.get(
        Uri.parse('${Config.apiUrl}/claims?emp_id=eq.$empId'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        return data.map((json) => Claim.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching claims: $e');
    }
    return [];
  }

  // Fetch payslips
  Future<List<Payslip>> fetchPayslips(String empId) async {
    try {
      final response = await http.get(
        Uri.parse('${Config.apiUrl}/payslips?emp_id=eq.$empId'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        return data.map((json) => Payslip.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching payslips: $e');
    }
    return [];
  }

  // Fetch KPI/Appraisal for employee
  Future<Map<String, dynamic>?> fetchEmployeeKpi(String empId) async {
    try {
      final response = await http.get(
        Uri.parse('${Config.apiUrl}/kpis'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        final kpi = data.firstWhere(
          (k) => k['emp_id'] == empId,
          orElse: () => null,
        );
        return kpi;
      }
    } catch (e) {
      print('Error fetching KPI: $e');
    }
    return null;
  }

  // Register mobile device token for push notification updates
  Future<bool> registerDevice({
    required String empId,
    required String deviceToken,
    required String platform,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${Config.apiUrl}/devices'),
        headers: _headers,
        body: json.encode({
          'emp_id': empId,
          'device_token': deviceToken,
          'platform': platform,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error registering device token: $e');
      return false;
    }
  }

  // Fetch task lists assigned to employee
  Future<List<Task>> fetchTasks(String empId) async {
    try {
      final response = await http.get(
        Uri.parse('${Config.apiUrl}/tasks?emp_id=eq.$empId'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        return data.map((json) => Task.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching tasks: $e');
    }
    return [];
  }

  // Update status state of task
  Future<bool> updateTaskStatus(Task task, String newStatus) async {
    try {
      final response = await http.post(
        Uri.parse('${Config.apiUrl}/tasks'),
        headers: _headers,
        body: json.encode({
          'id': task.id,
          'project_id': task.projectId,
          'emp_id': task.empId,
          'title': task.title,
          'status': newStatus,
          'due_date': task.dueDate,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error updating task: $e');
      return false;
    }
  }
}
