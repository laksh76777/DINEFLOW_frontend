import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Utensils, Bell, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-stone-950 flex justify-center selection:bg-orange-500 selection:text-white">
      {/* Mobile viewport constraint */}
      <div className="w-full max-w-md min-h-screen bg-stone-900/40 border-x border-stone-800/60 flex flex-col relative shadow-2xl">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/80 px-4 py-3 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-950/50">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-100 tracking-tight flex items-center gap-1.5">
                <span>DineFlow</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-orange-500/20 text-orange-400 rounded-full font-mono">
                  Guest
                </span>
              </div>
              <p className="text-[10px] text-stone-400 truncate max-w-[150px]">
                Saffron & Sage Bistro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm" dot>
              Table 07
            </Badge>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-24 overflow-y-auto">
          <Outlet />
        </main>

        {/* Subtle Ambient Footer indicator */}
        <footer className="fixed bottom-0 max-w-md w-full z-30 bg-stone-950/90 backdrop-blur-xl border-t border-stone-800/80 px-4 py-2 text-center text-[10px] text-stone-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Table Session #8291
          </span>
          <span className="text-stone-400">DineFlow Smart Dining</span>
        </footer>
      </div>
    </div>
  );
};
