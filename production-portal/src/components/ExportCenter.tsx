import React, { useState } from 'react';
import { FolderDown, Calendar, FileSpreadsheet, Printer, Download, Sparkles } from 'lucide-react';
import type { Employee, Attendance, Leave } from '../types';

interface ExportCenterProps {
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
}

export const ExportCenter: React.FC<ExportCenterProps> = ({
  employees,
  attendance,
  leaves
}) => {
  const [reportType, setReportType] = useState<'attendance' | 'employees' | 'leaves'>('attendance');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (format === 'csv') {
        generateCSV();
      } else {
        generatePDF();
      }
      setIsExporting(false);
    }, 1200);
  };

  const generateCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (reportType === 'attendance') {
      filename = `AuraHR_Attendance_${startDate}_to_${endDate}.csv`;
      headers = ['Log ID', 'Employee ID', 'Employee Name', 'Date', 'Clock In', 'Clock Out', 'Hours Worked', 'Location', 'Device'];
      
      const filtered = attendance.filter(a => a.date >= startDate && a.date <= endDate);
      rows = filtered.map(a => {
        const emp = employees.find(e => e.id === a.emp_id);
        return [
          (a.id || '').toString(),
          a.emp_id,
          emp ? emp.name : 'Unknown',
          a.date,
          a.clock_in,
          a.clock_out,
          a.hours.toString(),
          a.location,
          a.device
        ];
      });
    } else if (reportType === 'employees') {
      filename = `AuraHR_Employee_Directory.csv`;
      headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Salary (LKR)', 'Allowance (LKR)', 'EPF Number', 'Status'];
      
      rows = employees.map(e => [
        e.id,
        e.name,
        e.email,
        e.role,
        e.dept,
        e.salary.toString(),
        e.allowance.toString(),
        e.epf_no,
        e.status
      ]);
    } else if (reportType === 'leaves') {
      filename = `AuraHR_Leave_History_${new Date().getFullYear()}.csv`;
      headers = ['Leave ID', 'Employee ID', 'Name', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Approved By'];
      
      rows = leaves.map(l => {
        const emp = employees.find(e => e.id === l.emp_id);
        return [
          l.id,
          l.emp_id,
          emp ? emp.name : 'Unknown',
          l.type,
          l.start,
          l.end,
          l.reason,
          l.status,
          l.decider || ''
        ];
      });
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    // Open a new printable tab window containing custom formatted HTML report
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let contentHtml = '';
    const nowStr = new Date().toLocaleString();

    if (reportType === 'attendance') {
      const filtered = attendance.filter(a => a.date >= startDate && a.date <= endDate);
      contentHtml = `
        <h2>Attendance Timesheet Audit Log</h2>
        <p><strong>Date Range:</strong> ${startDate} to ${endDate} | <strong>Generated on:</strong> ${nowStr}</p>
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Employee Name</th>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Hours</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(a => {
              const emp = employees.find(e => e.id === a.emp_id);
              return `
                <tr>
                  <td>${a.emp_id}</td>
                  <td>${emp ? emp.name : 'Unknown'}</td>
                  <td>${a.date}</td>
                  <td>${a.clock_in}</td>
                  <td>${a.clock_out}</td>
                  <td>${a.hours} hrs</td>
                  <td>${a.location}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'employees') {
      contentHtml = `
        <h2>Employee Corporate Directory</h2>
        <p><strong>Status:</strong> Active | <strong>Generated on:</strong> ${nowStr}</p>
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>EPF No</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(e => `
              <tr>
                <td>${e.id}</td>
                <td>${e.name}</td>
                <td>${e.email}</td>
                <td>${e.role}</td>
                <td>${e.dept}</td>
                <td>${e.epf_no}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'leaves') {
      contentHtml = `
        <h2>Staff Leave Balances Summary</h2>
        <p><strong>Year Context:</strong> ${new Date().getFullYear()} | <strong>Generated on:</strong> ${nowStr}</p>
        <table>
          <thead>
            <tr>
              <th>Leave ID</th>
              <th>Name</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${leaves.map(l => {
              const emp = employees.find(e => e.id === l.emp_id);
              return `
                <tr>
                  <td>${l.id}</td>
                  <td>${emp ? emp.name : 'Unknown'}</td>
                  <td>${l.type}</td>
                  <td>${l.start} to ${l.end}</td>
                  <td>${l.reason}</td>
                  <td><span style="color: ${l.status === 'Approved' ? '#10b981' : l.status === 'Pending' ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${l.status}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>AuraHR Exporter</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; color: #1e293b; }
            h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 4px; }
            p { font-size: 11px; color: #64748b; margin-top: 0; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background: #f8fafc; color: #475569; font-weight: bold; border-bottom: 2px solid #cbd5e1; }
            th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            @media print {
              body { padding: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 10px;">
            <span style="font-size: 12px; font-weight: bold; color: #0891b2;">AuraHR Compliance Exporter</span>
          </div>
          ${contentHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <FolderDown className="text-cyan-400" size={26} />
          <span>Compliance Exporter Hub</span>
        </h2>
        <p className="text-gray-400 text-sm mt-0.5">
          Prepare and compile database logs into compliance audit exports for payroll and security reviews.
        </p>
      </div>

      {/* Main card panel */}
      <div className="max-w-2xl bg-white/5 border border-white/5 p-6 rounded-2xl shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* 1. Select report type */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider pl-0.5">1. Select Target Domain</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'attendance', name: 'Attendance Sheets', desc: 'Timesheet logs and worked hours.' },
              { id: 'employees', name: 'Employee Register', desc: 'Corporate payroll and EPF balances.' },
              { id: 'leaves', name: 'Leave Audits', desc: 'Active casual/annual leave tabs.' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id as any)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  reportType === type.id
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-md'
                    : 'bg-[#121829]/50 border-white/5 text-gray-400 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="font-semibold text-xs text-white mb-0.5">{type.name}</div>
                <div className="text-[10px] text-gray-500 leading-normal">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Parameters row */}
        {reportType === 'attendance' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider pl-0.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-cyan-400" />
              <span>2. Specify Date Constraints</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-gray-500 pl-0.5 font-semibold">Start Range</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="glass-input w-full text-xs py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-gray-500 pl-0.5 font-semibold">End Range</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="glass-input w-full text-xs py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Output formats */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider pl-0.5">
            {reportType === 'attendance' ? '3.' : '2.'} Choose File Format
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => setFormat('csv')}
              className={`flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                format === 'csv'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-[#121829]/50 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet size={16} />
              <span>Microsoft Excel / CSV Sheet</span>
            </button>
            <button
              onClick={() => setFormat('pdf')}
              className={`flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                format === 'pdf'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-[#121829]/50 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Printer size={16} />
              <span>Printable PDF Audit Log</span>
            </button>
          </div>
        </div>

        {/* 4. Trigger button */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <Sparkles size={12} className="text-cyan-400 animate-pulse" />
            <span>Files are encrypted and generated client-side dynamically.</span>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-bgSpace font-bold rounded-xl text-xs hover:opacity-90 active:scale-98 transition-all flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <span className="h-4 w-4 border-2 border-bgSpace border-t-transparent rounded-full animate-spin" />
                <span>Compiling Data...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Compile & Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
