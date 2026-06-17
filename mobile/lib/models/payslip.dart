class Payslip {
  final String id;
  final String empId;
  final String month;
  final double basic;
  final double allowances;
  final double deductions;
  final double epfEmployee;
  final double tax;
  final double net;
  final double epfEmployer;
  final double etfEmployer;

  Payslip({
    required this.id,
    required this.empId,
    required this.month,
    required this.basic,
    required this.allowances,
    required this.deductions,
    required this.epfEmployee,
    required this.tax,
    required this.net,
    required this.epfEmployer,
    required this.etfEmployer,
  });

  factory Payslip.fromJson(Map<String, dynamic> json) {
    return Payslip(
      id: json['id'] ?? '',
      empId: json['emp_id'] ?? '',
      month: json['month'] ?? '',
      basic: double.parse((json['basic'] ?? 0).toString()),
      allowances: double.parse((json['allowances'] ?? json['allowance'] ?? 0).toString()),
      deductions: double.parse((json['deductions'] ?? 0).toString()),
      epfEmployee: double.parse((json['epf_employee'] ?? 0).toString()),
      tax: double.parse((json['tax'] ?? 0).toString()),
      net: double.parse((json['net'] ?? 0).toString()),
      epfEmployer: double.parse((json['epf_employer'] ?? 0).toString()),
      etfEmployer: double.parse((json['etf_employer'] ?? 0).toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'emp_id': empId,
      'month': month,
      'basic': basic,
      'allowances': allowances,
      'deductions': deductions,
      'epf_employee': epfEmployee,
      'tax': tax,
      'net': net,
      'epf_employer': epfEmployer,
      'etf_employer': etfEmployer,
    };
  }
}
