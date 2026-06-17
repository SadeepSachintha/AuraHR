import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';
import '../models/attendance.dart';

class AttendanceScreen extends StatefulWidget {
  final String empId;
  final bool isClockedIn;
  const AttendanceScreen({super.key, required this.empId, required this.isClockedIn});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final ApiService _apiService = ApiService();
  bool _isLocating = true;
  Position? _currentPosition;
  String _statusMessage = 'Acquiring GPS Lock...';
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() {
        _isLocating = false;
        _statusMessage = 'Location services are disabled. Enable them in settings.';
      });
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          _isLocating = false;
          _statusMessage = 'Location permissions are denied.';
        });
        return;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      setState(() {
        _isLocating = false;
        _statusMessage = 'Location permissions are permanently denied, we cannot request permissions.';
      });
      return;
    } 

    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      setState(() {
        _currentPosition = position;
        _isLocating = false;
        _statusMessage = 'GPS Lock Acquired';
      });
    } catch (e) {
      setState(() {
        _isLocating = false;
        _statusMessage = 'Error fetching coordinates: $e';
      });
    }
  }

  Future<void> _submitAttendance() async {
    if (_currentPosition == null) return;
    setState(() => _isSubmitting = true);

    final todayStr = DateTime.now().toIso8601String().split('T')[0];
    final nowTimeStr = DateTime.now().hour.toString().padLeft(2, '0') + ':' + DateTime.now().minute.toString().padLeft(2, '0');

    final att = Attendance(
      empId: widget.empId,
      date: todayStr,
      clockIn: widget.isClockedIn ? '' : nowTimeStr,
      clockOut: widget.isClockedIn ? nowTimeStr : '',
      hours: 0.0,
      location: 'Mobile App (${_currentPosition!.latitude.toStringAsFixed(4)}, ${_currentPosition!.longitude.toStringAsFixed(4)})',
      device: 'Mobile App',
      latitude: _currentPosition!.latitude,
      longitude: _currentPosition!.longitude,
    );

    final result = await _apiService.clockInOrOut(att);
    setState(() => _isSubmitting = false);

    if (result['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(widget.isClockedIn ? 'Clocked out successfully!' : 'Clocked in successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.of(context).pop(true);
    } else {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Attendance Blocked'),
          content: Text(result['error'] ?? 'Connection to server failed.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Dismiss'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('GPS Geofenced Clock-in'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.04),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: Icon(
                  Icons.location_searching,
                  size: 64,
                  color: _currentPosition != null ? Colors.greenAccent : Colors.indigoAccent,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                _statusMessage,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Colors.white70),
              ),
              if (_currentPosition != null) ...[
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Latitude: ${_currentPosition!.latitude.toStringAsFixed(6)}',
                        style: const TextStyle(fontSize: 15, fontFamily: 'monospace', color: Colors.white70),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Longitude: ${_currentPosition!.longitude.toStringAsFixed(6)}',
                        style: const TextStyle(fontSize: 15, fontFamily: 'monospace', color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 48),
              if (_isSubmitting)
                const CircularProgressIndicator()
              else
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _currentPosition == null ? null : _submitAttendance,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: widget.isClockedIn ? Colors.redAccent : const Color(0xFF6366F1),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text(
                      widget.isClockedIn ? 'Clock Out Today' : 'Confirm Clock In Location',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
