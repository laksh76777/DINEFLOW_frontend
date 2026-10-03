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
    <div className="min-h-screen bg-[#f5f1ec] text-[#211d1a] flex flex-col font-sans">
      {/* High-visibility Kitchen Top Header */}
      <header className="bg-white border-b border-[#e9e3dc] px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-[#fbf9f6] hover:bg-[#f5f1ec] text-[#7b726a] hover:text-[#211d1a] border border-[#e9e3dc] transition-colors"
            title="Return to Home Portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d96236] flex items-center justify-center text-white shadow-md shadow-[#d96236]/25">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-[#211d1a] font-mono">
                  DINEFLOW KDS
                </h1>
                <Badge variant="station" size="sm" dot>
                  {user?.station || 'Main Kitchen'}
                </Badge>
              </div>
              <p className="text-xs text-[#7b726a]">
                Chef: <strong className="text-[#211d1a]">{user?.name || 'Chef Vikram'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Center Live Clock */}
        <div className="hidden md:flex items-center gap-2 bg-[#fbf9f6] border border-[#e9e3dc] px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-[#49423c] shadow-2xs">
          <Clock className="w-4 h-4 text-[#d96236]" />
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#fbf9f6] hover:bg-[#f5f1ec] border border-[#e9e3dc] text-[#7b726a] hover:text-[#211d1a] transition-colors shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#fde8e8] border border-[#e9e3dc] hover:border-[#fca5a5] text-xs font-semibold text-[#7b726a] hover:text-[#c54e4a] transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* KDS Main Canvas */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-[1920px] w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
