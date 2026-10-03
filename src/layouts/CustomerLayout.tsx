import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Utensils, DoorOpen, AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../components/ui';
import { sessionService } from '../services/sessionService';
import { toast } from '../stores/useToastStore';

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const [tableNum, setTableNum] = useState<string>(() => localStorage.getItem('dineflow_table_number') || '');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState<boolean>(false);

  useEffect(() => {
    const updateTableNum = () => {
      const stored = localStorage.getItem('dineflow_table_number');
      if (stored !== tableNum) {
        setTableNum(stored || '');
      }
    };
    
    // Check immediately and on storage event
    updateTableNum();
    window.addEventListener('storage', updateTableNum);
    // Interval check in case it's updated in the same window without dispatching storage event
    const interval = setInterval(updateTableNum, 800);
    return () => {
      window.removeEventListener('storage', updateTableNum);
      clearInterval(interval);
    };
  }, [tableNum]);

  const handleConfirmLeave = async () => {
    setIsSubmittingLeave(true);
    const sessionId = localStorage.getItem('dineflow_active_session');
    const memberId = localStorage.getItem('dineflow_member_id');

    if (sessionId) {
      try {
        await sessionService.leaveOrCloseSession(
          sessionId,
          memberId || undefined,
          'Customer left without ordering'
        );
      } catch (err: any) {
        if (err.hasActiveOrders) {
          toast.error(
            'Active Orders In Kitchen',
            'You have orders in preparation. Please settle with steward or cashier before leaving.'
          );
          setIsSubmittingLeave(false);
          setIsLeaveModalOpen(false);
          return;
        }
        console.warn('Leave session error (proceeding with clean local release):', err);
      }
    }

    // Clean up local storage
    localStorage.removeItem('dineflow_active_session');
    localStorage.removeItem('dineflow_table_number');
    localStorage.removeItem('dineflow_session_number');
    localStorage.removeItem('dineflow_member_id');
    localStorage.removeItem('dineflow_member_name');
    localStorage.removeItem('dineflow_qr_token');
    localStorage.removeItem('dineflow_cart');
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('dineflow_temp_member_') || key.startsWith('dineflow_name_')) {
        localStorage.removeItem(key);
      }
    });

    setTableNum('');
    setIsSubmittingLeave(false);
    setIsLeaveModalOpen(false);
    toast.success('Session Ended', `Table ${tableNum || ''} released. Thank you for visiting Rasrang!`);
    navigate('/');
  };

  const displayTable = tableNum
    ? tableNum.toUpperCase().startsWith('T')
      ? `#${tableNum.substring(1)}`
      : `#${tableNum}`
    : 'Preview';

  return (
    <div className="min-h-screen bg-[#f5f1ec] md:py-6 flex justify-center selection:bg-[#d97706] selection:text-white font-sans">
      {/* Mobile viewport constraint / Phone frame */}
      <div className="w-full max-w-md min-h-screen md:min-h-[840px] md:max-h-[920px] bg-[#fffdfa] md:border-8 md:border-[#211d1a] md:rounded-[40px] flex flex-col relative shadow-[0_24px_60px_rgba(43,31,24,0.14)] overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ecd7b7] px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            {/* Top Left: Leave Table Button */}
            {tableNum && (
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fde8e8] hover:bg-[#fed7d7] text-[#c54e4a] border border-[#fca5a5] text-[11px] font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                title="Leave table without ordering & release seat"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Leave Table</span>
              </button>
            )}

            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group min-w-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] flex items-center justify-center text-white shadow-sm shadow-[#d97706]/25 shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-[#211d1a] tracking-tight flex items-center gap-1.5">
                  <span>DineSetu</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#fff7ed] text-[#b45309] rounded-full font-mono font-bold border border-[#fde68a]">
                    Guest
                  </span>
                </div>
                <p className="text-[10px] text-[#786c5e] font-medium truncate max-w-[90px] sm:max-w-[120px]">
                  Rasrang
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-end border-l border-[#ecd7b7] pl-2.5">
              <span className="text-[8px] uppercase tracking-wider text-[#786c5e] font-bold">Table</span>
              <strong className="text-xs font-black text-[#b45309]">
                {displayTable}
              </strong>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Subtle Ambient Footer indicator */}
        <footer className="bg-white/95 backdrop-blur-md border-t border-[#ecd7b7] px-4 py-2 text-center text-[10px] text-[#786c5e] flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            {tableNum ? `Table ${tableNum} Session Active` : 'Browse Mode Active'}
          </span>
          <span className="text-[#a89d91] font-mono text-[9px]">DineSetu Table Intelligence</span>
        </footer>
      </div>

      {/* Leave Table Confirmation Modal */}
      {isLeaveModalOpen && (
        <Modal
          isOpen={isLeaveModalOpen}
          onClose={() => !isSubmittingLeave && setIsLeaveModalOpen(false)}
          title="Leave Table & End Session"
          size="sm"
        >
          <div className="space-y-4 text-[#211d1a] font-sans">
            <div className="p-4 rounded-xl bg-[#fff8e7] border border-[#fed7aa] flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fff4ef] text-[#d96236] border border-[#ffc9b5] flex items-center justify-center shrink-0">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <strong className="font-bold text-[#211d1a] block">
                  Leave Table {displayTable} without ordering?
                </strong>
                <p className="text-[#786c5e] mt-1 leading-relaxed">
                  If you browsed the menu and decided not to order anything today, leaving will immediately end your dining session and make this table available for other waiting guests.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#786c5e]">
              Any unplaced items in your order tray will be discarded. Are you sure you wish to leave?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e9e3dc]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={isSubmittingLeave}
              >
                Stay & Browse
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmLeave}
                disabled={isSubmittingLeave}
                className="bg-[#c54e4a] hover:bg-[#b0403c] border-[#b0403c] text-white flex items-center gap-1.5"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>{isSubmittingLeave ? 'Releasing Table...' : 'Yes, Leave Table'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerLayout;
