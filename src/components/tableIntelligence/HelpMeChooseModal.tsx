import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X, Sparkles, Check, ShoppingBag, Heart, Flame, Leaf, Clock, Users, ArrowRight } from 'lucide-react';
import { menuService, MenuItem } from '../../services/menuService';

interface HelpMeChooseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: MenuItem) => void;
  onAddToIdeas: (dish: MenuItem) => void;
}

export const HelpMeChooseModal: React.FC<HelpMeChooseModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onAddToIdeas,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(['Vegetarian', 'Quick']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ dish: MenuItem; matchReason: string; score: number }>>([]);
  const [hasQueried, setHasQueried] = useState(false);

  const availableTags = [
    { label: 'Vegetarian', icon: <Leaf className="w-3.5 h-3.5 text-emerald-600" /> },
    { label: 'Quick', icon: <Clock className="w-3.5 h-3.5 text-blue-600" /> },
    { label: 'Spicy', icon: <Flame className="w-3.5 h-3.5 text-red-600" /> },
    { label: 'Light', icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" /> },
    { label: 'Filling', icon: <Sparkles className="w-3.5 h-3.5 text-orange-600" /> },
    { label: 'For Sharing', icon: <Users className="w-3.5 h-3.5 text-indigo-600" /> },
    { label: "Chef's Pick", icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" /> },
    { label: 'Under ₹300', icon: <Sparkles className="w-3.5 h-3.5 text-stone-600" /> },
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDiscover = async () => {
    try {
      setLoading(true);
      const data = await menuService.helpMeChoose(selectedTags);
      setResults(data?.matches || []);
      setHasQueried(true);
    } catch (err) {
      console.error('Failed to discover matches:', err);
    } finally {
      setLoading(false);
    }
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
            className="fixed inset-0 bg-[#211d1a]/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg bg-[#fffdfa] rounded-3xl shadow-2xl border border-[#ecd7b7]/70 overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#ecd7b7]/50 bg-gradient-to-r from-[#fff9f0] via-[#fef7ee] to-[#fffdfa] flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fef3c7] to-[#fde68a] text-[#d97706] flex items-center justify-center shadow-sm">
                  <Compass className="w-6 h-6 text-[#b45309]" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#211d1a]">Help Me Choose</h3>
                  <p className="text-xs text-[#786c5e]">
                    Guided culinary discovery from Rasrang's kitchen
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

            {/* Filter selection content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#211d1a] uppercase tracking-wider mb-2.5">
                  What are you looking for today?
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.label);
                    return (
                      <button
                        key={tag.label}
                        onClick={() => toggleTag(tag.label)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#d97706] text-white border-[#d97706] shadow-sm'
                            : 'bg-white text-[#5c5246] border-[#ecd7b7] hover:bg-[#fbf7f0]'
                        }`}
                      >
                        {tag.icon}
                        <span>{tag.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleDiscover}
                disabled={loading || selectedTags.length === 0}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Finding Best Pairings...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Discover 3–5 Matching Dishes</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Results List */}
              {hasQueried && (
                <div className="space-y-3 pt-2 border-t border-[#ecd7b7]/40">
                  <h4 className="text-xs font-bold text-[#211d1a] uppercase tracking-wider flex items-center justify-between">
                    <span>Curated Pairings ({results.length})</span>
                    <span className="text-[11px] font-normal text-[#786c5e]">
                      Ranked from actual restaurant menu
                    </span>
                  </h4>

                  {results.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#786c5e]">
                      No exact matches found for this combination. Try selecting fewer filters.
                    </div>
                  ) : (
                    results.map(({ dish, matchReason }) => (
                      <div
                        key={dish._id}
                        className="p-4 bg-white rounded-2xl border border-[#ecd7b7]/80 shadow-sm flex flex-col gap-3 hover:border-[#d97706]/40 transition-all"
                      >
                        <div className="flex items-start gap-3.5">
                          <img
                            src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                            alt={dish.name}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#ecd7b7]/40"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  dish.foodType === 'NON_VEG' ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                              />
                              <h5 className="font-serif font-bold text-sm text-[#211d1a] truncate">
                                {dish.name}
                              </h5>
                            </div>
                            <p className="text-xs text-[#786c5e] line-clamp-2 mb-2">
                              {dish.description}
                            </p>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] text-[11px] font-medium">
                              <Sparkles className="w-3 h-3 text-[#d97706]" />
                              <span>{matchReason}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#f5f1ea]">
                          <span className="text-sm font-bold text-[#b45309]">
                            ₹{dish.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onAddToIdeas(dish);
                              }}
                              className="px-3 py-1.5 bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Heart className="w-3.5 h-3.5 text-[#d97706]" />
                              <span>Ideas</span>
                            </button>
                            <button
                              onClick={() => {
                                onAddToCart(dish);
                              }}
                              className="px-3.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Round</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
