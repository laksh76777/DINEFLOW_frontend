import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, CheckCircle2, ChefHat, Sparkles, Utensils, Receipt, ArrowRight } from 'lucide-react';
import { TablePulseEvent } from '../../services/sessionService';

interface TablePulseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pulseEvents: TablePulseEvent[];
  tableNumber: string;
  sessionNumber: string;
}

export const TablePulseModal: React.FC<TablePulseModalProps> = ({
  isOpen,
  onClose,
  pulseEvents,
  tableNumber,
  sessionNumber,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#211d1a]/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-md bg-[#fffdfa] rounded-3xl shadow-2xl border border-[#ecd7b7]/70 overflow-hidden z-10 flex flex-col max-h-[88vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#ecd7b7]/50 bg-gradient-to-r from-[#fff9f0] via-[#fef7ee] to-[#fffdfa] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-[#b45309]" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#211d1a]">Table Pulse</h3>
                  <p className="text-xs text-[#786c5e]">
                    Live dining timeline for Table {tableNumber || '07'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#786c5e] hover:text-[#211d1a] hover:bg-[#ecd7b7]/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="relative pl-6 border-l-2 border-[#ecd7b7] space-y-6">
                {pulseEvents && pulseEvents.length > 0 ? (
                  pulseEvents.map((evt, idx) => {
                    const isLast = idx === pulseEvents.length - 1;
                    const dateObj = new Date(evt.timestamp);
                    const timeStr = isNaN(dateObj.getTime())
                      ? 'Just now'
                      : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={evt.id || idx} className="relative">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                            evt.status === 'COMPLETED'
                              ? 'bg-[#d97706]'
                              : evt.status === 'IN_PROGRESS'
                              ? 'bg-amber-400 animate-ping'
                              : 'bg-[#ecd7b7]'
                          } shadow-sm`}
                        />

                        <div className="bg-white p-3.5 rounded-2xl border border-[#ecd7b7]/70 shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-serif font-bold text-sm text-[#211d1a]">
                              {evt.title}
                            </h4>
                            <span className="text-[11px] font-semibold text-[#b45309] bg-[#fef3c7] px-2 py-0.5 rounded-md shrink-0">
                              {timeStr}
                            </span>
                          </div>
                          <p className="text-xs text-[#5c5246] leading-relaxed">
                            {evt.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-[#786c5e] py-6 text-center">
                    Table session initialized. Order round events will appear here in real time.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#ecd7b7]/50 bg-[#fffdfa] flex items-center justify-between text-xs text-[#786c5e]">
              <span>Session {sessionNumber || '#8291'}</span>
              <button
                onClick={onClose}
                className="font-medium text-[#d97706] hover:underline"
              >
                Close Pulse
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
