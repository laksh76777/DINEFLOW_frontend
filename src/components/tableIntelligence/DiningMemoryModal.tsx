import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Share2, Copy, Check, Heart, Award, Utensils } from 'lucide-react';
import { DiningMemoryData } from '../../services/sessionService';

interface DiningMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: DiningMemoryData | null;
}

export const DiningMemoryModal: React.FC<DiningMemoryModalProps> = ({
  isOpen,
  onClose,
  memory,
}) => {
  const [copied, setCopied] = useState(false);

  if (!memory) return null;

  const handleCopy = () => {
    const text = `🍽️ Our Rasrang Dining Memory
Table ${memory.tableNumber} • ${new Date(memory.date).toLocaleDateString()}
Dishes Enjoyed:
${memory.dishesEnjoyed.map((d) => `• ${d.quantity}x ${d.name}`).join('\n')}
Total: ₹${memory.totalAmount.toFixed(2)}
Thank you for dining with Rasrang!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#211d1a]/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#fffdfa] rounded-3xl shadow-2xl border border-[#ecd7b7] overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header Graphic */}
            <div className="p-8 text-center bg-gradient-to-b from-[#fef7ee] via-[#fffbf4] to-[#fffdfa] border-b border-[#ecd7b7]/60 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[#786c5e] hover:text-[#211d1a] hover:bg-[#ecd7b7]/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] text-[#b45309] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md border border-[#ecd7b7]">
                <Sparkles className="w-7 h-7" />
              </div>

              <span className="text-[11px] uppercase tracking-widest text-[#d97706] font-bold block mb-1">
                Your Dining Memory
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#211d1a]">
                {memory.restaurantName || 'Rasrang'}
              </h3>
              <p className="text-xs text-[#786c5e] font-serif italic">
                {memory.tagline || 'Modern Indian Dining'}
              </p>
              <div className="mt-2 text-xs font-semibold text-[#5c5246] inline-block bg-white px-3 py-1 rounded-full border border-[#ecd7b7]">
                Table {memory.tableNumber} • {new Date(memory.date).toLocaleDateString()}
              </div>
            </div>

            {/* Dishes list */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#786c5e] uppercase tracking-wider mb-2.5">
                  Tonight You Enjoyed ({memory.dishesCount} items)
                </h4>
                <div className="space-y-2">
                  {memory.dishesEnjoyed.map((dish, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl border border-[#ecd7b7]/70 shadow-sm flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#fef3c7] text-[#92400e] font-bold flex items-center justify-center text-[11px] shrink-0">
                          {dish.quantity}
                        </span>
                        <span className="font-serif font-bold text-[#211d1a] truncate">
                          {dish.name}
                        </span>
                      </div>
                      <span className="font-semibold text-[#b45309] shrink-0">
                        ₹{(dish.price * dish.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-4 bg-[#faf6ee] rounded-2xl border border-[#ecd7b7]/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#786c5e]">
                  <span>Subtotal</span>
                  <span>₹{memory.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#786c5e]">
                  <span>Taxes & Service Charge</span>
                  <span>₹{(memory.tax + memory.serviceCharge).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-[#211d1a] text-sm pt-2 border-t border-[#ecd7b7]/60">
                  <span>Total Settled</span>
                  <span className="text-[#b45309]">₹{memory.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center py-2 text-xs italic text-[#786c5e] font-serif">
                "{memory.thankYouMessage}"
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[#ecd7b7]/50 bg-[#fffdfa] flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 px-4 bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#ecd7b7] transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#d97706]" />}
                <span>{copied ? 'Copied Memory' : 'Copy Summary'}</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Done</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
