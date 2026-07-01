import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/task.dart';

class TasksScreen extends StatefulWidget {
  final String empId;
  const TasksScreen({super.key, required this.empId});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;
  List<Task> _tasks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadTasks();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadTasks() async {
    setState(() => _isLoading = true);
    final tasksList = await _apiService.fetchTasks(widget.empId);
    setState(() {
      _tasks = tasksList;
      _isLoading = false;
    });
  }

  Future<void> _changeStatus(Task task, String newStatus) async {
    final success = await _apiService.updateTaskStatus(task, newStatus);
    if (success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Task status moved to "$newStatus"'),
          backgroundColor: Colors.indigo,
        ),
      );
      _loadTasks();
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to update task status.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  bool _checkIsOverdue(String dateStr) {
    if (dateStr.isEmpty) return false;
    try {
      final dueDate = DateTime.parse(dateStr);
      final today = DateTime.now();
      // Compare only date parts
      final todayDate = DateTime(today.year, today.month, today.day);
      return dueDate.isBefore(todayDate);
    } catch (e) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Filter lists
    final todoTasks = _tasks.where((t) => t.status == 'todo').toList();
    final inProgressTasks = _tasks.where((t) => t.status == 'in-progress' || t.status == 'progress').toList();
    final completedTasks = _tasks.where((t) => t.status == 'completed').toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('My Tasks'),
        backgroundColor: const Color(0xFF1E293B),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF6366F1),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: [
            Tab(text: 'To-Do (${todoTasks.length})'),
            Tab(text: 'In-Progress (${inProgressTasks.length})'),
            Tab(text: 'Completed (${completedTasks.length})'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTasks,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildTaskList(todoTasks, 'todo'),
                _buildTaskList(inProgressTasks, 'in-progress'),
                _buildTaskList(completedTasks, 'completed'),
              ],
            ),
    );
  }

  Widget _buildTaskList(List<Task> tasksList, String listType) {
    if (tasksList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              listType == 'completed' ? Icons.check_circle_outline : Icons.playlist_add_check,
              size: 64,
              color: Colors.white24,
            ),
            const SizedBox(height: 16),
            Text(
              'No tasks in this list.',
              style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 16),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: tasksList.length,
      itemBuilder: (context, index) {
        final task = tasksList[index];
        final isOverdue = listType != 'completed' && _checkIsOverdue(task.dueDate);

        return Card(
          color: const Color(0xFF1E293B),
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: isOverdue ? Colors.redAccent.withOpacity(0.3) : Colors.white.withOpacity(0.05),
              width: 1.5,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        task.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    if (isOverdue)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.redAccent.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Overdue',
                          style: TextStyle(
                            color: Colors.redAccent,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 14,
                      color: isOverdue ? Colors.redAccent : Colors.white60,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Due Date: ${task.dueDate}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isOverdue ? Colors.redAccent : Colors.white60,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (listType == 'todo')
                      ElevatedButton.icon(
                        onPressed: () => _changeStatus(task, 'in-progress'),
                        icon: const Icon(Icons.play_arrow, size: 16),
                        label: const Text('Start Task'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6366F1),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    if (listType == 'in-progress')
                      ElevatedButton.icon(
                        onPressed: () => _changeStatus(task, 'completed'),
                        icon: const Icon(Icons.check, size: 16),
                        label: const Text('Complete Task'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    if (listType == 'completed')
                      Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.green.shade400, size: 16),
                          const SizedBox(width: 6),
                          const Text(
                            'Completed',
                            style: TextStyle(color: Colors.greenAccent, fontSize: 13),
                          ),
                        ],
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
