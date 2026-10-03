import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Leaf, Flame, Salad, UtensilsCrossed, CircleDollarSign, Check } from 'lucide-react';
import { DiningPreferences } from '../../services/sessionService';

interface TasteJourneyBarProps {
  preferences: DiningPreferences;
  onTogglePreference: (key: keyof DiningPreferences) => void;
}

export const TasteJourneyBar: React.FC<TasteJourneyBarProps> = ({
  preferences,
  onTogglePreference,
}) => {
  const options: Array<{
    key: keyof DiningPreferences;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    { key: 'vegetarian', label: 'Vegetarian', icon: <Leaf className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    { key: 'spicy', label: 'Spicy', icon: <Flame className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-800 border-red-300' },
    { key: 'light', label: 'Light', icon: <Salad className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-800 border-blue-300' },
    { key: 'filling', label: 'Hearty & Filling', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-800 border-amber-300' },
    { key: 'budgetFriendly', label: 'Budget Friendly', icon: <CircleDollarSign className="w-3.5 h-3.5" />, color: 'bg-stone-50 text-stone-800 border-stone-300' },
    { key: 'chefsPick', label: "Chef's Pick", icon: <Sparkles className="w-3.5 h-3.5" />, color: 'bg-purple-50 text-purple-800 border-purple-300' },
  ];

  const activeCount = Object.values(preferences || {}).filter(Boolean).length;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-[#ecd7b7]/60 rounded-2xl p-3 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
          <span className="text-xs font-semibold text-[#211d1a] uppercase tracking-wider">
            Taste Journey
          </span>
          <span className="text-[11px] text-[#786c5e] font-normal">
            — What are you in the mood for?
          </span>
        </div>
        {activeCount > 0 && (
          <span className="text-[11px] font-semibold text-[#d97706] bg-[#fef3c7] px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {options.map((opt) => {
          const isActive = !!preferences[opt.key];
          return (
            <button
              key={opt.key}
              onClick={() => onTogglePreference(opt.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isActive
                  ? `${opt.color} shadow-sm font-semibold ring-1 ring-offset-1 ring-[#d97706]/30`
                  : 'bg-[#faf6ee] text-[#5c5246] border-[#ecd7b7]/60 hover:bg-[#f3ede0]'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {isActive && <Check className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
