import React from 'react';
import { 
  Building2, 
  Search, 
  DatabaseBackup,
  Smartphone
} from 'lucide-react';

interface HeaderProps {
  companyId: string;
  setCompanyId: (id: string) => void;
  isSaaSActive: boolean;
  onResetData: () => void;
  showMobileSimulator: boolean;
  setShowMobileSimulator: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  companyId,
  setCompanyId,
  isSaaSActive,
  onResetData,
  showMobileSimulator,
  setShowMobileSimulator,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <header className="glass-panel w-full flex items-center justify-between p-4 px-6 rounded-2xl select-none">
      {/* Search Input Bar */}
      <div className="relative w-72">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employees or actions..."
          className="glass-input w-full pl-10 text-sm py-2"
        />
      </div>

      {/* Control Widgets */}
      <div className="flex items-center gap-4">
        {/* Tenant/Company Selector Dropdown */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <Building2 size={14} className="text-gray-400" />
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="bg-transparent border-none text-white outline-none cursor-pointer font-sans"
          >
            <option value="company_aura" className="bg-[#121829] text-white">Aura Corporates</option>
            <option value="company_techcorp" className="bg-[#121829] text-white">TechCorp Global</option>
            <option value="company_retailhub" className="bg-[#121829] text-white">RetailHub LK</option>
          </select>
        </div>

        {/* Sync Status Badge */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
          isSaaSActive 
            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          <span className={`h-2 w-2 rounded-full ${isSaaSActive ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
          <span>{isSaaSActive ? 'Live SaaS Cloud DB Active' : 'Real-time Local DB Synced'}</span>
        </div>

        {/* Mobile Simulator Toggle */}
        <button
          onClick={() => setShowMobileSimulator(!showMobileSimulator)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
            showMobileSimulator
              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
              : 'bg-white/5 text-gray-400 border-transparent hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Mobile Simulator"
        >
          <Smartphone size={14} />
          <span>{showMobileSimulator ? 'Hide Mobile' : 'Show Mobile'}</span>
        </button>

        {/* Reseed DB Trigger */}
        <button
          onClick={onResetData}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
          title="Reset databases to original demo templates"
        >
          <DatabaseBackup size={14} />
          <span>Reset Demo</span>
        </button>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-white/10" />

        {/* Admin Profile Details */}
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100"
            alt="Admin Profile"
            className="h-9 w-9 rounded-xl border border-white/10 object-cover"
          />
          <div className="hidden md:block text-left">
            <h4 className="text-xs font-semibold text-white leading-tight">Samantha Perera</h4>
            <span className="text-[10px] text-gray-400 leading-none">HR Director</span>
          </div>
        </div>
      </div>
    </header>
  );
};
