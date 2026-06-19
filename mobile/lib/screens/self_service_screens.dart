import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/leave.dart';
import '../models/claim.dart';
import '../models/payslip.dart';
import '../models/employee.dart';

// ==========================================================================
// 1. LEAVE PORTAL SCREEN
// ==========================================================================
class LeavePortalScreen extends StatefulWidget {
  final Employee employee;
  const LeavePortalScreen({super.key, required this.employee});

  @override
  State<LeavePortalScreen> createState() => _LeavePortalScreenState();
}

class _LeavePortalScreenState extends State<LeavePortalScreen> {
  final ApiService _apiService = ApiService();
  late List<Leave> _leaves = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLeaves();
  }

  Future<void> _loadLeaves() async {
    setState(() => _isLoading = true);
    final history = await _apiService.fetchLeaves(widget.employee.id);
    if (!mounted) return;
    setState(() {
      _leaves = history;
      _isLoading = false;
    });
  }

  void _openApplyLeaveForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => ApplyLeaveModal(
        empId: widget.employee.id,
        onSuccess: () {
          Navigator.pop(context);
          _loadLeaves();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Leave application submitted successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Leave Portal'),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadLeaves,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Balance summary cards
                  const Text(
                    'Available Leave Balance',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildBalanceCard(
                          title: 'Annual',
                          count: widget.employee.leaveBalances['Annual'] ?? 0,
                          color: Colors.tealAccent,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildBalanceCard(
                          title: 'Casual',
                          count: widget.employee.leaveBalances['Casual'] ?? 0,
                          color: Colors.orangeAccent,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildBalanceCard(
                          title: 'Medical',
                          count: widget.employee.leaveBalances['Medical'] ?? 0,
                          color: Colors.redAccent,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Leave History & Requests',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  if (_leaves.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40.0),
                      child: Center(
                        child: Text(
                          'No leave requests recorded.',
                          style: TextStyle(color: Colors.white54),
                        ),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _leaves.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final leave = _leaves[index];
                        Color statusColor;
                        switch (leave.status) {
                          case 'Approved':
                            statusColor = Colors.greenAccent;
                            break;
                          case 'Rejected':
                            statusColor = Colors.redAccent;
                            break;
                          default:
                            statusColor = Colors.amberAccent;
                        }

                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${leave.type} Leave',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: Colors.white,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      leave.status,
                                      style: TextStyle(
                                        color: statusColor,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${leave.start} to ${leave.end}',
                                style: const TextStyle(color: Colors.white70, fontSize: 14),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Reason: "${leave.reason}"',
                                style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                              ),
                              if (leave.decider.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(
                                  'Reviewed by: ${leave.decider}',
                                  style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12, fontStyle: FontStyle.italic),
                                ),
                              ]
                            ],
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openApplyLeaveForm,
        label: const Text('Apply Leave'),
        icon: const Icon(Icons.add),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildBalanceCard({required String title, required int count, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 14, color: Colors.white70, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Text(
            count.toString(),
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
          ),
          const SizedBox(height: 2),
          const Text(
            'Days Left',
            style: TextStyle(fontSize: 10, color: Colors.white38),
          ),
        ],
      ),
    );
  }
}

class ApplyLeaveModal extends StatefulWidget {
  final String empId;
  final VoidCallback onSuccess;
  const ApplyLeaveModal({super.key, required this.empId, required this.onSuccess});

  @override
  State<ApplyLeaveModal> createState() => _ApplyLeaveModalState();
}

class _ApplyLeaveModalState extends State<ApplyLeaveModal> {
  final ApiService _apiService = ApiService();
  final _formKey = GlobalKey<FormState>();
  String _leaveType = 'Casual';
  DateTime? _startDate;
  DateTime? _endDate;
  final TextEditingController _reasonController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _selectStartDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF6366F1),
              onPrimary: Colors.white,
              surface: Color(0xFF1E293B),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _startDate = picked;
        if (_endDate != null && _endDate!.isBefore(_startDate!)) {
          _endDate = null;
        }
      });
    }
  }

  Future<void> _selectEndDate(BuildContext context) async {
    if (_startDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a start date first.')),
      );
      return;
    }
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate!,
      firstDate: _startDate!,
      lastDate: _startDate!.add(const Duration(days: 30)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF6366F1),
              onPrimary: Colors.white,
              surface: Color(0xFF1E293B),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _endDate = picked;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _startDate == null || _endDate == null) {
      if (_startDate == null || _endDate == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select both start and end dates.')),
        );
      }
      return;
    }

    setState(() => _isSubmitting = true);

    final leave = Leave(
      id: 'L${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      empId: widget.empId,
      type: _leaveType,
      start: DateFormat('yyyy-MM-dd').format(_startDate!),
      end: DateFormat('yyyy-MM-dd').format(_endDate!),
      reason: _reasonController.text,
      status: 'Pending',
      appliedOn: DateFormat('yyyy-MM-dd').format(DateTime.now()),
      decider: '',
    );

    final success = await _apiService.submitLeave(leave);
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      widget.onSuccess();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to submit leave. Please check backend connection.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        left: 24,
        right: 24,
        top: 24,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Apply for Leave',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 20),
            DropdownButtonFormField<String>(
              value: _leaveType,
              dropdownColor: const Color(0xFF1E293B),
              style: const TextStyle(color: Colors.white, fontSize: 16),
              decoration: const InputDecoration(
                labelText: 'Leave Type',
                labelStyle: TextStyle(color: Colors.white60),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
              ),
              items: ['Annual', 'Casual', 'Medical'].map((type) {
                return DropdownMenuItem(value: type, child: Text(type));
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _leaveType = val);
              },
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => _selectStartDate(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: const BoxDecoration(
                        border: Border(bottom: BorderSide(color: Colors.white24)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Start Date', style: TextStyle(color: Colors.white60, fontSize: 12)),
                          const SizedBox(height: 6),
                          Text(
                            _startDate == null ? 'Select Date' : DateFormat('yyyy-MM-dd').format(_startDate!),
                            style: const TextStyle(color: Colors.white, fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: InkWell(
                    onTap: () => _selectEndDate(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: const BoxDecoration(
                        border: Border(bottom: BorderSide(color: Colors.white24)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('End Date', style: TextStyle(color: Colors.white60, fontSize: 12)),
                          const SizedBox(height: 6),
                          Text(
                            _endDate == null ? 'Select Date' : DateFormat('yyyy-MM-dd').format(_endDate!),
                            style: const TextStyle(color: Colors.white, fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _reasonController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Reason for Leave',
                labelStyle: TextStyle(color: Colors.white60),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF6366F1))),
              ),
              validator: (val) {
                if (val == null || val.trim().isEmpty) return 'Please state a reason.';
                return null;
              },
            ),
            const SizedBox(height: 36),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSubmitting
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Submit Application', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


// ==========================================================================
// 2. EXPENSE CLAIMS SCREEN
// ==========================================================================
class ExpenseClaimsScreen extends StatefulWidget {
  final String empId;
  const ExpenseClaimsScreen({super.key, required this.empId});

  @override
  State<ExpenseClaimsScreen> createState() => _ExpenseClaimsScreenState();
}

class _ExpenseClaimsScreenState extends State<ExpenseClaimsScreen> {
  final ApiService _apiService = ApiService();
  late List<Claim> _claims = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadClaims();
  }

  Future<void> _loadClaims() async {
    setState(() => _isLoading = true);
    final history = await _apiService.fetchClaims(widget.empId);
    if (!mounted) return;
    setState(() {
      _claims = history;
      _isLoading = false;
    });
  }

  void _openSubmitClaimForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => ApplyClaimModal(
        empId: widget.empId,
        onSuccess: () {
          Navigator.pop(context);
          _loadClaims();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Expense claim submitted successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Expense Claims'),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadClaims,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Reimbursement History',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  if (_claims.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40.0),
                      child: Center(
                        child: Text(
                          'No claim logs recorded.',
                          style: TextStyle(color: Colors.white54),
                        ),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _claims.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final claim = _claims[index];
                        Color statusColor;
                        switch (claim.status) {
                          case 'Approved':
                            statusColor = Colors.greenAccent;
                            break;
                          case 'Rejected':
                            statusColor = Colors.redAccent;
                            break;
                          default:
                            statusColor = Colors.amberAccent;
                        }

                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    claim.category,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: Colors.white,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      claim.status,
                                      style: TextStyle(
                                        color: statusColor,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'LKR ${claim.amount.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  color: Color(0xFF818CF8),
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Description: ${claim.desc}',
                                style: const TextStyle(color: Colors.white70, fontSize: 13),
                              ),
                              if (claim.receipt.isNotEmpty) ...[
                                const SizedBox(height: 12),
                                InkWell(
                                  onTap: () {
                                    showDialog(
                                      context: context,
                                      builder: (context) => Dialog(
                                        backgroundColor: Colors.transparent,
                                        child: Image.network(
                                          claim.receipt,
                                          fit: BoxFit.contain,
                                        ),
                                      ),
                                    );
                                  },
                                  child: Row(
                                    children: [
                                      const Icon(Icons.image, size: 16, color: Colors.blueAccent),
                                      const SizedBox(width: 6),
                                      Text(
                                        'View Receipt Attachment',
                                        style: TextStyle(color: Colors.blueAccent.shade100, fontSize: 12, decoration: TextDecoration.underline),
                                      ),
                                    ],
                                  ),
                                )
                              ]
                            ],
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openSubmitClaimForm,
        label: const Text('New Claim'),
        icon: const Icon(Icons.add),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
      ),
    );
  }
}

class ApplyClaimModal extends StatefulWidget {
  final String empId;
  final VoidCallback onSuccess;
  const ApplyClaimModal({super.key, required this.empId, required this.onSuccess});

  @override
  State<ApplyClaimModal> createState() => _ApplyClaimModalState();
}

class _ApplyClaimModalState extends State<ApplyClaimModal> {
  final ApiService _apiService = ApiService();
  final _formKey = GlobalKey<FormState>();
  String _category = 'Travel / Mileage';
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    final double amount = double.tryParse(_amountController.text) ?? 0.0;

    // Simulate choosing from preset receipts on unsplash
    final presets = [
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=250&h=350',
      'https://images.unsplash.com/photo-1534972195531-d756b9bda9f2?auto=format&fit=crop&q=80&w=250&h=350',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=250&h=350'
    ];
    final selectedReceipt = presets[DateTime.now().millisecond % presets.length];

    final claim = Claim(
      id: 'C${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      empId: widget.empId,
      category: _category,
      amount: amount,
      desc: _descController.text,
      receipt: selectedReceipt,
      status: 'Pending',
      decider: '',
    );

    final success = await _apiService.submitClaim(claim);
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      widget.onSuccess();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to submit claim. Please check backend connection.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        left: 24,
        right: 24,
        top: 24,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Submit Expense Claim',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 20),
            DropdownButtonFormField<String>(
              value: _category,
              dropdownColor: const Color(0xFF1E293B),
              style: const TextStyle(color: Colors.white, fontSize: 16),
              decoration: const InputDecoration(
                labelText: 'Claim Category',
                labelStyle: TextStyle(color: Colors.white60),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
              ),
              items: ['Travel / Mileage', 'Internet / Phone', 'Medical', 'Meals / Entertainment', 'Other'].map((cat) {
                return DropdownMenuItem(value: cat, child: Text(cat));
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _category = val);
              },
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Reimbursement Amount (LKR)',
                labelStyle: TextStyle(color: Colors.white60),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF6366F1))),
              ),
              validator: (val) {
                if (val == null || val.trim().isEmpty) return 'Please state the amount.';
                if (double.tryParse(val) == null || double.parse(val) <= 0) return 'Please enter a valid positive number.';
                return null;
              },
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _descController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Expense Description',
                labelStyle: TextStyle(color: Colors.white60),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF6366F1))),
              ),
              validator: (val) {
                if (val == null || val.trim().isEmpty) return 'Please enter description details.';
                return null;
              },
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.attach_file, size: 16, color: Colors.greenAccent),
                const SizedBox(width: 6),
                Text(
                  'Auto-Attached simulated photo receipt',
                  style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11),
                ),
              ],
            ),
            const SizedBox(height: 36),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSubmitting
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Submit Reimbursement', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


// ==========================================================================
// 3. PAYSLIPS SCREEN
// ==========================================================================
class PayslipsScreen extends StatefulWidget {
  final String empId;
  const PayslipsScreen({super.key, required this.empId});

  @override
  State<PayslipsScreen> createState() => _PayslipsScreenState();
}

class _PayslipsScreenState extends State<PayslipsScreen> {
  final ApiService _apiService = ApiService();
  late List<Payslip> _payslips = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPayslips();
  }

  Future<void> _loadPayslips() async {
    setState(() => _isLoading = true);
    final history = await _apiService.fetchPayslips(widget.empId);
    if (!mounted) return;
    setState(() {
      _payslips = history;
      _isLoading = false;
    });
  }

  void _openPayslipDetails(Payslip payslip) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => PayslipDetailsModal(payslip: payslip),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Monthly Payslips'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Your Generated Payslips',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  if (_payslips.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40.0),
                      child: Center(
                        child: Text(
                          'No generated payslips found.',
                          style: TextStyle(color: Colors.white54),
                        ),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _payslips.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final p = _payslips[index];
                        return InkWell(
                          onTap: () => _openPayslipDetails(p),
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.04),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withOpacity(0.08)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      p.month,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text('Net Salary paid', style: TextStyle(color: Colors.white38, fontSize: 12)),
                                  ],
                                ),
                                Row(
                                  children: [
                                    Text(
                                      'LKR ${p.net.toStringAsFixed(0)}',
                                      style: const TextStyle(
                                        color: Colors.greenAccent,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white30),
                                  ],
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
    );
  }
}

class PayslipDetailsModal extends StatelessWidget {
  final Payslip payslip;
  const PayslipDetailsModal({super.key, required this.payslip});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Payslip: ${payslip.month}',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white70),
                onPressed: () => Navigator.pop(context),
              )
            ],
          ),
          const Divider(color: Colors.white12, height: 24),
          _buildRow('Basic Salary', 'LKR ${payslip.basic.toStringAsFixed(2)}', Colors.white70),
          const SizedBox(height: 10),
          _buildRow('Allowances', 'LKR ${payslip.allowances.toStringAsFixed(2)}', Colors.white70),
          const SizedBox(height: 10),
          _buildRow('Deductions', '- LKR ${payslip.deductions.toStringAsFixed(2)}', Colors.redAccent),
          const SizedBox(height: 10),
          _buildRow('EPF Employee Contribution (8%)', '- LKR ${payslip.epfEmployee.toStringAsFixed(2)}', Colors.redAccent),
          const SizedBox(height: 10),
          _buildRow('Income Tax', '- LKR ${payslip.tax.toStringAsFixed(2)}', Colors.redAccent),
          const Divider(color: Colors.white24, height: 32),
          _buildRow('Net Salary Disbursed', 'LKR ${payslip.net.toStringAsFixed(2)}', Colors.greenAccent, isBold: true, large: true),
          const Divider(color: Colors.white24, height: 32),
          const Text('Employer Contributions (Not deducted from salary)', style: TextStyle(color: Colors.white38, fontSize: 11, fontStyle: FontStyle.italic)),
          const SizedBox(height: 12),
          _buildRow('EPF Employer (12%)', 'LKR ${payslip.epfEmployer.toStringAsFixed(2)}', Colors.white54),
          const SizedBox(height: 8),
          _buildRow('ETF Employer (3%)', 'LKR ${payslip.etfEmployer.toStringAsFixed(2)}', Colors.white54),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value, Color valueColor, {bool isBold = false, bool large = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 14)),
        Text(
          value,
          style: TextStyle(
            color: valueColor,
            fontSize: large ? 18 : 14,
            fontWeight: isBold || large ? FontWeight.bold : FontWeight.normal,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }
}


// ==========================================================================
// 4. KPIS SCREEN
// ==========================================================================
class KpisScreen extends StatefulWidget {
  final String empId;
  const KpisScreen({super.key, required this.empId});

  @override
  State<KpisScreen> createState() => _KpisScreenState();
}

class _KpisScreenState extends State<KpisScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _kpiData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadKpis();
  }

  Future<void> _loadKpis() async {
    setState(() => _isLoading = true);
    final data = await _apiService.fetchEmployeeKpi(widget.empId);
    if (!mounted) return;
    setState(() {
      _kpiData = data;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Appraisal & KPIs'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: _kpiData == null
                  ? const Padding(
                      padding: EdgeInsets.symmetric(vertical: 60.0),
                      child: Center(
                        child: Text(
                          'No appraisal targets registered for your profile yet.',
                          style: TextStyle(color: Colors.white54),
                        ),
                      ),
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const SizedBox(height: 12),
                        const Text(
                          'Primary Target',
                          style: TextStyle(fontSize: 14, color: Colors.white38, letterSpacing: 0.5),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _kpiData!['title'] ?? 'N/A',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 36),
                        // Premium Circular progress bar
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            SizedBox(
                              width: 160,
                              height: 160,
                              child: CircularProgressIndicator(
                                value: (_kpiData!['completion'] ?? 0) / 100,
                                strokeWidth: 12,
                                backgroundColor: Colors.white.withOpacity(0.05),
                                color: const Color(0xFF6366F1),
                              ),
                            ),
                            Column(
                              children: [
                                Text(
                                  '${_kpiData!['completion'] ?? 0}%',
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                const Text(
                                  'Completed',
                                  style: TextStyle(fontSize: 12, color: Colors.white54),
                                ),
                              ],
                            )
                          ],
                        ),
                        const SizedBox(height: 48),
                        // Ratings and feedback section
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Rating Score', style: TextStyle(color: Colors.white70, fontSize: 15)),
                                  Row(
                                    children: [
                                      const Icon(Icons.star, color: Colors.amber, size: 20),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${_kpiData!['score'] ?? 3.0} / 5.0',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const Divider(color: Colors.white10, height: 32),
                              const Text(
                                'Supervisor Feedback',
                                style: TextStyle(color: Colors.white54, fontSize: 13),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.02),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.white.withOpacity(0.04)),
                                ),
                                child: Text(
                                  _kpiData!['feedback'] ?? '"No feedback entered yet."',
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 14,
                                    height: 1.4,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              )
                            ],
                          ),
                        )
                      ],
                    ),
            ),
    );
  }
}
