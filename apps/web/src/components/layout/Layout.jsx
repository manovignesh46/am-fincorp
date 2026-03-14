import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BadgeDollarSign, 
  Coins, 
  ArrowLeftRight, 
  LogOut,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const MenuItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
      isActive 
        ? "bg-indigo-50 text-indigo-700 shadow-sm" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
            AM
          </div>
          <div>
            <h2 className="font-bold text-slate-900 leading-tight">AM-Fincorp</h2>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Internal Management</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <MenuItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <MenuItem to="/loans" icon={BadgeDollarSign} label="Loans" />
          <MenuItem to="/chitfunds" icon={Coins} label="Chit Funds" />
          <MenuItem to="/members" icon={Users} label="Members" />
          <MenuItem to="/transactions" icon={ArrowLeftRight} label="Transactions" />
        </nav>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <UserCircle className="text-slate-400" size={36} />
            <div className="overflow-hidden">
              <p className="font-bold text-slate-900 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">AM-Fincorp Management</h1>
          <div className="text-sm text-slate-400 font-medium">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
