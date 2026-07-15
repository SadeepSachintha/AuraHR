import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../models/employee.dart';

class CoworkerDirectoryScreen extends StatefulWidget {
  const CoworkerDirectoryScreen({super.key});

  @override
  State<CoworkerDirectoryScreen> createState() => _CoworkerDirectoryScreenState();
}

class _CoworkerDirectoryScreenState extends State<CoworkerDirectoryScreen> {
  final ApiService _apiService = ApiService();
  List<Employee> _allEmployees = [];
  List<Employee> _filteredEmployees = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedDept = 'All';

  final List<String> _departments = ['All', 'Engineering', 'HR', 'Sales', 'Operations'];

  @override
  void initState() {
    super.initState();
    _fetchCoworkers();
  }

  Future<void> _fetchCoworkers() async {
    setState(() => _isLoading = true);
    final data = await _apiService.fetchEmployees();
    if (!mounted) return;
    setState(() {
      _allEmployees = data;
      _filteredEmployees = data;
      _isLoading = false;
    });
  }

  void _applyFilter() {
    setState(() {
      _filteredEmployees = _allEmployees.where((emp) {
        final matchesSearch = emp.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().contains(_searchQuery.toLowerCase());
        final matchesDept = _selectedDept == 'All' || emp.dept == _selectedDept;
        return matchesSearch && matchesDept;
      }).toList();
    });
  }

  void _copyToClipboard(String label, String value) {
    Clipboard.setData(ClipboardData(text: value));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copied to clipboard!'),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Coworker Directory'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Filter Panel
                Container(
                  padding: const EdgeInsets.all(16),
                  color: const Color(0xFF1E293B).withOpacity(0.5),
                  child: Column(
                    children: [
                      // Search bar
                      TextField(
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Search by name or role...',
                          hintStyle: const TextStyle(color: Colors.white38),
                          prefixIcon: const Icon(Icons.search, color: Colors.white54),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.04),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Colors.cyan),
                          ),
                        ),
                        onChanged: (val) {
                          _searchQuery = val;
                          _applyFilter();
                        },
                      ),
                      const SizedBox(height: 12),
                      // Department selector
                      Row(
                        children: [
                          const Text(
                            'Department: ',
                            style: TextStyle(color: Colors.white70, fontSize: 14),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.04),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.white.withOpacity(0.1)),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _selectedDept,
                                  dropdownColor: const Color(0xFF1E293B),
                                  style: const TextStyle(color: Colors.white, fontSize: 14),
                                  icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                                  items: _departments.map((dept) {
                                    return DropdownMenuItem(
                                      value: dept,
                                      child: Text(dept),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) {
                                      setState(() {
                                        _selectedDept = val;
                                        _applyFilter();
                                      });
                                    }
                                  },
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Directory List
                Expanded(
                  child: _filteredEmployees.isEmpty
                      ? const Center(
                          child: Text(
                            'No coworkers found.',
                            style: TextStyle(color: Colors.white38, fontSize: 15),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filteredEmployees.length,
                          itemBuilder: (context, index) {
                            final emp = _filteredEmployees[index];
                            final isOnline = emp.status == 'online';
                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.03),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.white.withOpacity(0.06)),
                              ),
                              child: Row(
                                children: [
                                  // Avatar with status indicator ring
                                  Stack(
                                    children: [
                                      CircleAvatar(
                                        radius: 26,
                                        backgroundImage: NetworkImage(emp.avatar),
                                      ),
                                      Positioned(
                                        right: 0,
                                        bottom: 0,
                                        child: Container(
                                          height: 14,
                                          width: 14,
                                          decoration: BoxDecoration(
                                            color: isOnline ? Colors.green : Colors.grey,
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                              color: const Color(0xFF0F172A),
                                              width: 2,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(width: 16),
                                  // Info
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          emp.name,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${emp.role} • ${emp.dept}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.white.withOpacity(0.5),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Call and Email Action buttons
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.email_outlined, color: Colors.cyan, size: 20),
                                        onPressed: () => _copyToClipboard('Email', emp.email),
                                        tooltip: 'Copy Email',
                                      ),
                                      if (emp.phone != null && emp.phone!.isNotEmpty)
                                        IconButton(
                                          icon: const Icon(Icons.phone_outlined, color: Colors.greenAccent, size: 20),
                                          onPressed: () => _copyToClipboard('Phone number', emp.phone!),
                                          tooltip: 'Copy Phone',
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
