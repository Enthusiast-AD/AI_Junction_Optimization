import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  BrainCircuit, 
  Settings, 
  LogOut,
  Activity,
  Bell
} from 'lucide-react';
import { clsx } from 'clsx';
import { useJunctionWebSocket } from '../hooks/useJunctionWebSocket';
import { useJunctionStore } from '../store/useJunctionStore';

const SidebarItem = ({ to, icon: Icon, label, end }: { to: string; icon: any; label: string; end?: boolean }) => (

  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
        isActive 
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      )
    }
  >
    <Icon size={20} className="shrink-0" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const DashboardLayout = () => {
  const navigate = useNavigate();
  useJunctionWebSocket();
  const { connectionStatus } = useJunctionStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate('/signin');
  };

  const handleSignOut = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-900 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold">AI Junction</span>
          </div>

          <nav className="space-y-2">
            <SidebarItem to="/dashboard" end={true} icon={LayoutDashboard} label="Overview" />
            <SidebarItem to="/dashboard/analytics" icon={BarChart3} label="Analytics" />
            <SidebarItem to="/dashboard/insights" icon={BrainCircuit} label="AI Insights" />
            <SidebarItem to="/dashboard/settings" icon={Settings} label="Settings" />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">System Status</div>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                 <span className="text-sm font-medium text-slate-300">
                   {connectionStatus === 'connected' ? 'Live WebSocket' : 'Disconnected'}
                 </span>
              </div>
            </div>
           
           <button 
             onClick={handleSignOut}
             className="flex items-center gap-3 px-4 py-2 w-full text-slate-500 hover:text-rose-400 transition-colors"
           >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Junction ID: NCE-042-ALPHA</h2>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950" />
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
              </div>
           </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
