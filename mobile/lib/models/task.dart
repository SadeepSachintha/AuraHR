class Task {
  final String id;
  final String projectId;
  final String empId;
  final String title;
  final String status; // 'todo', 'in-progress', 'completed'
  final String dueDate;

  Task({
    required this.id,
    required this.projectId,
    required this.empId,
    required this.title,
    required this.status,
    required this.dueDate,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] ?? '',
      projectId: json['project_id'] ?? '',
      empId: json['emp_id'] ?? '',
      title: json['title'] ?? '',
      status: json['status'] ?? 'todo',
      dueDate: json['due_date'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'project_id': projectId,
      'emp_id': empId,
      'title': title,
      'status': status,
      'due_date': dueDate,
    };
  }
}
