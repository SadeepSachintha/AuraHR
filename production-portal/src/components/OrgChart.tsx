import React, { useState } from 'react';
import { Network, ChevronDown, ChevronRight, Mail, Phone, Shield, Briefcase, Zap } from 'lucide-react';
import type { Employee } from '../types';

interface OrgChartProps {
  employees: Employee[];
}

export const OrgChart: React.FC<OrgChartProps> = ({ employees }) => {
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Group employees by hierarchy levels
  const director = employees.find(e => e.role.toLowerCase().includes('director') || e.role.toLowerCase().includes('ceo')) || employees[0];
  
  const managers = employees.filter(e => 
    e.id !== director?.id && 
    (e.role.toLowerCase().includes('manager') || e.role.toLowerCase().includes('lead'))
  );

  const staff = employees.filter(e => 
    e.id !== director?.id && 
    !managers.some(m => m.id === e.id)
  );

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDirectReports = (manager: Employee) => {
    // Map staff into their department matching manager
    return staff.filter(s => s.dept === manager.dept);
  };

  return (
    <div className="space-y-6 font-sans relative">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Network className="text-cyan-400" size={26} />
          <span>Dynamic Org Chart</span>
        </h2>
        <p className="text-gray-400 text-sm mt-0.5">
          Interactive reporting structures showing active directories, roles, and status indicators.
        </p>
      </div>

      {/* Main Hierarchy Container */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Tree Visualizer */}
        <div className="flex-1 w-full glass-inner-card rounded-2xl border border-white/5 p-6 overflow-x-auto min-h-[500px] flex flex-col items-center justify-start space-y-8 select-none">
          
          {/* Level 1: CEO / Director */}
          {director && (
            <div className="flex flex-col items-center relative">
              <div 
                onClick={() => setSelectedEmp(director)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-center min-w-[200px] relative ${
                  selectedEmp?.id === director.id 
                    ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'bg-[#121829]/60 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Status indicator */}
                <span className={`absolute top-2.5 right-2.5 h-2 w-2 rounded-full ${director.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                <div className="h-10 w-10 bg-cyan-500/10 rounded-full border border-cyan-500/20 flex items-center justify-center mx-auto mb-2 text-cyan-400 font-bold uppercase">
                  {director.name.substring(0, 2)}
                </div>
                <div className="font-bold text-xs text-white leading-normal">{director.name}</div>
                <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">{director.role}</div>
                <div className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">{director.dept}</div>
              </div>

              {/* Connector line down to Level 2 */}
              {managers.length > 0 && (
                <div className="w-[1.5px] h-8 bg-gradient-to-b from-cyan-500/30 to-white/5" />
              )}
            </div>
          )}

          {/* Level 2: Managers */}
          <div className="flex flex-wrap justify-center gap-8 relative w-full">
            {managers.map(manager => {
              const reports = getDirectReports(manager);
              const isCollapsed = collapsedNodes[manager.id];
              const isSelected = selectedEmp?.id === manager.id;

              return (
                <div key={manager.id} className="flex flex-col items-center relative">
                  {/* Card Node */}
                  <div 
                    onClick={() => setSelectedEmp(manager)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-center min-w-[200px] relative ${
                      isSelected 
                        ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-[#121829]/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className={`absolute top-2.5 right-2.5 h-2 w-2 rounded-full ${manager.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                    <div className="h-10 w-10 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center justify-center mx-auto mb-2 text-blue-400 font-bold uppercase">
                      {manager.name.substring(0, 2)}
                    </div>
                    <div className="font-bold text-xs text-white leading-normal">{manager.name}</div>
                    <div className="text-[10px] text-blue-400 font-semibold mt-0.5">{manager.role}</div>
                    <div className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">{manager.dept}</div>

                    {/* Expand/Collapse reports trigger */}
                    {reports.length > 0 && (
                      <button
                        onClick={(e) => toggleCollapse(manager.id, e)}
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-5 w-5 bg-[#121829] hover:bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                      </button>
                    )}
                  </div>

                  {/* Connector lines down to Level 3 */}
                  {reports.length > 0 && !isCollapsed && (
                    <>
                      <div className="w-[1.5px] h-8 bg-white/5" />
                      <div className="flex flex-col items-center space-y-4">
                        {reports.map(staffMember => (
                          <div 
                            key={staffMember.id}
                            onClick={() => setSelectedEmp(staffMember)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left min-w-[190px] relative flex items-center gap-3 ${
                              selectedEmp?.id === staffMember.id 
                                ? 'bg-cyan-500/10 border-cyan-500' 
                                : 'bg-[#121829]/40 border-white/5 hover:border-white/15'
                            }`}
                          >
                            <span className={`absolute top-2 right-2 h-1.5 w-1.5 rounded-full ${staffMember.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                            <div className="h-8 w-8 bg-gray-500/10 rounded-lg flex items-center justify-center text-gray-400 text-xs font-bold uppercase flex-shrink-0">
                              {staffMember.name.substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white truncate leading-tight">{staffMember.name}</div>
                              <div className="text-[10px] text-gray-400 truncate mt-0.5">{staffMember.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Sidebar Info Drawer */}
        {selectedEmp && (
          <div className="w-full lg:w-80 glass-inner-card border border-white/5 rounded-2xl p-6 shadow-2xl relative space-y-6 self-stretch flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="space-y-6">
              {/* Avatar indicator */}
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <div className="h-20 w-20 bg-white/5 rounded-full border border-white/10 flex items-center justify-center mx-auto text-cyan-400 text-2xl font-bold uppercase shadow-inner">
                    {selectedEmp.name.substring(0, 2)}
                  </div>
                  <span className={`absolute bottom-0.5 right-1 h-4 w-4 rounded-full border-2 border-bgSpace ${selectedEmp.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-normal">{selectedEmp.name}</h3>
                  <p className="text-[11px] text-cyan-400 font-semibold">{selectedEmp.role}</p>
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Data fields */}
              <div className="space-y-4 text-xs text-gray-300">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-gray-500" />
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Department</div>
                    <div className="font-semibold text-white">{selectedEmp.dept}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-500" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Corporate Email</div>
                    <div className="font-semibold text-white truncate">{selectedEmp.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-500" />
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Contact Number</div>
                    <div className="font-semibold text-white">{selectedEmp.phone || 'Not Registered'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-gray-500" />
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">EPF Number</div>
                    <div className="font-semibold text-white">{selectedEmp.epf_no || 'Pending Allocation'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro details */}
            <div className="pt-4 border-t border-white/5 text-[9px] text-gray-500 flex items-center gap-1">
              <Zap size={11} className="text-cyan-400 animate-pulse" />
              <span>Reporting structure synchronized automatically.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
