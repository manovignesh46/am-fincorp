import React, { useState, useRef, useEffect } from 'react';
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
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface MenuItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const MenuItem = ({ to, icon: Icon, label, onClick }: MenuItemProps) => (
  <NavLink to={to} onClick={onClick}>
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

/** Minimum horizontal swipe distance (px) to trigger open/close */
const SWIPE_THRESHOLD = 48;
/** Touch must start within this fraction of screen width to open the sidebar */
const EDGE_ZONE_FRACTION = 0.25;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path || path === 'dashboard') return 'Overview';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Close sidebar automatically on route change (mobile UX)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
  };

  // Detect open-swipe early in onTouchMove so it fires BEFORE the browser can
  // hijack the gesture for DataTable horizontal scroll (which would fire touchcancel
  // instead of touchend, making onTouchEnd-based detection miss the swipe on list pages).
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    touchCurrentX.current = currentX;
    const deltaX = currentX - touchStartX.current;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    const screenWidth = window.innerWidth;
    // Open sidebar: swipe right, mostly horizontal, started in left edge zone
    if (!sidebarOpen && deltaX > SWIPE_THRESHOLD && deltaX > deltaY * 1.2 &&
        touchStartX.current < screenWidth * EDGE_ZONE_FRACTION) {
      setSidebarOpen(true);
      touchStartX.current = null;
      touchStartY.current = null;
      touchCurrentX.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    const deltaX = endX - touchStartX.current;
    // Close sidebar on swipe left (touchEnd is reliable when sidebar is open
    // because the DataTable is behind the backdrop and can't intercept)
    if (sidebarOpen && deltaX < -SWIPE_THRESHOLD && Math.abs(deltaX) > endY) {
      setSidebarOpen(false);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchCurrentX.current = null;
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-[var(--color-bg-app)]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Mobile backdrop overlay ── */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-20 md:hidden transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside className={cn(
        // Shared styles
        'flex flex-col h-full bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] transition-transform duration-300 ease-in-out z-30',
        // Desktop: static in flow, always visible
        'md:relative md:w-64 md:translate-x-0 md:shadow-none',
        // Mobile: fixed, slides in from left
        'fixed top-0 left-0 w-72 shadow-2xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="p-6">
          {/* Logo row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center text-white font-bold text-lg shrink-0">
                AM
              </div>
              <span className="font-bold text-lg tracking-tight text-[var(--color-text-main)]">AM-Fincorp</span>
            </div>
            {/* Close button — mobile only */}
            <button
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            <MenuItem to="/dashboard"         icon={LayoutDashboard} label="Dashboard"    onClick={() => setSidebarOpen(false)} />
            <MenuItem to="/loans"             icon={BadgeDollarSign} label="Loans"         onClick={() => setSidebarOpen(false)} />
            <MenuItem to="/chitfunds"         icon={Coins}           label="Chit Funds"    onClick={() => setSidebarOpen(false)} />
            <MenuItem to="/chitfund-templates" icon={LayoutTemplate}  label="CF Templates" onClick={() => setSidebarOpen(false)} />
            <MenuItem to="/members"           icon={Users}           label="Members"       onClick={() => setSidebarOpen(false)} />
            <MenuItem to="/transactions"      icon={ArrowLeftRight}  label="Transactions"  onClick={() => setSidebarOpen(false)} />
          </nav>
        </div>

        {/* User card */}
        <div className="mt-auto p-4 m-2 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-white shadow-sm shrink-0">
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white border-b border-[var(--color-border)] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base md:text-lg font-bold text-[var(--color-text-main)]">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Search — hidden on small mobile, visible sm+ */}
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 w-36 md:w-48 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white transition-all outline-none text-xs font-medium"
              />
            </div>

            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page content */}
        {/*
          Two-div scroll fix:
          - `main` is the VERTICAL scroll container (overflow-y-auto only).
          - The inner clip div (overflow-x-hidden, NOT a scroll container) truly clips
            horizontal overflow. Mobile browsers cannot bypass overflow-x-hidden on a
            non-scroll-container, so horizontal page-pan is impossible.
          - DataTable's own overflow-x-auto still works inside this clip.
        */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
