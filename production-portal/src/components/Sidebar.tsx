import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  CalendarDays, 
  Receipt,
  ChevronLeft,
  ChevronRight,
  Wind,
  ShieldAlert,
  History,
  FolderDown,
  CalendarRange,
  Network
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingLeavesCount: number;
  pendingClaimsCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  adminRole: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingLeavesCount,
  pendingClaimsCount,
  isCollapsed,
  setIsCollapsed,
  adminRole
}) => {
  const menuItems = [
    { id: 'dashboard', name: 'Daily Pulse', icon: LayoutDashboard, badge: 0 },
    { id: 'employees', name: 'HR Employees', icon: Users, badge: 0 },
    { id: 'operations', name: 'Operations', icon: KanbanSquare, badge: 0 },
    { id: 'shift-planner', name: 'Shift Planner', icon: CalendarRange, badge: 0 },
    { id: 'org-chart', name: 'Org Chart', icon: Network, badge: 0 },
    { id: 'leaves', name: 'Leaves Board', icon: CalendarDays, badge: pendingLeavesCount },
    { id: 'claims', name: 'Expense Claims', icon: Receipt, badge: pendingClaimsCount }
  ];

  if (adminRole === 'Super Admin' || adminRole === 'HR Specialist') {
    menuItems.push({
      id: 'export-center',
      name: 'Export Center',
      icon: FolderDown,
      badge: 0
    });
  }

  if (adminRole === 'Super Admin') {
    menuItems.push({
      id: 'access-control',
      name: 'Access Control',
      icon: ShieldAlert,
      badge: 0
    });
    menuItems.push({
      id: 'audit-trail',
      name: 'Audit Trail',
      icon: History,
      badge: 0
    });
  }

  return (
    <aside 
      className={`glass-panel flex flex-col transition-all duration-300 relative rounded-2xl h-[calc(100vh-2rem)] select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Wind size={20} className="animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent font-sans">
              Aura<span className="text-white">HR</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon 
                  size={20} 
                  className={`transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-gray-400'
                  }`} 
                />
                {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
              </div>

              {/* Badges */}
              {item.badge > 0 && (
                <span className={`flex items-center justify-center text-xs font-semibold rounded-full h-5 w-5 ${
                  isCollapsed ? 'absolute -top-1 -right-1 ring-2 ring-bgSpace animate-bounce' : ''
                } ${isActive ? 'bg-cyan-500 text-bgSpace' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Trigger Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900 transition-colors shadow-md shadow-cyan-950/50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Footer Branding */}
      <div className="p-4 border-t border-white/5 text-center text-xs text-gray-500 overflow-hidden">
        {!isCollapsed ? (
          <div>
            <span>Powered by </span>
            <a 
              href="https://ss-labz.pages.dev/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline"
            >
              SS Labz
            </a>
          </div>
        ) : (
          <span className="text-cyan-400 font-extrabold">SS</span>
        )}
      </div>
    </aside>
  );
};
