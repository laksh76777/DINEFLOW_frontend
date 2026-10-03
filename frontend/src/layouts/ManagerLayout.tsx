import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Layers,
  UtensilsCrossed,
  Clock,
  BellRing,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Bell,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';

export const ManagerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info('Signed Out', 'You have been signed out of Manager Dashboard.');
    navigate('/login');
  };

  const navItems = [
    { label: 'Floor Operations', to: '/manager', icon: Layers },
    { label: 'Order Monitor', to: '/manager/orders', icon: Clock },
    { label: 'Menu Availability (86)', to: '/manager/menu', icon: UtensilsCrossed },
    { label: 'Live Floor Grid', to: '/manager/floor', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#211d1a] flex font-sans">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#211d1a]/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#e9e3dc] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-[#e9e3dc] flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#3974b9] flex items-center justify-center text-white shadow-md shadow-[#3974b9]/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#211d1a] flex items-center gap-1.5">
                <span>DineFlow</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#eaf2fb] text-[#3974b9] rounded-md font-mono border border-[#bfdbfe] font-bold">
                  MANAGER
                </span>
              </div>
              <p className="text-xs text-[#7b726a] truncate max-w-[130px]">
                Floor Shift
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#7b726a] hover:text-[#211d1a] p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager Chip */}
        <div className="px-4 pt-3 pb-1">
          <div className="p-2.5 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#eaf2fb] text-[#3974b9] font-extrabold text-xs flex items-center justify-center">
              MS
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#211d1a] truncate">Meera Shah</div>
              <div className="text-[10px] text-[#7b726a]">Floor Operations Lead</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#7b726a]">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/manager'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#eaf2fb] text-[#3974b9] font-bold border border-[#bfdbfe] shadow-xs'
                      : 'text-[#7b726a] hover:text-[#211d1a] hover:bg-[#f5f1ec]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#e9e3dc] bg-[#fbf9f6] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#eaf2fb] text-[#3974b9] font-extrabold text-xs flex items-center justify-center">
                {(user?.name || 'Meera Shah').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#211d1a] truncate">{user?.name || 'Meera Shah'}</div>
                <div className="text-[10px] text-[#7b726a] truncate">Shift Manager</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#7b726a] hover:text-[#c54e4a] hover:bg-[#fde8e8] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => navigate('/owner')}
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-[#f5f1ec] text-[#49423c] border border-[#e9e3dc] text-center transition-colors font-medium shadow-2xs"
            >
              Owner
            </button>
            <button
              onClick={() => navigate('/kitchen')}
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-[#f5f1ec] text-[#49423c] border border-[#e9e3dc] text-center transition-colors font-medium shadow-2xs"
            >
              Kitchen
            </button>
            <button
              onClick={() => navigate('/waiter')}
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-[#f5f1ec] text-[#49423c] border border-[#e9e3dc] text-center transition-colors font-medium shadow-2xs"
            >
              Waiter
            </button>
            <button
              onClick={() => navigate('/customer')}
              className="px-2 py-1.5 rounded-lg bg-[#fff4ef] hover:bg-[#ffe5da] text-[#be4d27] border border-[#ffc9b5] text-center transition-colors font-bold shadow-2xs"
            >
              Customer QR
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e9e3dc] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#7b726a] hover:text-[#211d1a] hover:bg-[#f5f1ec]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#7b726a]">
              <span>Manager Console</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#d7cec4]" />
              <span className="text-[#211d1a] font-bold">Live Floor Command</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge variant="success" size="sm" dot>
              Floor Active
            </Badge>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-[#fde8e8] border border-[#e9e3dc] hover:border-[#fca5a5] text-xs font-semibold text-[#7b726a] hover:text-[#c54e4a] transition-colors shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
