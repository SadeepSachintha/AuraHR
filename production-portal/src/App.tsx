import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PulseDashboard } from './components/PulseDashboard';
import { EmployeesPage } from './components/EmployeesPage';
import { OperationsPage } from './components/OperationsPage';
import { API_SERVICE } from './services/api';
import type { Employee, Attendance, Leave, Claim, Project, Task } from './types';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [companyId, setCompanyId] = useState<string>('company_aura');
  const [isSaaSActive, setIsSaaSActive] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Entity States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Toast Notification State
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  // Toast helper
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // 1. Data Loader & Sync
  const loadData = async () => {
    const isOnline = await API_SERVICE.init(companyId);
    setIsSaaSActive(isOnline);

    const empList = await API_SERVICE.getEmployees(companyId);
    const attList = await API_SERVICE.getAttendance(companyId);
    const leaveList = await API_SERVICE.getLeaves(companyId);
    const claimList = await API_SERVICE.getClaims(companyId);
    const projList = await API_SERVICE.getProjects(companyId);
    const taskList = await API_SERVICE.getTasks(companyId);

    setEmployees(empList);
    setAttendance(attList);
    setLeaves(leaveList);
    setClaims(claimList);
    setProjects(projList);
    setTasks(taskList);
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // 2. Interactive Handlers
  const handleApproveLeave = async (leaveId: string) => {
    const leave = leaves.find(l => l.id === leaveId);
    if (!leave) return;

    const emp = employees.find(e => e.id === leave.emp_id);
    if (!emp) return;

    // Calculate leave length in days
    const start = new Date(leave.start);
    const end = new Date(leave.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Update balances
    const updatedBalances = { ...emp.leave_balances };
    if (updatedBalances[leave.type] !== undefined) {
      updatedBalances[leave.type] = Math.max(0, updatedBalances[leave.type] - diffDays);
    }

    const updatedEmp: Employee = {
      ...emp,
      leave_balances: updatedBalances
    };

    // Save updated leave
    const updatedLeave: Leave = {
      ...leave,
      status: 'Approved',
      decider: 'Samantha Perera'
    };

    await API_SERVICE.saveLeave(updatedLeave, companyId);
    await API_SERVICE.saveEmployee(updatedEmp, companyId);
    
    triggerToast(`Approved ${leave.type} leave for ${emp.name} (${diffDays} days). Balances updated.`, 'success');
    loadData();
  };

  const handleRejectLeave = async (leaveId: string) => {
    const leave = leaves.find(l => l.id === leaveId);
    if (!leave) return;

    const updatedLeave: Leave = {
      ...leave,
      status: 'Rejected',
      decider: 'Samantha Perera'
    };

    await API_SERVICE.saveLeave(updatedLeave, companyId);
    triggerToast(`Rejected leave request for employee ${leave.emp_id}.`, 'info');
    loadData();
  };

  const handleAddEmployee = async (newEmp: Employee) => {
    await API_SERVICE.saveEmployee(newEmp, companyId);
    triggerToast(`Added employee profile for ${newEmp.name} successfully.`, 'success');
    loadData();
  };

  const handleAddTask = async (newTask: Task) => {
    await API_SERVICE.saveTask(newTask, companyId);
    triggerToast(`Task "${newTask.title}" assigned successfully.`, 'success');
    loadData();
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      status: newStatus
    };

    await API_SERVICE.saveTask(updatedTask, companyId);
    
    // Recalculate project progress
    const projectTasks = tasks.map(t => t.id === taskId ? updatedTask : t).filter(t => t.project_id === task.project_id);
    const completedCount = projectTasks.filter(t => t.status === 'completed').length;
    const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;
    
    const proj = projects.find(p => p.id === task.project_id);
    if (proj) {
      const updatedProj: Project = {
        ...proj,
        progress,
        status: progress === 100 ? 'Completed' : 'Active'
      };
      await API_SERVICE.saveProject(updatedProj, companyId);
    }

    triggerToast(`Task moved to ${newStatus}.`, 'success');
    loadData();
  };

  const handleResetData = async () => {
    const confirmation = window.confirm("This will reset all current demo data to default configurations. Continue?");
    if (!confirmation) return;

    await API_SERVICE.resetData(companyId);
    triggerToast("Databases re-seeded successfully!", 'success');
    loadData();
  };

  // 3. Render content view based on tab
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <PulseDashboard
            employees={employees}
            attendance={attendance}
            leaves={leaves}
            tasks={tasks}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
          />
        );
      case 'employees':
        return (
          <EmployeesPage
            employees={employees}
            searchQuery={searchQuery}
            onAddEmployee={handleAddEmployee}
          />
        );
      case 'operations':
        return (
          <OperationsPage
            employees={employees}
            projects={projects}
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        );
      case 'leaves':
      case 'claims':
        return (
          <div className="glass-inner-card p-6 rounded-2xl border border-white/5 space-y-4 text-center">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Leave & Claims Log Archive</h3>
            <p className="text-gray-400 text-sm">
              Detailed records are synced and manageable from the Daily Pulse action panels and the employee directory cards.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-bgSpace rounded-xl text-xs font-bold transition-colors"
            >
              Return to Daily Pulse
            </button>
          </div>
        );
      default:
        return <div>View not found.</div>;
    }
  };

  return (
    <div className="min-h-screen p-4 flex gap-4 overflow-hidden relative">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingLeavesCount={leaves.filter(l => l.status === 'Pending').length}
        pendingClaimsCount={claims.filter(c => c.status === 'Pending').length}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Master Header */}
        <Header
          companyId={companyId}
          setCompanyId={setCompanyId}
          isSaaSActive={isSaaSActive}
          onResetData={handleResetData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Workspace content container */}
        <div className="flex gap-4 flex-1 h-[calc(100vh-7.5rem)] min-h-0">
          {/* Admin panel view */}
          <main className="flex-1 glass-panel rounded-2xl p-6 overflow-y-auto border border-white/5 shadow-glass relative">
            {renderView()}
          </main>
        </div>
      </div>

      {/* Interactive Toast Notifications */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel-glow border-cyan-500/30 px-5 py-3.5 rounded-2xl flex items-center gap-3.5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
          {toast.type === 'success' && <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />}
          {toast.type === 'error' && <AlertCircle className="text-red-400 shrink-0" size={18} />}
          {toast.type === 'info' && <Info className="text-cyan-400 shrink-0" size={18} />}
          <div className="text-xs text-gray-200 leading-snug">{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default App;
