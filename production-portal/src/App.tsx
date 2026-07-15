import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PulseDashboard } from './components/PulseDashboard';
import { EmployeesPage } from './components/EmployeesPage';
import { OperationsPage } from './components/OperationsPage';
import { AccessConsole } from './components/AccessConsole';
import { AuditTrail } from './components/AuditTrail';
import { ExportCenter } from './components/ExportCenter';
import { ShiftPlanner } from './components/ShiftPlanner';
import { OrgChart } from './components/OrgChart';
import { LoginPage } from './components/LoginPage';
import { supabase } from './services/supabase';
import { API_SERVICE } from './services/api';
import type { Employee, Attendance, Leave, Claim, Project, Task, AuditLog, Roster } from './types';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Department Manager' | 'HR Specialist'>('Super Admin');
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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);

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

    let empList = await API_SERVICE.getEmployees(companyId);
    let attList = await API_SERVICE.getAttendance(companyId);
    let leaveList = await API_SERVICE.getLeaves(companyId);
    let claimList = await API_SERVICE.getClaims(companyId);
    let projList = await API_SERVICE.getProjects(companyId);
    let taskList = await API_SERVICE.getTasks(companyId);
    let logsList = await API_SERVICE.getAuditLogs(companyId);
    let rosterList = await API_SERVICE.getRosters(companyId);

    // Apply RBAC filters for Department Manager (Engineering only, masked salaries)
    if (adminRole === 'Department Manager') {
      empList = empList.filter(e => e.dept === 'Engineering').map(e => ({
        ...e,
        salary: 0,
        allowance: 0,
        epf_no: 'MASKED'
      }));
      
      const engineeringEmpIds = new Set(empList.map(e => e.id));
      
      attList = attList.filter(a => engineeringEmpIds.has(a.emp_id));
      leaveList = leaveList.filter(l => engineeringEmpIds.has(l.emp_id));
      claimList = claimList.filter(c => engineeringEmpIds.has(c.emp_id));
      taskList = taskList.filter(t => engineeringEmpIds.has(t.emp_id));
      rosterList = rosterList.filter(r => engineeringEmpIds.has(r.emp_id));
    }

    setEmployees(empList);
    setAttendance(attList);
    setLeaves(leaveList);
    setClaims(claimList);
    setProjects(projList);
    setTasks(taskList);
    setAuditLogs(logsList);
    setRosters(rosterList);
  };

  const determineTenant = (email: string) => {
    if (email.includes('manager@')) {
      setAdminRole('Department Manager');
      setCompanyId('company_techcorp');
    } else if (email.includes('specialist@')) {
      setAdminRole('HR Specialist');
      setCompanyId('company_retailhub');
    } else {
      setAdminRole('Super Admin');
      if (email.includes('@techcorp.')) {
        setCompanyId('company_techcorp');
      } else if (email.includes('@retailhub.')) {
        setCompanyId('company_retailhub');
      } else {
        setCompanyId('company_aura');
      }
    }
  };

  const logAdminAction = async (actionType: string, details: string) => {
    const newLog: AuditLog = {
      timestamp: new Date().toISOString(),
      operator: userEmail || 'admin@aurahr.io',
      action_type: actionType,
      details: details,
      ip_address: '112.134.4.15'
    };
    await API_SERVICE.saveAuditLog(newLog, companyId);
    const updated = await API_SERVICE.getAuditLogs(companyId);
    setAuditLogs(updated);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || 'admin@aurahr.io';
        setUserEmail(email);
        determineTenant(email);
        
        // Log sign-in once
        const startupLog: AuditLog = {
          timestamp: new Date().toISOString(),
          operator: email,
          action_type: 'Security',
          details: `Session authenticated successfully for admin: ${email}`,
          ip_address: '112.134.4.15'
        };
        const scopeId = email.includes('manager@') ? 'company_techcorp' : email.includes('specialist@') ? 'company_retailhub' : 'company_aura';
        API_SERVICE.saveAuditLog(startupLog, scopeId);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || 'admin@aurahr.io';
        setUserEmail(email);
        determineTenant(email);
      } else {
        setUserEmail(null);
        setAdminRole('Super Admin');
        setCompanyId('company_aura');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userEmail) {
      loadData();
    }
  }, [companyId, userEmail]);

  // 2. Interactive Handlers
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    triggerToast("Signed out of administrative console.", 'info');
  };
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
    await logAdminAction('Leave', `Approved ${leave.type} leave for ${emp.name} (${diffDays} days). Balances updated.`);
    
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
    await logAdminAction('Leave', `Rejected leave request for employee ${leave.emp_id}.`);
    
    triggerToast(`Rejected leave request for employee ${leave.emp_id}.`, 'info');
    loadData();
  };

  const handleAddEmployee = async (newEmp: Employee) => {
    await API_SERVICE.saveEmployee(newEmp, companyId);
    await logAdminAction('Employee', `Created employee profile for ${newEmp.name} (ID: ${newEmp.id})`);
    
    triggerToast(`Added employee profile for ${newEmp.name} successfully.`, 'success');
    loadData();
  };

  const handleAddTask = async (newTask: Task) => {
    await API_SERVICE.saveTask(newTask, companyId);
    await logAdminAction('System', `Assigned task "${newTask.title}" to employee ${newTask.emp_id}`);
    
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

    await logAdminAction('System', `Moved task status for "${task.title}" to: ${newStatus}`);
    triggerToast(`Task moved to ${newStatus}.`, 'success');
    loadData();
  };

  const handleResetData = async () => {
    const confirmation = window.confirm("This will reset all current demo data to default configurations. Continue?");
    if (!confirmation) return;

    await API_SERVICE.resetData(companyId);
    await logAdminAction('System', 'Re-seeded database template back to original clean config states.');
    
    triggerToast("Databases re-seeded successfully!", 'success');
    loadData();
  };

  const handleAssignRoster = async (newRoster: Roster) => {
    await API_SERVICE.saveRoster(newRoster, companyId);
    
    const emp = employees.find(e => e.id === newRoster.emp_id);
    const empName = emp ? emp.name : newRoster.emp_id;
    await logAdminAction('System', `Assigned duty shift roster for ${empName} on date ${newRoster.date} (${newRoster.shift_start}-${newRoster.shift_end}).`);

    triggerToast(`Assigned shift roster for ${empName} successfully.`, 'success');
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
      case 'access-control':
        return <AccessConsole />;
      case 'audit-trail':
        return <AuditTrail logs={auditLogs} />;
      case 'export-center':
        return <ExportCenter employees={employees} attendance={attendance} leaves={leaves} />;
      case 'shift-planner':
        return <ShiftPlanner employees={employees} attendance={attendance} rosters={rosters} onAddRoster={handleAssignRoster} />;
      case 'org-chart':
        return <OrgChart employees={employees} />;
      default:
        return <div>View not found.</div>;
    }
  };

  if (!userEmail) {
    return <LoginPage onLoginSuccess={(email) => setUserEmail(email)} />;
  }

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
        adminRole={adminRole}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Master Header */}
        <Header
          companyId={companyId}
          isSaaSActive={isSaaSActive}
          onResetData={handleResetData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          adminRole={adminRole}
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
