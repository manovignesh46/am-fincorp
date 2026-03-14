import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BadgeDollarSign,
  Coins,
  LayoutTemplate,
  ArrowLeftRight,
  LogOut,
  UserCircle,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface MenuItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const MenuItem = ({ to, icon: Icon, label }: MenuItemProps) => (
  <NavLink to={to}>
    {({ isActive }) => (
      <div className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm',
        isActive
          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-blue-100 shadow-sm'
          : 'text-[var(--color-text-muted)] hover:bg-slate-100 hover:text-[var(--color-text-main)]'
      )}>
        <Icon size={18} className={cn('transition-colors', isActive ? 'text-[var(--color-primary)]' : 'text-slate-400 group-hover:text-slate-600')} />
        <span className="flex-1">{label}</span>
      </div>
    )}
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path || path === 'dashboard') return 'Overview';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-app)]">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col h-full bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center text-white font-bold text-lg">
              AM
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--color-text-main)]">AM-Fincorp</span>
          </div>

          <nav className="space-y-1">
            <MenuItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <MenuItem to="/loans" icon={BadgeDollarSign} label="Loans" />
            <MenuItem to="/chitfunds" icon={Coins} label="Chit Funds" />
            <MenuItem to="/chitfund-templates" icon={LayoutTemplate} label="CF Templates" />
            <MenuItem to="/members" icon={Users} label="Members" />
            <MenuItem to="/transactions" icon={ArrowLeftRight} label="Transactions" />
          </nav>
        </div>

        <div className="mt-auto p-4 m-2 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-white shadow-sm">
              <UserCircle size={28} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all text-xs font-bold"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-8 flex items-center justify-between bg-white border-b border-[var(--color-border)] sticky top-0 z-10">
          <h1 className="text-lg font-bold text-[var(--color-text-main)]">{getPageTitle()}</h1>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 w-48 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white transition-all outline-none text-xs font-medium"
              />
            </div>

            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
