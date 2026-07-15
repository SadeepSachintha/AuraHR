import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  LogOut,
  Coins,
  ChevronLeft,
  Compass,
  Download
} from 'lucide-react';
import { Employee, Attendance, Leave, Claim, KPI } from '../types';

interface MobileSimulatorProps {
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  claims: Claim[];
  kpis: KPI[];
  onClockIn: (att: Attendance) => Promise<{ success: boolean; error?: string }>;
  onApplyLeave: (leave: Leave) => void;
  onSubmitClaim: (claim: Claim) => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  employees,
  attendance,
  leaves,
  claims,
  kpis,
  onClockIn,
  onApplyLeave,
  onSubmitClaim
}) => {
  const [activeEmpId, setActiveEmpId] = useState<string>('EMP001');
  const [mobileScreen, setMobileScreen] = useState<'splash' | 'home' | 'clock' | 'leave' | 'claims' | 'payslip' | 'kpis'>('splash');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Geofence / Map states
  const [gpsCoordinates, setGpsCoordinates] = useState<[number, number]>([6.9271, 79.8612]); // Colombo HQ
  const [gpsLocationLabel, setGpsLocationLabel] = useState<string>('HQ Office (Colombo)');
  const [isClockedInToday, setIsClockedInToday] = useState(false);
  
  // Leaf form states
  const [leaveType, setLeaveType] = useState<'Casual' | 'Annual' | 'Medical'>('Casual');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  
  // Claim form states
  const [claimCategory, setClaimCategory] = useState('Travel / Mileage');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDesc, setClaimDesc] = useState('');
  const [claimReceipt, setClaimReceipt] = useState('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=250&h=350');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const activeEmp = employees.find(e => e.id === activeEmpId) || employees[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const downloadPdfPayslip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${activeEmp?.name} - ${activeEmpId}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
            .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
            .company { font-size: 22px; font-weight: 800; color: #0f172a; }
            .title { font-size: 14px; font-weight: 600; color: #6366f1; background: #e0e7ff; padding: 4px 12px; border-radius: 9999px; }
            .details { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 13px; }
            .details-col div { margin-bottom: 6px; }
            .label { color: #64748b; font-weight: 500; }
            .value { color: #0f172a; font-weight: 600; }
            .divider { border-top: 1px solid #e2e8f0; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
            .deduction { color: #ef4444; }
            .total { font-size: 16px; font-weight: 700; border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; padding: 12px 0; margin-top: 20px; color: #10b981; }
            .compliance { background: #f1f5f9; padding: 16px; border-radius: 12px; margin-top: 24px; font-size: 12px; border: 1px dashed #cbd5e1; }
            .compliance-title { font-weight: 700; color: #475569; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; }
            @media print {
              body { background: white; padding: 0; }
              .card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="company">AuraHR Private Ltd</div>
              <div class="title">June 2026 Advice</div>
            </div>
            <div class="details">
              <div class="details-col">
                <div><span class="label">Employee Code:</span> <span class="value">${activeEmp?.id}</span></div>
                <div><span class="label">Full Name:</span> <span class="value">${activeEmp?.name}</span></div>
              </div>
              <div class="details-col" style="text-align: right;">
                <div><span class="label">Designation:</span> <span class="value">${activeEmp?.role}</span></div>
                <div><span class="label">Department:</span> <span class="value">${activeEmp?.dept}</span></div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="row"><span class="label">Basic Salary:</span> <span class="value">LKR ${basicSalary.toLocaleString()}</span></div>
            <div class="row"><span class="label">Allowances:</span> <span class="value">LKR ${allowances.toLocaleString()}</span></div>
            <div class="row deduction"><span class="label deduction">Employee EPF (8%):</span> <span class="value deduction">- LKR ${epfEmployee.toLocaleString()}</span></div>
            ${otherDeductions > 0 ? `<div class="row deduction"><span class="label deduction">Other Deductions:</span> <span class="value deduction">- LKR ${otherDeductions.toLocaleString()}</span></div>` : ''}
            <div class="total">
              <div class="row"><span>Net Salary Paid:</span> <span>LKR ${netSalary.toLocaleString()}</span></div>
            </div>
            <div class="compliance">
              <div class="compliance-title">Employer Compliance Contributions (Not deducted from salary)</div>
              <div class="row"><span class="label">Employer EPF (12%):</span> <span class="value">LKR ${epfEmployer.toLocaleString()}</span></div>
              <div class="row"><span class="label">Employer ETF (3%):</span> <span class="value">LKR ${etfEmployer.toLocaleString()}</span></div>
            </div>
            <div class="footer">This is a computer-generated payslip advice and requires no signature.</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 1. Clock Updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Attendance Status Check
  useEffect(() => {
    const todayAtt = attendance.find(a => a.emp_id === activeEmpId && a.date === todayStr);
    setIsClockedInToday(!!todayAtt);
  }, [attendance, activeEmpId, todayStr]);

  // 3. Leaflet Map Initialization
  useEffect(() => {
    // Only run if we are on the clock screen and leaflet L is loaded globally
    if (mobileScreen === 'clock' && (window as any).L && mapContainerRef.current) {
      // Clear previous map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const L = (window as any).L;
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(gpsCoordinates, 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'gps-marker-pulsing',
        html: '<div style="width: 14px; height: 14px; background: #06b6d4; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #06b6d4;"></div>',
        iconSize: [14, 14]
      });

      const marker = L.marker(gpsCoordinates, { icon: customIcon }).addTo(map);

      mapRef.current = map;
      markerRef.current = marker;

      // Handle map click
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setGpsCoordinates([lat, lng]);
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng]);

        // Calculate distance from HQ (6.9271, 79.8612)
        const dist = Math.hypot(lat - 6.9271, lng - 79.8612);
        if (dist > 0.05) {
          setGpsLocationLabel(`Remote site (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        } else {
          setGpsLocationLabel('HQ Office (Colombo)');
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mobileScreen]);

  // 4. Form Actions
  const handleClockInAction = async () => {
    if (isClockedInToday) {
      // Clock Out
      const todayAtt = attendance.find(a => a.emp_id === activeEmpId && a.date === todayStr);
      if (todayAtt) {
        const updatedAtt: Attendance = {
          ...todayAtt,
          clock_out: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hours: 8.5
        };
        const res = await onClockIn(updatedAtt);
        if (res.success) {
          alert("Clock-out recorded successfully!");
        } else {
          alert("Error: " + res.error);
        }
      }
    } else {
      // Clock In
      const newAtt: Attendance = {
        emp_id: activeEmpId,
        date: todayStr,
        clock_in: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clock_out: '',
        hours: 0,
        location: `${gpsLocationLabel} (${gpsCoordinates[0].toFixed(4)}, ${gpsCoordinates[1].toFixed(4)})`,
        device: 'Mobile Simulator'
      };
      
      const res = await onClockIn(newAtt);
      if (res.success) {
        alert("Clock-in recorded successfully!");
        setMobileScreen('home');
      } else {
        alert("Clock-in rejected!\n" + res.error);
      }
    }
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) return;

    const newLeave: Leave = {
      id: `L-${Date.now().toString().slice(-4)}`,
      emp_id: activeEmpId,
      type: leaveType,
      start: leaveStart,
      end: leaveEnd,
      reason: leaveReason,
      status: 'Pending',
      applied_on: todayStr
    };

    onApplyLeave(newLeave);
    alert("Leave application submitted to HR Portal!");
    
    // Clear
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
    setMobileScreen('home');
  };

  const handleApplyClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAmount || !claimDesc) return;

    const newClaim: Claim = {
      id: `C-${Date.now().toString().slice(-4)}`,
      emp_id: activeEmpId,
      category: claimCategory,
      amount: parseFloat(claimAmount),
      description: claimDesc,
      receipt: claimReceipt,
      status: 'Pending'
    };

    onSubmitClaim(newClaim);
    alert("Claim request logged successfully!");
    
    setClaimAmount('');
    setClaimDesc('');
    setMobileScreen('home');
  };

  // 5. Calculations (EPF & ETF)
  const basicSalary = activeEmp?.salary || 100000;
  const allowances = activeEmp?.allowance || 15000;
  const epfEmployee = basicSalary * 0.08;
  const epfEmployer = basicSalary * 0.12;
  const etfEmployer = basicSalary * 0.03;
  const otherDeductions = activeEmpId === 'EMP001' ? 2000 : 0;
  const netSalary = basicSalary + allowances - epfEmployee - otherDeductions;

  // 6. Leaves History
  const myLeaves = leaves.filter(l => l.emp_id === activeEmpId);
  const myClaims = claims.filter(c => c.emp_id === activeEmpId);
  const myKpi = kpis.find(k => k.emp_id === activeEmpId) || { title: 'No KPIs set yet', completion: 0, score: 0, feedback: '' };

  return (
    <aside className="w-80 shrink-0 font-sans select-none space-y-4">
      {/* Mobile Selector instructions */}
      <div className="glass-inner-card p-3 rounded-xl border border-white/5 space-y-1.5">
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Simulator Context</label>
        <select
          value={activeEmpId}
          onChange={(e) => {
            setActiveEmpId(e.target.value);
            setMobileScreen('splash');
          }}
          className="w-full bg-[#121829] border border-white/5 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer font-sans"
        >
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.name} ({e.role.split(' ')[0]})</option>
          ))}
        </select>
      </div>

      {/* Sleek Smartphone Frame */}
      <div className="w-[280px] h-[560px] mx-auto rounded-[36px] bg-black border-[6px] border-cyan-950 shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-cyan-500/10">
        {/* Speaker notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-cyan-950 flex justify-center items-center gap-1.5 px-3 z-30">
          <div className="w-6 h-0.5 rounded-full bg-black/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
        </div>

        {/* Screen container */}
        <div className="flex-1 bg-[#090D16] text-white flex flex-col relative z-20 text-xs overflow-hidden">
          
          {/* Status bar */}
          <div className="h-6 flex items-center justify-between px-4 pt-1 text-[9px] text-gray-500 font-bold font-sans">
            <span>AuraMobile</span>
            <span>{currentTime || '15:40'}</span>
          </div>

          {/* SCREEN: Splash Biometrics */}
          {mobileScreen === 'splash' && (
            <div className="flex-1 flex flex-col justify-between p-5 text-center items-center animate-in fade-in duration-200">
              <div className="my-auto space-y-2">
                <Compass size={40} className="mx-auto text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                <h3 className="text-sm font-bold tracking-wider">AuraMobile</h3>
                <span className="text-[10px] text-gray-500">Employee Workspace Gate</span>
              </div>

              {/* Tap to bypass fingerprint */}
              <button 
                onClick={() => setMobileScreen('home')}
                className="my-auto h-24 w-24 rounded-full border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/15 flex flex-col items-center justify-center gap-2 group transition-all cursor-pointer pulse-glow-button"
              >
                <Fingerprint size={28} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] text-cyan-400 font-semibold uppercase">Scan Demo</span>
              </button>

              <div className="text-[9px] text-gray-500 py-2 border-t border-white/5 w-full">
                Context: <strong>{activeEmp?.name}</strong>
              </div>
            </div>
          )}

          {/* SCREEN: Home Dashboard */}
          {mobileScreen === 'home' && (
            <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
              {/* Mobile Profile Header */}
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeEmp?.avatar}
                    alt="Avatar"
                    className="h-8 w-8 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="font-bold text-white leading-tight">{activeEmp?.name.split(' ')[0]}</h4>
                    <span className="text-[9px] text-gray-400 leading-none">{activeEmp?.role.split(' ')[0]}</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileScreen('splash')}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>

              {/* Scroll Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Clock Card */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-3.5 text-center">
                  <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold">
                    <span>GPS CLOCK STATUS</span>
                    <span className={`px-1.5 py-0.5 rounded ${
                      isClockedInToday ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' : 'bg-white/5 text-gray-500'
                    }`}>
                      {isClockedInToday ? 'Clocked In' : 'Offline'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-sans text-white">{currentTime || '15:40:02'}</div>
                  <button
                    onClick={() => setMobileScreen('clock')}
                    className="w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-600 text-bgSpace transition-all"
                  >
                    Check GPS Coordinates
                  </button>
                </div>

                {/* Quick actions grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Leaves */}
                  <button
                    onClick={() => setMobileScreen('leave')}
                    className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1.5 hover:border-cyan-500/20 transition-all text-center"
                  >
                    <Calendar size={18} className="text-cyan-400" />
                    <strong>Leave Balances</strong>
                    <span className="text-[9px] text-gray-500">
                      {activeEmp?.leave_balances.Annual + activeEmp?.leave_balances.Casual + activeEmp?.leave_balances.Medical} left
                    </span>
                  </button>

                  {/* Claims */}
                  <button
                    onClick={() => setMobileScreen('claims')}
                    className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1.5 hover:border-cyan-500/20 transition-all text-center"
                  >
                    <Coins size={18} className="text-emerald-400" />
                    <strong>Expense Claims</strong>
                    <span className="text-[9px] text-gray-500">
                      {myClaims.length} processed
                    </span>
                  </button>

                  {/* Payslips */}
                  <button
                    onClick={() => setMobileScreen('payslip')}
                    className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1.5 hover:border-cyan-500/20 transition-all text-center"
                  >
                    <DollarSign size={18} className="text-blue-400" />
                    <strong>Payslips Suite</strong>
                    <span className="text-[9px] text-gray-500">June 2026</span>
                  </button>

                  {/* KPIs */}
                  <button
                    onClick={() => setMobileScreen('kpis')}
                    className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1.5 hover:border-cyan-500/20 transition-all text-center"
                  >
                    <CheckCircle2 size={18} className="text-orange-400" />
                    <strong>Appraisals</strong>
                    <span className="text-[9px] text-gray-500">{myKpi.completion}% completed</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: GPS Coordinates Clock-in */}
          {mobileScreen === 'clock' && (
            <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
              <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <button onClick={() => setMobileScreen('home')} className="text-gray-500 hover:text-white"><ChevronLeft size={16} /></button>
                <h4 className="font-bold text-white text-xs">GPS Check In</h4>
                <div className="w-4" />
              </div>

              {/* Map Canvas */}
              <div className="flex-1 relative flex flex-col bg-cyan-950/20">
                {/* Leaflet container bind div */}
                <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 border border-white/10 p-2 rounded-lg z-20 space-y-0.5 text-[9px] leading-tight">
                  <div className="font-bold text-white flex items-center gap-1">
                    <MapPin size={10} className="text-cyan-400" />
                    <span>GPS Lock Status</span>
                  </div>
                  <div className="text-gray-400 truncate">{gpsLocationLabel}</div>
                  <div className="text-gray-500 text-[8px]">Click map coordinates to simulate distance.</div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 border-t border-white/5 bg-white/5 text-center space-y-2.5">
                <div className="text-[9px] text-gray-500 leading-tight">
                  Office geofence rule: <strong>within 200m radius of HQ</strong>
                </div>
                <button
                  onClick={handleClockInAction}
                  className={`w-full py-2 rounded-lg font-bold uppercase tracking-wider transition-all text-[10px] ${
                    isClockedInToday 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-bgSpace hover:opacity-90'
                  }`}
                >
                  {isClockedInToday ? 'Clock Out Shift' : 'Clock In Shift'}
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Leave Request Form */}
          {mobileScreen === 'leave' && (
            <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
              <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <button onClick={() => setMobileScreen('home')} className="text-gray-500 hover:text-white"><ChevronLeft size={16} /></button>
                <h4 className="font-bold text-white text-xs">Apply for Leave</h4>
                <div className="w-4" />
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Leave balances */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg">
                    <strong className="text-white text-sm block">{activeEmp?.leave_balances.Annual}</strong>
                    <span className="text-[8px] text-gray-500">Annual</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg">
                    <strong className="text-white text-sm block">{activeEmp?.leave_balances.Casual}</strong>
                    <span className="text-[8px] text-gray-500">Casual</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg">
                    <strong className="text-white text-sm block">{activeEmp?.leave_balances.Medical}</strong>
                    <span className="text-[8px] text-gray-500">Medical</span>
                  </div>
                </div>

                {/* Apply Form */}
                <form onSubmit={handleApplyLeaveSubmit} className="space-y-3.5 text-[10px] text-left">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold uppercase tracking-wider block">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as any)}
                      className="w-full bg-[#121829] border border-white/5 rounded-lg px-2.5 py-1 text-white outline-none cursor-pointer"
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Annual">Annual Leave</option>
                      <option value="Medical">Medical Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold uppercase tracking-wider block">Start Date</label>
                      <input
                        type="date"
                        required
                        value={leaveStart}
                        onChange={(e) => setLeaveStart(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-[10px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold uppercase tracking-wider block">End Date</label>
                      <input
                        type="date"
                        required
                        value={leaveEnd}
                        onChange={(e) => setLeaveEnd(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold uppercase tracking-wider block">Reason / Description</label>
                    <textarea
                      required
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="e.g. Urgent private business..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white placeholder-gray-600 text-[10px] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 text-bgSpace rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Submit Request
                  </button>
                </form>

                {/* History list */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <h5 className="font-bold text-white text-[10px] uppercase text-left tracking-wider">Request Archives</h5>
                  <div className="space-y-2">
                    {myLeaves.length === 0 ? (
                      <div className="text-gray-600 text-[10px] italic py-2">No archive files.</div>
                    ) : (
                      myLeaves.map((l, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-2 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-[9px]">{l.type} Leave ({l.start} to {l.end})</div>
                            <div className="text-[8px] text-gray-500 truncate max-w-[120px]">"{l.reason}"</div>
                          </div>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            l.status === 'Approved' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : l.status === 'Rejected' 
                                ? 'bg-red-500/10 text-red-400' 
                                : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Claims Form */}
          {mobileScreen === 'claims' && (
            <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
              <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <button onClick={() => setMobileScreen('home')} className="text-gray-500 hover:text-white"><ChevronLeft size={16} /></button>
                <h4 className="font-bold text-white text-xs">Expense Claims</h4>
                <div className="w-4" />
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <form onSubmit={handleApplyClaimSubmit} className="space-y-3.5 text-[10px] text-left">
                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold uppercase tracking-wider block">Claim Category</label>
                    <select
                      value={claimCategory}
                      onChange={(e) => setClaimCategory(e.target.value)}
                      className="w-full bg-[#121829] border border-white/5 rounded-lg px-2.5 py-1 text-white outline-none cursor-pointer"
                    >
                      <option value="Travel / Mileage">Travel / Mileage</option>
                      <option value="Internet / Broadband">Internet / Broadband</option>
                      <option value="Meals & Client Hosting">Meals & Client Hosting</option>
                      <option value="Medical Expenses">Medical Expenses</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold uppercase tracking-wider block">Claim Amount (LKR)</label>
                    <input
                      type="number"
                      required
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      placeholder="e.g. 3500"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-[10px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold uppercase tracking-wider block">Receipt / Description</label>
                    <input
                      type="text"
                      required
                      value={claimDesc}
                      onChange={(e) => setClaimDesc(e.target.value)}
                      placeholder="e.g. SLT fiber bill reimbursement"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-[10px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-500 font-bold uppercase tracking-wider block">Receipt Image Presets</label>
                    <select
                      value={claimReceipt}
                      onChange={(e) => setClaimReceipt(e.target.value)}
                      className="w-full bg-[#121829] border border-white/5 rounded-lg px-2.5 py-1 text-white outline-none cursor-pointer"
                    >
                      <option value="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=250&h=350">Preset Receipt Image A</option>
                      <option value="https://images.unsplash.com/photo-1534972195531-d756b9bda9f2?auto=format&fit=crop&q=80&w=250&h=350">Preset Receipt Image B</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 text-bgSpace rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Submit Claims
                  </button>
                </form>

                {/* History list */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <h5 className="font-bold text-white text-[10px] uppercase text-left tracking-wider">Claims Archive</h5>
                  <div className="space-y-2">
                    {myClaims.length === 0 ? (
                      <div className="text-gray-600 text-[10px] italic py-2">No archive files.</div>
                    ) : (
                      myClaims.map((c, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-2 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-[9px]">{c.category}</div>
                            <div className="text-[8px] text-gray-400 font-semibold">LKR {c.amount.toLocaleString()}</div>
                          </div>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            c.status === 'Approved' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : c.status === 'Rejected' 
                                ? 'bg-red-500/10 text-red-400' 
                                : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Payslip calculations */}
          {mobileScreen === 'payslip' && (
            <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
              <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <button onClick={() => setMobileScreen('home')} className="text-gray-500 hover:text-white"><ChevronLeft size={16} /></button>
                <h4 className="font-bold text-white text-xs">Payroll & Payslips</h4>
                <div className="w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[10px] text-left">
                <div className="border border-white/5 bg-white/5 rounded-xl p-3 space-y-2">
                  <div className="text-center font-bold text-white text-xs border-b border-white/5 pb-2">
                    AuraHR Private Ltd • June 2026
                  </div>
                  
                  <div className="space-y-1 pt-1 font-medium">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee Code:</span>
                      <span className="text-white">{activeEmp?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Name:</span>
                      <span className="text-white">{activeEmp?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Designation:</span>
                      <span className="text-white">{activeEmp?.role.split(' ')[0]}</span>
                    </div>
                  </div>
                  
                  <hr className="border-white/5" />
                  
                  <div className="space-y-1.5 font-medium">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Basic Salary:</span>
                      <span className="text-white">LKR {basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Allowances:</span>
                      <span className="text-white">LKR {allowances.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>Employee EPF (8%):</span>
                      <span>- LKR {epfEmployee.toLocaleString()}</span>
                    </div>
                    {otherDeductions > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Other Deductions:</span>
                        <span>- LKR {otherDeductions.toLocaleString()}</span>
                      </div>
                    )}
                    <hr className="border-white/5" />
                    <div className="flex justify-between font-bold text-cyan-400 pt-1 text-xs">
                      <span>Net Salary Paid:</span>
                      <span>LKR {netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Compliance info */}
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3.5 space-y-1.5 text-[9px] text-gray-400 leading-normal">
                  <h6 className="font-bold text-cyan-400 uppercase text-[8px] tracking-wider mb-1">Employer Compliance Contributions</h6>
                  <div className="flex justify-between">
                    <span>Employer EPF (12%):</span>
                    <span className="text-white font-semibold">LKR {epfEmployer.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employer ETF (3%):</span>
                    <span className="text-white font-semibold">LKR {etfEmployer.toLocaleString()}</span>
                  </div>
                </div>

                {/* Print/Download CTA */}
                <button
                  onClick={downloadPdfPayslip}
                  className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-cyan-400 text-bgSpace hover:opacity-90 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download size={12} />
                  <span>Download PDF Payslip</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: KPIs and Appraisals */}
          {mobileScreen === 'kpis' && (
            <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
              <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <button onClick={() => setMobileScreen('home')} className="text-gray-500 hover:text-white"><ChevronLeft size={16} /></button>
                <h4 className="font-bold text-white text-xs">My Appraisals</h4>
                <div className="w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block">Assigned Goal Track</span>
                    <h4 className="font-bold text-white text-sm leading-snug">
                      {myKpi.title}
                    </h4>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>Milestone Progress</span>
                      <strong className="text-cyan-400">{myKpi.completion}%</strong>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${myKpi.completion}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/5">
                    <span className="text-gray-400 font-medium">Manager Score:</span>
                    <strong className="text-cyan-400 text-sm">{myKpi.score.toFixed(1)} / 5.0</strong>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-[10px] space-y-1.5 leading-normal">
                  <span className="text-gray-500 font-bold uppercase tracking-wider block text-[8px]">Director Feedback</span>
                  <p className="text-gray-300 italic">
                    "{myKpi.feedback || 'Appraisal reviews will be generated at the end of the current quarter.'}"
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Home button notch */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-full bg-cyan-950/80 z-30" />
      </div>
    </aside>
  );
};
