import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Utensils, ArrowRight, Plus, Heart, ShoppingBag } from 'lucide-react';
import { TableIntelligenceData } from '../../services/sessionService';
import { MenuItem } from '../../services/menuService';

interface TableIntelligenceBannerProps {
  intelligence: TableIntelligenceData | null;
  onAddToCart: (dish: MenuItem) => void;
  onAddToIdeas: (dish: MenuItem) => void;
  onSelectCategory?: (categoryName: string) => void;
  onRequestBill?: () => void;
}

export const TableIntelligenceBanner: React.FC<TableIntelligenceBannerProps> = ({
  intelligence,
  onAddToCart,
  onAddToIdeas,
  onSelectCategory,
  onRequestBill,
}) => {
  if (!intelligence) return null;

  const { diningStage, stageNudge, recommendations } = intelligence;

  const stageLabels: Record<string, string> = {
    DISCOVERY: 'Stage 1: Discovery',
    STARTERS: 'Stage 2: Appetizers & Preludes',
    MAIN_COURSE: 'Stage 3: Main Course Feast',
    DESSERT: 'Stage 4: Sweet Confections',
    BILL: 'Stage 5: Settle & Memory',
  };

  const handleNudgeAction = () => {
    if (stageNudge.actionStage === 'STARTERS' && onSelectCategory) {
      onSelectCategory('Small Plates & Appetizers');
    } else if (stageNudge.actionStage === 'MAIN_COURSE' && onSelectCategory) {
      onSelectCategory('Heritage Curries');
    } else if (stageNudge.actionStage === 'DESSERT' && onSelectCategory) {
      onSelectCategory('Decadent Desserts');
    } else if (stageNudge.actionStage === 'BILL' && onRequestBill) {
      onRequestBill();
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#fffbf4] via-[#fef7ee] to-[#fff5e8] border border-[#ecd7b7] rounded-3xl p-5 shadow-sm mb-6 relative overflow-hidden">
      {/* Decorative subtle texture */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#d97706]/10 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

      {/* Top stage pill */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d97706] animate-pulse" />
          <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-wider bg-[#fef3c7] px-2.5 py-0.5 rounded-full border border-[#ecd7b7]/60">
            {stageLabels[diningStage] || diningStage}
          </span>
        </div>
        <span className="text-[11px] text-[#786c5e] font-serif italic">
          Table Intelligence
        </span>
      </div>

      {/* Stage Nudge headline & description */}
      <div className="mb-4">
        <h4 className="font-serif font-bold text-base text-[#211d1a] mb-1 flex items-center gap-2">
          <span>{stageNudge.title}</span>
        </h4>
        <p className="text-xs text-[#5c5246] leading-relaxed max-w-xl">
          {stageNudge.message}
        </p>
      </div>

      {/* Table Context Recommendations if available */}
      {recommendations && recommendations.length > 0 && (
        <div className="pt-3 border-t border-[#ecd7b7]/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-[#211d1a] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
              Table Pairing Suggestions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recommendations.slice(0, 2).map((rec, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-[#ecd7b7]/80 flex items-center justify-between gap-3 shadow-sm hover:border-[#d97706]/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={rec.dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                    alt={rec.dish.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#ecd7b7]/40"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-[#b45309] bg-[#fef3c7] px-1.5 py-0.5 rounded">
                      {rec.badge}
                    </span>
                    <h5 className="font-serif font-bold text-xs text-[#211d1a] truncate mt-0.5">
                      {rec.dish.name}
                    </h5>
                    <p className="text-[11px] text-[#786c5e] truncate">
                      ₹{rec.dish.price?.toFixed(2)} • {rec.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onAddToIdeas(rec.dish)}
                    className="p-1.5 text-[#786c5e] hover:text-[#d97706] hover:bg-[#fef3c7] rounded-lg transition-colors"
                    title="Add to Table Ideas"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAddToCart(rec.dish)}
                    className="p-1.5 bg-[#d97706] hover:bg-[#b45309] text-white rounded-lg shadow-sm transition-colors"
                    title="Add to Round Order"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
