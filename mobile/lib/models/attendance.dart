class Attendance {
  final int? id;
  final String empId;
  final String date;
  final String clockIn;
  final String clockOut;
  final double hours;
  final String location;
  final String device;
  final double? latitude;
  final double? longitude;

  Attendance({
    this.id,
    required this.empId,
    required this.date,
    required this.clockIn,
    required this.clockOut,
    required this.hours,
    required this.location,
    required this.device,
    this.latitude,
    this.longitude,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['id'],
      empId: json['emp_id'] ?? '',
      date: json['date'] ?? '',
      clockIn: json['clock_in'] ?? '',
      clockOut: json['clock_out'] ?? '',
      hours: double.parse((json['hours'] ?? 0).toString()),
      location: json['location'] ?? '',
      device: json['device'] ?? 'Mobile App',
      latitude: json['latitude'] != null ? double.parse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.parse(json['longitude'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'emp_id': empId,
      'date': date,
      'clock_in': clockIn,
      'clock_out': clockOut,
      'hours': hours,
      'location': location,
      'device': device,
    };
    if (id != null) data['id'] = id;
    if (latitude != null) data['latitude'] = latitude;
    if (longitude != null) data['longitude'] = longitude;
    return data;
  }
}
