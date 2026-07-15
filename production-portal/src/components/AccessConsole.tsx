import React, { useState } from 'react';
import { Shield, UserCheck, ShieldCheck, Mail, ShieldAlert, Plus, Search, Trash2 } from 'lucide-react';

interface AdminOperator {
  id: string;
  email: string;
  role: 'Super Admin' | 'Department Manager' | 'HR Specialist';
  tenant: string;
  lastActive: string;
}

const INITIAL_OPERATORS: AdminOperator[] = [
  { id: '1', email: 'admin@aurahr.io', role: 'Super Admin', tenant: 'Aura Corporates', lastActive: 'Active Just Now' },
  { id: '2', email: 'director@techcorp.com', role: 'Super Admin', tenant: 'TechCorp Global', lastActive: '10 mins ago' },
  { id: '3', email: 'manager@techcorp.com', role: 'Department Manager', tenant: 'TechCorp Global', lastActive: '2 hours ago' },
  { id: '4', email: 'specialist@retailhub.lk', role: 'HR Specialist', tenant: 'RetailHub LK', lastActive: 'Yesterday' }
];

export const AccessConsole: React.FC = () => {
  const [operators, setOperators] = useState<AdminOperator[]>(INITIAL_OPERATORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Super Admin' | 'Department Manager' | 'HR Specialist'>('HR Specialist');
  const [newTenant, setNewTenant] = useState('Aura Corporates');

  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const newOp: AdminOperator = {
      id: Date.now().toString(),
      email: newEmail.trim(),
      role: newRole,
      tenant: newTenant,
      lastActive: 'Never'
    };

    setOperators(prev => [...prev, newOp]);
    setNewEmail('');
  };

  const handleRoleChange = (id: string, role: 'Super Admin' | 'Department Manager' | 'HR Specialist') => {
    setOperators(prev =>
      prev.map(op => (op.id === id ? { ...op, role } : op))
    );
  };

  const handleDeleteOperator = (id: string) => {
    if (id === '1') {
      alert("Cannot delete primary root super administrator.");
      return;
    }
    setOperators(prev => prev.filter(op => op.id !== id));
  };

  const filteredOperators = operators.filter(op =>
    op.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.tenant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Shield className="text-cyan-400" size={26} />
          <span>RBAC Access Control Console</span>
        </h2>
        <p className="text-gray-400 text-sm mt-0.5">
          Manage system administrators, invite new operator accounts, and allocate security permission tiers.
        </p>
      </div>

      {/* Main Grid: Operators Table & Invite Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Operators List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-inner-card rounded-2xl border border-white/5 p-5 shadow-lg space-y-4">
            
            {/* Search filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search administrators, roles, or client tenants..."
                className="glass-input w-full pl-10 text-xs py-2.5"
              />
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-white/5 pb-2 text-[10px] uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Admin Profile / Operator</th>
                    <th className="pb-3">Client Tenant</th>
                    <th className="pb-3">Access Tier Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {filteredOperators.map(op => (
                    <tr key={op.id} className="hover:bg-white/2">
                      {/* Name / email */}
                      <td className="py-4 pl-2 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          {op.role === 'Super Admin' && <ShieldCheck size={16} />}
                          {op.role === 'Department Manager' && <ShieldAlert size={16} />}
                          {op.role === 'HR Specialist' && <UserCheck size={16} />}
                        </div>
                        <span className="font-semibold text-white">{op.email}</span>
                      </td>

                      {/* Client Tenant */}
                      <td className="py-4 text-gray-300 font-medium">{op.tenant}</td>

                      {/* Access Tier dropdown switcher */}
                      <td className="py-4">
                        <select
                          value={op.role}
                          disabled={op.id === '1'}
                          onChange={e => handleRoleChange(op.id, e.target.value as any)}
                          className="bg-[#121829] border border-white/5 text-xs text-white rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-white/10"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Department Manager">Dept Manager</option>
                          <option value="HR Specialist">HR Specialist</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-4 text-gray-400">{op.lastActive}</td>

                      {/* Actions */}
                      <td className="py-4 pr-2 text-right">
                        <button
                          onClick={() => handleDeleteOperator(op.id)}
                          disabled={op.id === '1'}
                          className="text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors p-1"
                          title="Revoke Admin Access"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Invite Form */}
        <div className="space-y-4">
          <div className="glass-inner-card rounded-2xl border border-white/5 p-5 shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Invite Admin Operator</h3>
              <p className="text-gray-400 text-xs mt-0.5">Authorise a new administrative user to manage logs.</p>
            </div>

            <form onSubmit={handleAddOperator} className="space-y-4 text-xs">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-gray-400 font-semibold pl-0.5">Operator Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="user@corporate.com"
                    className="glass-input w-full pl-9 text-xs py-2"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-gray-400 font-semibold pl-0.5">Access Tier</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full bg-[#121829] border border-white/5 text-xs text-white rounded-xl p-2.5 outline-none cursor-pointer"
                >
                  <option value="Super Admin">Super Admin (Global access)</option>
                  <option value="Department Manager">Department Manager (Engineering only)</option>
                  <option value="HR Specialist">HR Specialist (Payroll & Claims read-only)</option>
                </select>
              </div>

              {/* Tenant Selection */}
              <div className="space-y-1.5">
                <label className="text-gray-400 font-semibold pl-0.5">Client Tenant Context</label>
                <select
                  value={newTenant}
                  onChange={e => setNewTenant(e.target.value)}
                  className="w-full bg-[#121829] border border-white/5 text-xs text-white rounded-xl p-2.5 outline-none cursor-pointer"
                >
                  <option value="Aura Corporates">Aura Corporates</option>
                  <option value="TechCorp Global">TechCorp Global</option>
                  <option value="RetailHub LK">RetailHub LK</option>
                </select>
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-bgSpace font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                <span>Invite Operator</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
