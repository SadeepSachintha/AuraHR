import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RosterNotification {
  final String title;
  final String description;
  final DateTime date;
  final String status;
  final bool isLeave;

  RosterNotification({
    required this.title,
    required this.description,
    required this.date,
    required this.status,
    required this.isLeave,
  });
}

class NotificationsScreen extends StatefulWidget {
  final String empId;
  const NotificationsScreen({super.key, required this.empId});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _apiService = ApiService();
  List<RosterNotification> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    
    final leaves = await _apiService.fetchLeaves(widget.empId);
    final claims = await _apiService.fetchClaims(widget.empId);
    
    final List<RosterNotification> list = [];

    // Process Leaves
    for (var l in leaves) {
      if (l.status.toLowerCase() != 'pending') {
        final deciderStr = l.decider.isNotEmpty ? ' by ${l.decider}' : '';
        list.add(RosterNotification(
          title: '${l.status} Leave Request',
          description: 'Your ${l.type} leave starting on ${l.start} has been ${l.status.toLowerCase()}$deciderStr.',
          date: l.created_at,
          status: l.status,
          isLeave: true,
        ));
      }
    }

    // Process Claims
    for (var c in claims) {
      if (c.status.toLowerCase() != 'pending') {
        final deciderStr = c.decider.isNotEmpty ? ' by ${c.decider}' : '';
        list.add(RosterNotification(
          title: '${c.status} Reimbursement Claim',
          description: 'Your ${c.category} claim for \$${c.amount.toStringAsFixed(2)} was ${c.status.toLowerCase()}$deciderStr.',
          date: c.created_at,
          status: c.status,
          isLeave: false,
        ));
      }
    }

    // Sort chronologically
    list.sort((a, b) => b.date.compareTo(a.date));

    if (!mounted) return;
    setState(() {
      _notifications = list;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_none, size: 64, color: Colors.white24),
                      SizedBox(height: 16),
                      Text(
                        'No new administrative updates.',
                        style: TextStyle(color: Colors.white38, fontSize: 15),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final note = _notifications[index];
                    final isApproved = note.status.toLowerCase() == 'approved';
                    
                    return Container(
                      margin: const EdgeInsets.bottom(12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.03),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isApproved ? Colors.green.withOpacity(0.15) : Colors.redAccent.withOpacity(0.15),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Status Icon Accent
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: (isApproved ? Colors.green : Colors.redAccent).withOpacity(0.12),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              note.isLeave ? Icons.calendar_today : Icons.receipt_long,
                              color: isApproved ? Colors.greenAccent : Colors.redAccent,
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Content Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  note.title,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: isApproved ? Colors.greenAccent : Colors.redAccent,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  note.description,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: Colors.white70,
                                    height: 1.35,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
