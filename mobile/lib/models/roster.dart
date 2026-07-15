class Roster {
  final String id;
  final String empId;
  final String date;
  final String shiftStart;
  final String shiftEnd;

  Roster({
    required this.id,
    required this.empId,
    required this.date,
    required this.shiftStart,
    required this.shiftEnd,
  });

  factory Roster.fromJson(Map<String, dynamic> json) {
    return Roster(
      id: json['id'] ?? '',
      empId: json['emp_id'] ?? '',
      date: json['date'] ?? '',
      shiftStart: json['shift_start'] ?? '08:30',
      shiftEnd: json['shift_end'] ?? '17:30',
    );
  }
}
