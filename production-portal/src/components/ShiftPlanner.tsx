import React, { useState } from 'react';
import { CalendarRange, Plus, Clock, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import type { Employee, Attendance, Roster } from '../types';

interface ShiftPlannerProps {
  employees: Employee[];
  attendance: Attendance[];
  rosters: Roster[];
  onAddRoster: (newRoster: Roster) => void;
}

export const ShiftPlanner: React.FC<ShiftPlannerProps> = ({
  employees,
  attendance,
  rosters,
  onAddRoster
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:30');
  const [isAssigning, setIsAssigning] = useState(false);

  // Form submit handler
  const handleAssignShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const newRoster: Roster = {
      id: 'rost_' + Date.now(),
      emp_id: selectedEmpId,
      date: shiftDate,
      shift_start: startTime,
      shift_end: endTime
    };

    onAddRoster(newRoster);
    setIsAssigning(false);
  };

  // Helper: calculate shift vs check-in compliance status
  const getComplianceStatus = (empId: string, date: string, shiftStart: string) => {
    const record = attendance.find(a => a.emp_id === empId && a.date === date);
    if (!record) {
      // If the roster date is in the future, it is pending
      const today = new Date().toISOString().split('T')[0];
      return date > today 
        ? { text: 'Pending', color: 'text-gray-400 border-white/5 bg-white/2', icon: <Clock size={12} /> }
        : { text: 'Absent', color: 'text-red-400 border-red-500/20 bg-red-500/5', icon: <AlertTriangle size={12} /> };
    }

    if (!record.clock_in) {
      return { text: 'Absent', color: 'text-red-400 border-red-500/20 bg-red-500/5', icon: <AlertTriangle size={12} /> };
    }

    // Compare hours/minutes
    const [sHours, sMins] = shiftStart.split(':').map(Number);
    const [cHours, cMins] = record.clock_in.split(':').map(Number);

    const shiftVal = sHours * 60 + sMins;
    const clockVal = cHours * 60 + cMins;

    if (clockVal <= shiftVal) {
      return { text: 'Punctual', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', icon: <CheckCircle2 size={12} /> };
    } else {
      const diff = clockVal - shiftVal;
      return { 
        text: `Late (${diff}m)`, 
        color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', 
        icon: <AlertTriangle size={12} /> 
      };
    }
  };

  // Compute compliance statistics
  const resolvedRosters = rosters.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.date <= today;
  });
  
  const punctualCount = resolvedRosters.filter(r => {
    const comp = getComplianceStatus(r.emp_id, r.date, r.shift_start);
    return comp.text === 'Punctual';
  }).length;

  const lateCount = resolvedRosters.filter(r => {
    const comp = getComplianceStatus(r.emp_id, r.date, r.shift_start);
    return comp.text.startsWith('Late');
  }).length;

  const absentCount = resolvedRosters.filter(r => {
    const comp = getComplianceStatus(r.emp_id, r.date, r.shift_start);
    return comp.text === 'Absent';
  }).length;

  const complianceRate = resolvedRosters.length > 0 
    ? Math.round((punctualCount / resolvedRosters.length) * 100) 
    : 100;

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CalendarRange className="text-cyan-400" size={26} />
            <span>Corporate Shift Planner</span>
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Manage operational team shifts and verify check-in compliance logs dynamically.
          </p>
        </div>

        {/* Assign Shift Button */}
        <button
          onClick={() => setIsAssigning(!isAssigning)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 active:scale-98 text-bgSpace font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Assign New Shift</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Compliance Rate */}
        <div className="glass-inner-card rounded-2xl border border-white/5 p-4 space-y-2">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Shift Compliance Rate</div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">{complianceRate}%</div>
            <div className="text-[10px] text-emerald-400 font-medium">Target &gt; 95%</div>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${complianceRate}%` }} />
          </div>
        </div>

        {/* Punctual Shifts */}
        <div className="glass-inner-card rounded-2xl border border-white/5 p-4 space-y-1">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span>Punctual Logs</span>
          </div>
          <div className="text-2xl font-bold text-white">{punctualCount}</div>
          <div className="text-[10px] text-gray-400">Arrived before shift start.</div>
        </div>

        {/* Late Checks */}
        <div className="glass-inner-card rounded-2xl border border-white/5 p-4 space-y-1">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-400" />
            <span>Late Check-Ins</span>
          </div>
          <div className="text-2xl font-bold text-white">{lateCount}</div>
          <div className="text-[10px] text-gray-400">Arrived after shift timing.</div>
        </div>

        {/* Absentees */}
        <div className="glass-inner-card rounded-2xl border border-white/5 p-4 space-y-1">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck size={12} className="text-red-400" />
            <span>Absences Today</span>
          </div>
          <div className="text-2xl font-bold text-white">{absentCount}</div>
          <div className="text-[10px] text-gray-400">No clock-ins recorded.</div>
        </div>
      </div>

      {/* Assign Roster Form Panel (Collapsible) */}
      {isAssigning && (
        <form onSubmit={handleAssignShift} className="glass-inner-card rounded-2xl border border-cyan-500/20 p-5 shadow-lg space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" />
            <span>Assign Duty Shift Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Employee */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-semibold pl-0.5">Select Employee</label>
              <select
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                className="glass-input w-full text-xs py-2 bg-bgSpace text-white cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-bgSpace text-white">
                    {emp.name} ({emp.dept})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-semibold pl-0.5">Shift Date</label>
              <input
                type="date"
                value={shiftDate}
                onChange={e => setShiftDate(e.target.value)}
                className="glass-input w-full text-xs py-2"
              />
            </div>

            {/* Shift Start */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-semibold pl-0.5">Duty Shift Start (HH:MM)</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="glass-input w-full text-xs py-2"
              />
            </div>

            {/* Shift End */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-semibold pl-0.5">Duty Shift End (HH:MM)</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="glass-input w-full text-xs py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAssigning(false)}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-400 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-bgSpace text-xs font-bold rounded-xl"
            >
              Assign Roster
            </button>
          </div>
        </form>
      )}

      {/* Roster Listing Grid Table */}
      <div className="glass-inner-card rounded-2xl border border-white/5 p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4">Chronological Duty Roster Planner</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-white/5 pb-2 text-[10px] uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Duty Date</th>
                <th className="pb-3">Employee</th>
                <th className="pb-3">Assigned Shift</th>
                <th className="pb-3">Clock In</th>
                <th className="pb-3">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {rosters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No active shift rosters assigned yet.
                  </td>
                </tr>
              ) : (
                rosters.map(roster => {
                  const emp = employees.find(e => e.id === roster.emp_id);
                  const att = attendance.find(a => a.emp_id === roster.emp_id && a.date === roster.date);
                  const comp = getComplianceStatus(roster.emp_id, roster.date, roster.shift_start);

                  return (
                    <tr key={roster.id} className="hover:bg-white/2">
                      {/* Date */}
                      <td className="py-3.5 pl-2 text-gray-400 font-medium">
                        {roster.date}
                      </td>

                      {/* Employee */}
                      <td className="py-3.5 font-semibold text-white">
                        {emp ? emp.name : 'Unknown'}
                        <span className="text-[10px] text-gray-500 ml-1.5">({emp?.dept || ''})</span>
                      </td>

                      {/* Assigned time range */}
                      <td className="py-3.5 font-mono text-cyan-400">
                        {roster.shift_start} - {roster.shift_end}
                      </td>

                      {/* Actual clock in */}
                      <td className="py-3.5 font-mono text-gray-300">
                        {att?.clock_in ? att.clock_in : <span className="text-gray-600">--:--</span>}
                      </td>

                      {/* Compliance Status */}
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${comp.color}`}>
                          {comp.icon}
                          <span>{comp.text}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
