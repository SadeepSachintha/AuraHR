import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  User,
  X,
  FileSpreadsheet
} from 'lucide-react';
import type { Employee, Project, Task } from '../types';

interface OperationsPageProps {
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => void;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({
  employees,
  projects,
  tasks,
  onAddTask,
  onUpdateTaskStatus
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [dueDate, setDueDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const columns = [
    { id: 'todo', name: 'To-Do', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400' },
    { id: 'in-progress', name: 'In-Progress', color: 'border-orange-500/20 bg-orange-500/5 text-orange-400' },
    { id: 'completed', name: 'Completed', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' }
  ] as const;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !selectedProject || !selectedEmp || !dueDate) return;

    const newTask: Task = {
      id: `T-${Date.now().toString().slice(-4)}`,
      project_id: selectedProject,
      emp_id: selectedEmp,
      title: taskTitle,
      status: 'todo',
      due_date: dueDate
    };

    onAddTask(newTask);
    
    setTaskTitle('');
    setSelectedProject('');
    setSelectedEmp('');
    setDueDate('');
    setShowAddModal(false);
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'completed') return false;
    return new Date(task.due_date) < new Date(todayStr);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Operations & Task Board</h2>
          <p className="text-gray-400 text-sm mt-0.5">Manage deliverables, trace milestones, and distribute daily duties.</p>
        </div>
        <button
          onClick={() => {
            if (projects.length > 0) setSelectedProject(projects[0].id);
            if (employees.length > 0) setSelectedEmp(employees[0].id);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDueDate(tomorrow.toISOString().split('T')[0]);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 text-bgSpace px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Projects Progress Section */}
      <div className="glass-inner-card p-5 rounded-2xl border border-white/5 shadow-md">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-cyan-400" />
          <span>Active Projects Milestone Progress</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">{proj.name}</h4>
                  <span className="text-[10px] text-gray-500">ID: {proj.id}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-semibold border ${
                  proj.status === 'Completed' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : proj.status === 'On Hold' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}>
                  {proj.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                  <span>Milestone progress</span>
                  <span>{proj.progress}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                <Clock size={12} className="text-gray-500 shrink-0" />
                <span>Deadline: {proj.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="glass-inner-card rounded-2xl p-4 border border-white/5 flex flex-col h-[520px] shadow-lg">
              <div className={`border-b pb-3 mb-4 flex items-center justify-between border-white/5`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    col.id === 'todo' ? 'bg-blue-400' : col.id === 'in-progress' ? 'bg-orange-400' : 'bg-emerald-400'
                  }`}></span>
                  <h4 className="font-bold text-sm text-white uppercase tracking-wider">{col.name}</h4>
                </div>
                <span className="text-xs bg-white/5 text-gray-400 font-semibold px-2 py-0.5 rounded-md">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 text-xs italic py-10 border border-dashed border-white/5 rounded-xl">
                    No tasks in this list.
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const emp = employees.find(e => e.id === task.emp_id);
                    const proj = projects.find(p => p.id === task.project_id);
                    const overdue = isOverdue(task);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`bg-white/25 border p-3.5 rounded-xl space-y-3 hover:border-cyan-500/20 transition-all shadow-md group ${
                          overdue ? 'border-red-500/30' : 'border-white/5'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {proj?.name || 'Aura Project'}
                          </span>
                          <h5 className="text-xs font-bold text-white leading-snug pt-1 group-hover:text-cyan-400 transition-colors">
                            {task.title}
                          </h5>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            {emp ? (
                              <img
                                src={emp.avatar}
                                alt={emp.name}
                                className="h-6 w-6 rounded-full border border-white/10 object-cover"
                                title={`Assigned to ${emp.name}`}
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/10">
                                <User size={12} />
                              </div>
                            )}
                            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[80px]">
                              {emp?.name.split(' ')[0]}
                            </span>
                          </div>

                          <div className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                            overdue 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' 
                              : 'bg-white/5 text-gray-400'
                          }`}>
                            <Calendar size={10} />
                            <span>{task.due_date}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-[10px] text-gray-500">
                          <span className="font-semibold text-[9px]">Move:</span>
                          <div className="flex items-center gap-1">
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, col.id === 'completed' ? 'in-progress' : 'todo')}
                                className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 hover:text-white rounded border border-white/5 font-semibold text-[9px] transition-colors"
                              >
                                &larr; Back
                              </button>
                            )}
                            {col.id !== 'completed' && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, col.id === 'todo' ? 'in-progress' : 'completed')}
                                className="px-1.5 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/25 font-semibold text-[9px] transition-colors"
                              >
                                Next &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Create New Task */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-cyan-400" size={20} />
              <span>Create Task Deliverable</span>
            </h3>

            <form onSubmit={handleTaskSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Task Title / Specification</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Audit payroll allowance compliance"
                  className="glass-input w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Select Project Track</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="glass-input w-full text-xs bg-[#121829] cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#121829] text-white">{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Assign Employee</label>
                <select
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  className="glass-input w-full text-xs bg-[#121829] cursor-pointer"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id} className="bg-[#121829] text-white">{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="glass-input w-full text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-bgSpace rounded-xl text-xs font-semibold hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
