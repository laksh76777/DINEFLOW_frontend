import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ShoppingBag, Trash2, Users, Sparkles, Check } from 'lucide-react';
import { TableIdeaItem } from '../../services/sessionService';

interface TableIdeasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableIdeas: TableIdeaItem[];
  onRemoveIdea: (ideaId: string) => void;
  onMoveToCart: (item: TableIdeaItem) => void;
  tableNumber: string;
  myDisplayName: string;
}

export const TableIdeasDrawer: React.FC<TableIdeasDrawerProps> = ({
  isOpen,
  onClose,
  tableIdeas,
  onRemoveIdea,
  onMoveToCart,
  tableNumber,
  myDisplayName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#211d1a]/50 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-md bg-[#fffdfa] shadow-2xl flex flex-col h-full z-10 border-l border-[#ecd7b7]/60"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#ecd7b7]/50 bg-gradient-to-r from-[#fff9f0] to-[#fffdfa] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#fef3c7] text-[#d97706] rounded-lg">
                    <Heart className="w-5 h-5 fill-[#d97706]" />
                  </span>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#211d1a]">Table Ideas</h2>
                    <p className="text-xs text-[#786c5e]">
                      Shared wishlist for Table {tableNumber || '07'} • Synced live
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#786c5e] hover:text-[#211d1a] hover:bg-[#ecd7b7]/20 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-banner info */}
            <div className="px-5 py-3 bg-[#fef7ee] border-b border-[#ecd7b7]/40 flex items-center gap-2 text-xs text-[#92400e]">
              <Users className="w-4 h-4 text-[#d97706] shrink-0" />
              <span>Dishes saved by anyone at Table {tableNumber || '07'}. Move favorites directly to the round order!</span>
            </div>

            {/* Ideas List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {tableIdeas.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-[#fef3c7] rounded-full flex items-center justify-center mx-auto mb-4 text-[#d97706]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-[#211d1a] text-base mb-1">
                    No Table Ideas Yet
                  </h3>
                  <p className="text-xs text-[#786c5e] max-w-xs mx-auto mb-4">
                    Tap the heart icon on any dish in the menu to save it here. You and your table companions can curate ideas together!
                  </p>
                </div>
              ) : (
                tableIdeas.map((idea) => (
                  <motion.div
                    key={idea.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 bg-white rounded-xl border border-[#ecd7b7]/70 shadow-sm flex items-center gap-3.5 hover:border-[#d97706]/40 transition-all"
                  >
                    <img
                      src={idea.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                      alt={idea.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-[#ecd7b7]/40"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            idea.foodType === 'NON_VEG' ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                        />
                        <h4 className="text-sm font-semibold text-[#211d1a] truncate">
                          {idea.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#b45309]">₹{idea.price.toFixed(2)}</span>
                        <span className="text-[#a89d91]">•</span>
                        <span className="text-[11px] text-[#786c5e] bg-[#f5f1ea] px-1.5 py-0.5 rounded">
                          Added by {idea.addedBy || 'Guest'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => onMoveToCart(idea)}
                        className="px-2.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                        title="Move to Order"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order</span>
                      </button>
                      <button
                        onClick={() => onRemoveIdea(idea.id)}
                        className="p-1 text-[#a89d91] hover:text-red-500 self-center transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {tableIdeas.length > 0 && (
              <div className="p-4 border-t border-[#ecd7b7]/50 bg-[#fffdfa] flex items-center justify-between text-xs text-[#786c5e]">
                <span>{tableIdeas.length} idea(s) saved for the table</span>
                <button
                  onClick={onClose}
                  className="font-medium text-[#d97706] hover:underline"
                >
                  Continue Browsing
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
