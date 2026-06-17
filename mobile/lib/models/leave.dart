class Leave {
  final String id;
  final String empId;
  final String type;
  final String start;
  final String end;
  final String reason;
  final String status;
  final String appliedOn;
  final String decider;

  Leave({
    required this.id,
    required this.empId,
    required this.type,
    required this.start,
    required this.end,
    required this.reason,
    required this.status,
    required this.appliedOn,
    required this.decider,
  });

  factory Leave.fromJson(Map<String, dynamic> json) {
    return Leave(
      id: json['id'] ?? '',
      empId: json['emp_id'] ?? '',
      type: json['type'] ?? '',
      start: json['start'] ?? '',
      end: json['end'] ?? '',
      reason: json['reason'] ?? '',
      status: json['status'] ?? 'Pending',
      appliedOn: json['applied_on'] ?? '',
      decider: json['decider'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'emp_id': empId,
      'type': type,
      'start': start,
      'end': end,
      'reason': reason,
      'status': status,
      'applied_on': appliedOn,
      'decider': decider,
    };
  }
}
