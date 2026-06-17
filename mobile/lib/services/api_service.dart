import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/employee.dart';
import '../models/attendance.dart';
import '../models/leave.dart';
import '../models/claim.dart';
import '../models/payslip.dart';

class ApiService {
  final String companyId;
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
      );
      
      final Map<String, dynamic> resData = json.decode(response.body);
      if (response.statusCode == 200) {
        return {'success': true};
      } else {
        return {'success': false, 'error': resData['error'] ?? 'Server error'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
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
}
