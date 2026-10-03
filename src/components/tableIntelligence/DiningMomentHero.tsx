import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { DiningMoment } from '../../services/diningMomentService';
import { MenuItem } from '../../services/menuService';

interface DiningMomentHeroProps {
  moments: DiningMoment[];
  onOpenDishStory: (dish: MenuItem) => void;
  onAddToCart: (dish: MenuItem) => void;
}

export const DiningMomentHero: React.FC<DiningMomentHeroProps> = ({
  moments,
  onOpenDishStory,
  onAddToCart,
}) => {
  if (!moments || moments.length === 0) return null;

  const currentMoment = moments[0]; // Active moment

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-lg mb-6 border border-[#ecd7b7]/80 bg-[#211d1a]">
      {/* Background Image with warm gradient overlay */}
      <img
        src={currentMoment.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'}
        alt={currentMoment.title}
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 transition-transform duration-700 hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1815] via-[#211d1a]/80 to-transparent" />

      {/* Content */}
      <div className="relative p-6 sm:p-8 flex flex-col justify-end min-h-[220px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d97706] text-white shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>{currentMoment.badge || "Tonight's Special"}</span>
          </span>
          <span className="text-xs text-[#ecd7b7] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Limited Batch Experience</span>
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2 tracking-wide">
          {currentMoment.title}
        </h3>

        <p className="text-xs sm:text-sm text-[#e8ded1] max-w-xl line-clamp-2 mb-4 leading-relaxed">
          {currentMoment.description}
        </p>

        {/* Featured items in this moment */}
        {currentMoment.menuItemIds && currentMoment.menuItemIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
            {currentMoment.menuItemIds.map((item: any) => {
              if (!item || !item.name) return null;
              return (
                <div
                  key={item._id}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs text-white"
                >
                  <span className="font-serif font-medium">{item.name}</span>
                  <span className="text-[#fde68a] font-bold">₹{item.price?.toFixed(2)}</span>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="p-1 bg-[#d97706] hover:bg-[#b45309] rounded-md transition-colors"
                    title="Add to Round"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
