import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  Users,
  Receipt,
  Sparkles,
  Settings,
  ChevronRight,
  Flame,
  Menu,
  X,
  Store,
  Layers,
  LogOut,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';

export const OwnerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info('Signed Out', 'You have been safely signed out of Owner Console.');
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/owner', icon: LayoutDashboard },
    { label: 'Live Floor', to: '/owner/floor', icon: Layers },
    { label: 'Menu & Dishes', to: '/owner/menu', icon: UtensilsCrossed },
    { label: 'Tables & QRs', to: '/owner/tables', icon: QrCode },
    { label: 'Kitchen Stations', to: '/owner/stations', icon: Flame },
    { label: 'Staff & Roles', to: '/owner/staff', icon: Users },
    { label: 'Billing & Invoices', to: '/owner/invoices', icon: Receipt },
    { label: 'AI Operations', to: '/owner/ai', icon: Sparkles },
    { label: 'Settings', to: '/owner/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-stone-950 border-r border-stone-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-800/80 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-950/50">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>DineFlow</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-md font-mono border border-orange-500/30">
                  OWNER
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate max-w-[130px]">
                Saffron & Sage
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/owner'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-950/40 font-semibold'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Laksh Sharma'}</div>
              <div className="text-[10px] text-stone-400 truncate">{user?.email || 'owner@dineflow.com'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] font-semibold uppercase text-stone-400 mb-1 tracking-wider">
            Quick Switch Portal
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => navigate('/manager')}
              className="px-2 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-center transition-colors"
            >
              Manager
            </button>
            <button
              onClick={() => navigate('/kitchen')}
              className="px-2 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-center transition-colors"
            >
              Kitchen
            </button>
            <button
              onClick={() => navigate('/waiter')}
              className="px-2 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-center transition-colors"
            >
              Waiter
            </button>
            <button
              onClick={() => navigate('/customer')}
              className="px-2 py-1.5 rounded-lg bg-orange-950/60 hover:bg-orange-900/80 text-orange-300 border border-orange-800/50 text-center transition-colors font-medium"
            >
              Customer QR
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
              <span>Owner Console</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
              <span className="text-stone-200 font-medium">Single Restaurant System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="brand" size="sm" dot>
              Live Restaurant Node
            </Badge>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
