class Employee {
  final String id;
  final String name;
  final String email;
  final String role;
  final String dept;
  final double salary;
  final double allowance;
  final String phone;
  final String epfNo;
  final String avatar;
  final String status;
  final Map<String, int> leaveBalances;

  Employee({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.dept,
    required this.salary,
    required this.allowance,
    required this.phone,
    required this.epfNo,
    required this.avatar,
    required this.status,
    required this.leaveBalances,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      dept: json['dept'] ?? '',
      salary: double.parse((json['salary'] ?? 0).toString()),
      allowance: double.parse((json['allowance'] ?? 0).toString()),
      phone: json['phone'] ?? '',
      epfNo: json['epf_no'] ?? '',
      avatar: json['avatar'] ?? '',
      status: json['status'] ?? 'offline',
      leaveBalances: Map<String, int>.from(json['leave_balances'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'dept': dept,
      'salary': salary,
      'allowance': allowance,
      'phone': phone,
      'epf_no': epfNo,
      'avatar': avatar,
      'status': status,
      'leave_balances': leaveBalances,
    };
  }
}
