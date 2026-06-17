class Claim {
  final String id;
  final String empId;
  final String category;
  final double amount;
  final String desc;
  final String receipt;
  final String status;
  final String decider;

  Claim({
    required this.id,
    required this.empId,
    required this.category,
    required this.amount,
    required this.desc,
    required this.receipt,
    required this.status,
    required this.decider,
  });

  factory Claim.fromJson(Map<String, dynamic> json) {
    return Claim(
      id: json['id'] ?? '',
      empId: json['emp_id'] ?? '',
      category: json['category'] ?? '',
      amount: double.parse((json['amount'] ?? 0).toString()),
      desc: json['description'] ?? json['desc'] ?? '',
      receipt: json['receipt'] ?? '',
      status: json['status'] ?? 'Pending',
      decider: json['decider'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'emp_id': empId,
      'category': category,
      'amount': amount,
      'description': desc,
      'receipt': receipt,
      'status': status,
      'decider': decider,
    };
  }
}
