import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ConciergeBell, ArrowLeft, LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-xl border-b border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <ConciergeBell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>DineFlow</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md font-mono border border-emerald-500/30">
                  WAITER
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Server: <strong className="text-stone-200">{user?.name || 'Priya Patel'}</strong>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Waiter Floor Service Viewport */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
