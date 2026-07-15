import React, { useState } from 'react';
import { 
  UserPlus, 
  Building2, 
  Phone, 
  Mail, 
  CalendarDays,
  CalendarCheck,
  CalendarHeart,
  X
} from 'lucide-react';
import type { Employee } from '../types';

interface EmployeesPageProps {
  employees: Employee[];
  searchQuery: string;
  onAddEmployee: (emp: Employee) => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  employees,
  searchQuery,
  onAddEmployee
}) => {
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for Add Employee
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpSalary, setNewEmpSalary] = useState('100000');
  const [newEmpAllowance, setNewEmpAllowance] = useState('15000');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpEpf, setNewEmpEpf] = useState('');

  const departments = ['Engineering', 'Product', 'Human Resources', 'Marketing', 'Finance'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDept = deptFilter ? emp.dept === deptFilter : true;
    return matchesSearch && matchesDept;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId || !newEmpName || !newEmpEmail) return;

    const newEmp: Employee = {
      id: newEmpId,
      name: newEmpName,
      email: newEmpEmail,
      role: newEmpRole,
      dept: newEmpDept,
      salary: parseFloat(newEmpSalary) || 0,
      allowance: parseFloat(newEmpAllowance) || 0,
      phone: newEmpPhone || '+94 77 000 0000',
      epf_no: newEmpEpf || `EPF/2349/${newEmpId}`,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=100&h=100`,
      status: 'offline',
      leave_balances: { Annual: 12, Casual: 7, Medical: 10 }
    };

    onAddEmployee(newEmp);

    setNewEmpId('');
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpRole('');
    setNewEmpDept('Engineering');
    setNewEmpSalary('100000');
    setNewEmpAllowance('15000');
    setNewEmpPhone('');
    setNewEmpEpf('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">HR Employees Portal</h2>
          <p className="text-gray-400 text-sm mt-0.5">Manage directory details, roles, payroll base details, and leave records.</p>
        </div>
        <button
          onClick={() => {
            setNewEmpId(`EMP00${employees.length + 1}`);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 text-bgSpace px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-cyan-500/10 active:scale-95"
        >
          <UserPlus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Local Filter Bar */}
      <div className="glass-inner-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-white/5 shadow-md">
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <Building2 size={14} className="text-gray-400" />
          <span className="text-gray-400">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-transparent border-none text-white outline-none cursor-pointer font-sans text-xs"
          >
            <option value="" className="bg-[#121829] text-white">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d} className="bg-[#121829] text-white">{d}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredEmployees.length} of {employees.length} employees
        </span>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => setSelectedEmp(emp)}
            className="glass-inner-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300 cursor-pointer shadow-md group relative overflow-hidden"
          >
            <div className="absolute -inset-y-12 -inset-x-12 bg-cyan-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                    />
                    <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#121829] ${
                      emp.status === 'online' ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{emp.name}</h3>
                    <span className="text-[11px] text-gray-400">{emp.role}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md font-semibold text-gray-400">
                  {emp.id}
                </span>
              </div>

              {/* Quick Details */}
              <div className="space-y-1.5 text-xs text-gray-400 pl-1 font-medium">
                <div className="flex items-center gap-2">
                  <Building2 size={13} className="text-gray-500" />
                  <span>{emp.dept}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-500" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-gray-500" />
                  <span className="truncate max-w-[200px]">{emp.email}</span>
                </div>
              </div>
            </div>

            {/* Footer leave balances */}
            <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between text-[11px] text-cyan-400 font-semibold relative z-10">
              <span>Remaining Leaves:</span>
              <span className="bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                {Object.values(emp.leave_balances).reduce((a, b) => a + b, 0)} days
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Leave Management & Employee details */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

            <button
              onClick={() => setSelectedEmp(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
              <img
                src={selectedEmp.avatar}
                alt={selectedEmp.name}
                className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedEmp.name}</h3>
                <p className="text-xs text-cyan-400 font-semibold">{selectedEmp.role}</p>
                <p className="text-[10px] text-gray-400 mt-1">{selectedEmp.dept} • {selectedEmp.id}</p>
              </div>
            </div>

            {/* Leave Management Summary */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays size={14} className="text-cyan-400" />
                <span>Leave Balance Sheets</span>
              </h4>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                  <div className="flex justify-center text-cyan-400 mb-1.5"><CalendarCheck size={16} /></div>
                  <strong className="text-xl text-white block">{selectedEmp.leave_balances.Annual}</strong>
                  <span className="text-[9px] text-gray-400 font-medium">Annual Left</span>
                </div>
                
                <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                  <div className="flex justify-center text-orange-400 mb-1.5"><CalendarDays size={16} /></div>
                  <strong className="text-xl text-white block">{selectedEmp.leave_balances.Casual}</strong>
                  <span className="text-[9px] text-gray-400 font-medium">Casual Left</span>
                </div>

                <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                  <div className="flex justify-center text-emerald-400 mb-1.5"><CalendarHeart size={16} /></div>
                  <strong className="text-xl text-white block">{selectedEmp.leave_balances.Medical}</strong>
                  <span className="text-[9px] text-gray-400 font-medium">Medical Left</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Basic Salary:</span>
                  <span className="font-semibold text-white">LKR {selectedEmp.salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowances:</span>
                  <span className="font-semibold text-white">LKR {selectedEmp.allowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>EPF Registry No:</span>
                  <span className="font-semibold text-white">{selectedEmp.epf_no}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmp(null)}
              className="mt-6 w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Add Employee Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-lg w-full rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="text-cyan-400" size={20} />
              <span>Add Employee Profile</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    placeholder="EMP006"
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    placeholder="Sadeep Sachintha"
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    placeholder="sadeep@aurahr.io"
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Mobile Phone</label>
                  <input
                    type="text"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="+94 77 111 2222"
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Department</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    className="glass-input w-full text-xs bg-[#121829] cursor-pointer"
                  >
                    {departments.map(d => (
                      <option key={d} value={d} className="bg-[#121829] text-white">{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Role / Designation</label>
                  <input
                    type="text"
                    required
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    placeholder="Senior Developer"
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Basic Salary (LKR)</label>
                  <input
                    type="number"
                    value={newEmpSalary}
                    onChange={(e) => setNewEmpSalary(e.target.value)}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Allowance (LKR)</label>
                  <input
                    type="number"
                    value={newEmpAllowance}
                    onChange={(e) => setNewEmpAllowance(e.target.value)}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">EPF Registry No</label>
                  <input
                    type="text"
                    value={newEmpEpf}
                    onChange={(e) => setNewEmpEpf(e.target.value)}
                    placeholder="EPF/2349/E06"
                    className="glass-input w-full text-xs"
                  />
                </div>
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
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
