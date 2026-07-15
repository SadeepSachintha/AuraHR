import React, { useEffect, useRef } from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarClock, 
  AlertTriangle, 
  MapPin, 
  Check, 
  X,
  Compass
} from 'lucide-react';
import type { Employee, Attendance, Leave, Task } from '../types';

interface PulseDashboardProps {
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  tasks: Task[];
  onApproveLeave: (leaveId: string) => void;
  onRejectLeave: (leaveId: string) => void;
}

export const PulseDashboard: React.FC<PulseDashboardProps> = ({
  employees,
  attendance,
  leaves,
  tasks,
  onApproveLeave,
  onRejectLeave
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const mapRef = useRef<any>(null);
  
  // 1. Stats Calculations
  const totalEmployees = employees.length;
  const presentToday = attendance.filter(a => a.date === todayStr).length;
  
  // Pending leaves
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  
  // Overdue tasks
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    return new Date(t.due_date) < new Date(todayStr);
  }).length;

  const onLeaveToday = leaves.filter(l => {
    if (l.status !== 'Approved') return false;
    return todayStr >= l.start && todayStr <= l.end;
  }).length;

  // 2. Charts Calculations
  const trendData = [92, 85, 95, 75, 88];
  const trendLabels = ['June 26', 'June 27', 'June 28', 'June 29', 'June 30'];

  const depts = ['Engineering', 'Product', 'Human Resources', 'Marketing', 'Finance'];
  const deptCounts = depts.reduce((acc, dept) => {
    acc[dept] = employees.filter(e => e.dept === dept).length;
    return acc;
  }, {} as Record<string, number>);

  // 3. Interactive Map Lifecycle
  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map('attendance-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([6.9271, 79.8612], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    // Plot Colombo HQ Center
    const hqIcon = L.divIcon({
      className: 'hq-marker-pulsing',
      html: '<div style="width: 18px; height: 18px; background: #06b6d4; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 15px #06b6d4;"></div>',
      iconSize: [18, 18]
    });
    L.marker([6.9271, 79.8612], { icon: hqIcon })
      .addTo(map)
      .bindPopup('<strong style="color: #0f172a;">AuraHR Colombo HQ</strong><br/><span style="color: #475569; font-size: 11px;">Geofence Center (200m radius)</span>');

    // Plot checked-in employees
    attendance
      .filter(a => a.date === todayStr)
      .forEach(att => {
        const emp = employees.find(e => e.id === att.emp_id);
        if (!emp) return;

        const match = att.location.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);

          const dist = Math.hypot(lat - 6.9271, lng - 79.8612) * 111320;
          const isGeofenced = dist <= 200;

          const employeeIcon = L.divIcon({
            className: 'employee-marker',
            html: `<div style="width: 14px; height: 14px; background: ${isGeofenced ? '#10b981' : '#ef4444'}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px ${isGeofenced ? '#10b981' : '#ef4444'};"></div>`,
            iconSize: [14, 14]
          });

          L.marker([lat, lng], { icon: employeeIcon })
            .addTo(map)
            .bindPopup(`
              <div style="color: #0f172a; font-family: sans-serif; font-size: 11px; padding: 2px; line-height: 1.4;">
                <strong style="font-size: 12px; display: block; margin-bottom: 2px; color: #1e293b;">${emp.name}</strong>
                <span style="color: #64748b; display: block;">${emp.role}</span>
                <span style="color: #6366f1; font-weight: bold; display: block; margin-top: 4px;">Time: ${att.clock_in}</span>
                <span style="color: ${isGeofenced ? '#10b981' : '#f59e0b'}; font-weight: bold; display: block; margin-top: 2px;">
                  Status: ${isGeofenced ? 'Geofenced' : `Remote (${Math.round(dist)}m away)`}
                </span>
              </div>
            `);
        }
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [attendance, employees, todayStr]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Daily Pulse Dashboard</h2>
        <p className="text-gray-400 text-sm mt-0.5">Real-time indicators of business operations, attendance logs, and staff compliance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Card: Total Present */}
        <div className="glass-inner-card rounded-2xl p-5 flex items-center justify-between border border-white/5 shadow-md">
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Present Today</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{presentToday}</h3>
              <span className="text-gray-500 text-sm">/ {totalEmployees}</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
        </div>

        {/* Stat Card: On Leave */}
        <div className="glass-inner-card rounded-2xl p-5 flex items-center justify-between border border-white/5 shadow-md">
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">On Leave / Absent</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-emerald-400">{onLeaveToday}</h3>
              <span className="text-gray-500 text-sm">active leaves</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Stat Card: Pending Approvals */}
        <div className="glass-inner-card rounded-2xl p-5 flex items-center justify-between border border-white/5 shadow-md">
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pending Decisions</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-orange-400">{pendingLeaves.length}</h3>
              <span className="text-gray-500 text-xs">needs approval</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <CalendarClock size={24} />
          </div>
        </div>

        {/* Stat Card: Overdue Tasks */}
        <div className="glass-inner-card rounded-2xl p-5 flex items-center justify-between border border-white/5 shadow-md">
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Overdue Tasks</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-red-500">{overdueTasks}</h3>
              <span className="text-gray-500 text-xs">critical status</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Line Chart */}
        <div className="glass-inner-card rounded-2xl p-5 border border-white/5">
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-gray-300">Attendance Ratio Trends</h4>
          <div className="h-56 relative w-full flex items-end justify-between px-2 pt-6">
            <svg className="absolute inset-0 h-full w-full p-2 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

              <path
                d="M 5,90 L 5,45 Q 25,60 27,55 T 50,42 T 72,65 T 95,50 L 95,90 Z"
                fill="url(#chart-glow)"
              />
              <path
                d="M 5,45 Q 25,60 27,55 T 50,42 T 72,65 T 95,50"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <circle cx="5" cy="45" r="2.5" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
              <circle cx="27" cy="55" r="2.5" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
              <circle cx="50" cy="42" r="2.5" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
              <circle cx="72" cy="65" r="2.5" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
              <circle cx="95" cy="50" r="2.5" fill="#3b82f6" stroke="#fff" strokeWidth="0.5" />
            </svg>
            
            {trendLabels.map((label, idx) => (
              <div key={idx} className="flex flex-col items-center z-10 w-1/5">
                <span className="text-cyan-400 font-bold text-xs">{trendData[idx]}%</span>
                <span className="text-[10px] text-gray-500 mt-2">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Headcount by Department Progress Bar Chart */}
        <div className="glass-inner-card rounded-2xl p-5 border border-white/5">
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-gray-300">Department Headcount</h4>
          <div className="space-y-4">
            {depts.map((dept) => {
              const count = deptCounts[dept] || 0;
              const percent = totalEmployees > 0 ? (count / totalEmployees) * 100 : 0;
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-300">{dept}</span>
                    <span className="text-gray-400">{count} employees ({Math.round(percent)}%)</span>
                  </div>
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dashboard Tables Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Attendance Map (5 cols) */}
        <div className="glass-inner-card rounded-2xl p-5 border border-white/5 lg:col-span-5 flex flex-col h-[400px]">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">Live Map Tracker</h4>
          <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5">
            <div id="attendance-map" className="absolute inset-0 h-full w-full z-10" />
          </div>
        </div>

        {/* Live Attendance Logs Feed (7 cols) */}
        <div className="glass-inner-card rounded-2xl p-5 border border-white/5 lg:col-span-7 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Live Attendance Feed</h4>
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          </div>

          <div className="overflow-y-auto flex-1 pr-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs font-semibold">
                  <th className="pb-3 pl-2">Employee</th>
                  <th className="pb-3">Clock-In Time</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3 pr-2">Mock Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {attendance.filter(a => a.date === todayStr).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No clock-ins recorded today yet.
                    </td>
                  </tr>
                ) : (
                  attendance
                    .filter(a => a.date === todayStr)
                    .map((att, idx) => {
                      const emp = employees.find(e => e.id === att.emp_id);
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 pl-2 flex items-center gap-3">
                            <img
                              src={emp?.avatar}
                              alt="Avatar"
                              className="h-8 w-8 rounded-full border border-white/10"
                            />
                            <div>
                              <div className="font-semibold text-white text-xs">{emp?.name || 'Unknown Employee'}</div>
                              <div className="text-[10px] text-gray-500">{emp?.role}</div>
                            </div>
                          </td>
                          <td className="py-3.5 text-xs font-semibold text-cyan-400">
                            {att.clock_in}
                          </td>
                          <td className="py-3.5">
                            <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 font-semibold px-2 py-0.5 rounded-md">
                              {att.device}
                            </span>
                          </td>
                          <td className="py-3.5 text-xs text-gray-400 max-w-[150px] truncate pr-2" title={att.location}>
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-cyan-400 shrink-0" />
                              <span>{att.location.split('(')[0]}</span>
                            </div>
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

      <div className="grid grid-cols-1 gap-6">
        {/* Action Center - Leaves Approvals Widget */}
        <div className="glass-inner-card rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Compass size={16} className="text-orange-400" />
              <span>Action Center</span>
            </h4>
            <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-semibold">
              {pendingLeaves.length} approvals pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[350px] overflow-y-auto pr-1">
            {pendingLeaves.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-500 text-sm">
                All leaves resolved! No pending items.
              </div>
            ) : (
              pendingLeaves.map((leave) => {
                const emp = employees.find(e => e.id === leave.emp_id);
                return (
                  <div key={leave.id} className="bg-white/25 border border-white/5 p-3.5 rounded-xl space-y-2.5 hover:border-cyan-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={emp?.avatar}
                          alt="Avatar"
                          className="h-7 w-7 rounded-full border border-white/10"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{emp?.name}</div>
                          <div className="text-[9px] text-gray-400">{emp?.dept}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md">
                        {leave.type} Leave
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 space-y-1 pl-1">
                      <div>
                        <strong>Period:</strong> {leave.start} to {leave.end}
                      </div>
                      <div className="italic text-gray-500 truncate">
                        "{leave.reason}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onApproveLeave(leave.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-bgSpace transition-all"
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => onRejectLeave(leave.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 transition-all"
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
