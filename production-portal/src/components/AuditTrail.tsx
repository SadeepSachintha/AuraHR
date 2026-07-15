import React, { useState } from 'react';
import { History, Shield, User, FileText, Download, Search, AlertCircle, Info, Database } from 'lucide-react';
import type { AuditLog } from '../types';

interface AuditTrailProps {
  logs: AuditLog[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter logs based on search query and category selector
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === 'All' || 
      log.action_type.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp', 'Operator', 'Category', 'Details', 'IP Address'];
    const rows = filteredLogs.map(log => [
      log.timestamp,
      log.operator,
      log.action_type,
      `"${log.details.replace(/"/g, '""')}"`,
      log.ip_address
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AuraHR_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return <Shield size={14} className="text-red-400" />;
      case 'employee':
        return <User size={14} className="text-emerald-400" />;
      case 'leave':
        return <FileText size={14} className="text-cyan-400" />;
      case 'claim':
        return <Info size={14} className="text-orange-400" />;
      case 'system':
        return <Database size={14} className="text-purple-400" />;
      default:
        return <AlertCircle size={14} className="text-gray-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'employee':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'leave':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'claim':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'system':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-white/10';
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-GB', { hour12: false }).replace(',', '');
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="text-cyan-400" size={26} />
            <span>Audit Trail & Compliance Log</span>
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Real-time security log and compliance history record for SOC 2 security certification audits.
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCSV}
          disabled={filteredLogs.length === 0}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-bgSpace font-bold rounded-xl text-xs hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          <span>Export logs (.csv)</span>
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="glass-inner-card rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center shadow-lg">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by operator email or event keywords..."
            className="glass-input w-full pl-10 text-xs py-2.5"
          />
        </div>

        {/* Filter categories tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['All', 'Security', 'Employee', 'Leave', 'Claim', 'System'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedCategory === category
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  : 'bg-white/2 text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="glass-inner-card rounded-2xl border border-white/5 p-5 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-white/5 pb-2 text-[10px] uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Timestamp (UTC)</th>
                <th className="pb-3">Operator</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Description Details</th>
                <th className="pb-3 pr-2 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No compliance records found matching constraints.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/2">
                    {/* Timestamp */}
                    <td className="py-4 pl-2 font-mono text-gray-400">
                      {formatTimestamp(log.timestamp)}
                    </td>

                    {/* Operator email */}
                    <td className="py-4 font-semibold text-white">
                      {log.operator}
                    </td>

                    {/* Category badge */}
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(log.action_type)}`}>
                        {getCategoryIcon(log.action_type)}
                        <span>{log.action_type}</span>
                      </span>
                    </td>

                    {/* Details content */}
                    <td className="py-4 text-gray-300 max-w-xs sm:max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>

                    {/* IP */}
                    <td className="py-4 pr-2 text-right font-mono text-gray-500">
                      <code>{log.ip_address}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
