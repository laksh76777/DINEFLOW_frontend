import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Utensils, Bell } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f1ec] md:py-6 flex justify-center selection:bg-[#d96236] selection:text-white font-sans">
      {/* Mobile viewport constraint / Phone frame */}
      <div className="w-full max-w-md min-h-screen md:min-h-[840px] md:max-h-[920px] bg-[#fbf9f6] md:border-8 md:border-[#211d1a] md:rounded-[40px] flex flex-col relative shadow-[0_24px_60px_rgba(43,31,24,0.14)] overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e9e3dc] px-4 py-3 flex items-center justify-between shadow-2xs">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#d96236] flex items-center justify-center text-white shadow-sm shadow-[#d96236]/25">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-[#211d1a] tracking-tight flex items-center gap-1.5">
                <span>DineFlow</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#fff4ef] text-[#be4d27] rounded-full font-mono font-bold border border-[#ffc9b5]">
                  Guest
                </span>
              </div>
              <p className="text-[10px] text-[#7b726a] truncate max-w-[130px]">
                Saffron & Sage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end border-l border-[#e9e3dc] pl-2.5">
              <span className="text-[8px] uppercase tracking-wider text-[#7b726a] font-bold">Table</span>
              <strong className="text-xs font-black text-[#211d1a]">#07</strong>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Subtle Ambient Footer indicator */}
        <footer className="bg-white/95 backdrop-blur-md border-t border-[#e9e3dc] px-4 py-2 text-center text-[10px] text-[#7b726a] flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#23865b] animate-pulse" />
            Table Session Active
          </span>
          <span className="text-[#a89d91] font-mono text-[9px]">DineFlow Smart Dining</span>
        </footer>
      </div>
    </div>
  );
};
