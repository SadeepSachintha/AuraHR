import React from 'react';
import { 
  Building2, 
  Search, 
  DatabaseBackup
} from 'lucide-react';

interface HeaderProps {
  companyId: string;
  isSaaSActive: boolean;
  onResetData: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userEmail: string | null;
  onSignOut: () => void;
  adminRole: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  companyId,
  isSaaSActive,
  onResetData,
  searchQuery,
  setSearchQuery,
  userEmail,
  onSignOut,
  adminRole
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
        {/* Tenant/Company Static Badge */}
        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-400">
          <Building2 size={14} className="shrink-0" />
          <span>
            {companyId === 'company_techcorp' ? 'TechCorp Global' : 
             companyId === 'company_retailhub' ? 'RetailHub LK' : 'Aura Corporates'}
          </span>
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

        {/* Reseed DB Trigger */}
        <button
          onClick={onResetData}
          disabled={adminRole === 'HR Specialist'}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-35 disabled:hover:bg-red-500/10 cursor-pointer disabled:cursor-not-allowed"
          title={adminRole === 'HR Specialist' ? "Action restricted for HR Specialists" : "Reset database to original production template"}
        >
          <DatabaseBackup size={14} />
          <span>Reset Data</span>
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
          <div className="hidden md:flex flex-col text-left">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-white leading-tight">Samantha Perera</h4>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider scale-90 ${
                adminRole === 'Super Admin' 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                  : adminRole === 'Department Manager' 
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {adminRole || 'HR Director'}
              </span>
            </div>
            <span className="text-[9px] text-cyan-400/80 font-medium truncate max-w-[120px] mt-0.5" title={userEmail || ''}>
              {userEmail ? userEmail.split('@')[0] : 'admin'}
            </span>
            <button
              onClick={onSignOut}
              className="text-[9px] text-red-400/70 hover:text-red-400 font-semibold cursor-pointer underline text-left mt-0.5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
