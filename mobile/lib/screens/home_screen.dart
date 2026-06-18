import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/employee.dart';
import '../models/attendance.dart';
import 'attendance_screen.dart';
import 'self_service_screens.dart';

class HomeScreen extends StatefulWidget {
  final String empId;
  const HomeScreen({super.key, required this.empId});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  Employee? _employee;
  bool _isLoading = true;
  String _shiftStatus = 'Not Logged';
  bool _isClockedIn = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    final emp = await _apiService.fetchEmployeeProfile(widget.empId);
    if (emp != null) {
      // Mock loading today's shift log status
      final logs = await _apiService.fetchAttendanceLogs(widget.empId);
      final todayStr = DateTime.now().toIso8601String().split('T')[0];
      final todayLog = logs.where((l) => l.date == todayStr).toList();
      
      setState(() {
        _employee = emp;
        _isLoading = false;
        if (todayLog.isNotEmpty) {
          if (todayLog.first.clockOut.isEmpty) {
            _shiftStatus = 'Checked In';
            _isClockedIn = true;
          } else {
            _shiftStatus = 'Shift Ended';
            _isClockedIn = false;
          }
        } else {
          _shiftStatus = 'Not Logged';
          _isClockedIn = false;
        }
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_employee == null) {
      return const Scaffold(
        body: Center(child: Text('Failed to load profile.')),
      );
    }

    final emp = _employee!;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('AuraMobile'),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadProfile,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User info header card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundImage: NetworkImage(emp.avatar),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hello, ${emp.name}!',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            emp.role,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.6),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Shift Clock widget card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF312E81), Color(0xFF1E1B4B)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withOpacity(0.15)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'TODAY\'S SHIFT',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                            color: Colors.white70,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _isClockedIn ? Colors.green.withOpacity(0.2) : Colors.amber.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _shiftStatus,
                            style: TextStyle(
                              color: _isClockedIn ? Colors.greenAccent : Colors.amberAccent,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Shift Schedule: 09:00 AM - 05:00 PM',
                      style: TextStyle(color: Colors.white54, fontSize: 13),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _shiftStatus == 'Shift Ended' ? null : () async {
                          final result = await Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => AttendanceScreen(empId: emp.id, isClockedIn: _isClockedIn),
                            ),
                          );
                          if (result == true) {
                            _loadProfile();
                          }
                        },
                        icon: Icon(_isClockedIn ? Icons.logout : Icons.location_on),
                        label: Text(_isClockedIn ? 'Clock Out Shift' : 'Clock In with GPS'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isClockedIn ? Colors.redAccent : const Color(0xFF6366F1),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Self Service Actions',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 16),
              // Grid Dashboard Actions
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  _buildWidgetCard(
                    icon: Icons.calendar_today,
                    title: 'Leave Portal',
                    subtitle: '${emp.leaveBalances['Annual'] ?? 0} Annual Days',
                    color: Colors.teal,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => LeavePortalScreen(employee: emp),
                        ),
                      );
                    },
                  ),
                  _buildWidgetCard(
                    icon: Icons.receipt_long,
                    title: 'Expense Claims',
                    subtitle: 'Apply reimbursement',
                    color: Colors.orange,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => ExpenseClaimsScreen(empId: emp.id),
                        ),
                      );
                    },
                  ),
                  _buildWidgetCard(
                    icon: Icons.payment,
                    title: 'Payslips',
                    subtitle: 'View monthly breakdown',
                    color: Colors.purple,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => PayslipsScreen(empId: emp.id),
                        ),
                      );
                    },
                  ),
                  _buildWidgetCard(
                    icon: Icons.trending_up,
                    title: 'Appraisals & KPIs',
                    subtitle: 'Check goal progress',
                    color: Colors.blue,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => KpisScreen(empId: emp.id),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWidgetCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.white.withOpacity(0.5),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
