import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ConciergeBell, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';

export const WaiterLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info('Signed Out', 'Waiter service session closed.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#211d1a] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e9e3dc] px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-[#fbf9f6] hover:bg-[#f5f1ec] text-[#7b726a] hover:text-[#211d1a] border border-[#e9e3dc] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#23865b] flex items-center justify-center text-white shadow-md shadow-[#23865b]/25">
              <ConciergeBell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-[#211d1a] flex items-center gap-1.5">
                <span>DineFlow</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#e8f6ef] text-[#23865b] rounded-md font-mono border border-[#a5d8be] font-bold">
                  WAITER
                </span>
              </div>
              <p className="text-[11px] text-[#7b726a]">
                Server: <strong className="text-[#211d1a]">{user?.name || 'Riya Sharma'}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" size="sm" dot>
            Floor Active
          </Badge>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#fde8e8] border border-[#e9e3dc] hover:border-[#fca5a5] text-xs font-semibold text-[#7b726a] hover:text-[#c54e4a] transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Waiter Body */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
