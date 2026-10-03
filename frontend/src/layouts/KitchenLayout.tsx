import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ChefHat, Maximize2, Minimize2, ArrowLeft, Clock, LogOut } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';

export const KitchenLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Signed Out', 'Kitchen KDS session ended.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#070605] text-stone-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* High-visibility Kitchen Top Header */}
      <header className="bg-stone-950 border-b border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors"
            title="Return to Home Portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-950/40">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white font-mono">
                  DINEFLOW KDS
                </h1>
                <Badge variant="station" size="sm" dot>
                  {user?.station || 'Main Kitchen'}
                </Badge>
              </div>
              <p className="text-xs text-stone-400">
                Chef: <strong className="text-stone-200">{user?.name || 'Chef Vikram'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 font-mono text-xs text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-stone-900 hover:bg-rose-950/40 text-stone-400 hover:text-rose-400 border border-stone-800 transition-colors text-xs"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main KDS viewport */}
      <main className="flex-1 p-3 sm:p-5 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};
