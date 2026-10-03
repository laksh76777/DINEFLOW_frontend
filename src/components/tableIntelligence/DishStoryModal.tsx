import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  ShoppingBag,
  Sparkles,
  Flame,
  Clock,
  ChefHat,
  MapPin,
  Utensils,
  HelpCircle,
  ShieldAlert,
  Leaf,
  Check,
} from 'lucide-react';
import { MenuItem } from '../../services/menuService';

interface DishStoryModalProps {
  dish: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: MenuItem) => void;
  onAddToIdeas: (dish: MenuItem) => void;
}

export const DishStoryModal: React.FC<DishStoryModalProps> = ({
  dish,
  isOpen,
  onClose,
  onAddToCart,
  onAddToIdeas,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  if (!dish) return null;

  // Build structured questions and answers from restaurant configured data
  const defaultQuestions = [
    {
      question: 'Is it spicy?',
      answer:
        dish.spiceLevel === 0
          ? 'Mild & gentle heat, suitable for all palates.'
          : dish.spiceLevel === 1
          ? 'Mild heat (1/3), subtly aromatic with cardamoms and toasted cumin.'
          : dish.spiceLevel === 2
          ? 'Medium heat (2/3), balanced with Kashmiri chili and velvety yogurt.'
          : 'Robust fiery heat (3/3), seasoned with stone-ground deghi mirch and black pepper.',
    },
    {
      question: 'Does it contain nuts?',
      answer:
        dish.allergens?.some((a) => a.toLowerCase().includes('nut'))
          ? 'Contains nuts (such as cashews, almonds, or pistachios) in the paste or garnish.'
          : 'No nuts are used in this recipe.',
    },
    {
      question: 'Does it contain dairy?',
      answer:
        dish.allergens?.some((a) => a.toLowerCase().includes('dairy'))
          ? 'Contains clarified butter (ghee), cultured butter, or fresh cream.'
          : 'Dairy-free recipe.',
    },
    {
      question: 'Can it be customized for less spice?',
      answer:
        'Our culinary team can adjust spice levels upon placing the round order. Simply inform your floor steward or note in your preferences.',
    },
  ];

  const questionsToUse =
    dish.customizationQuestions && dish.customizationQuestions.length > 0
      ? dish.customizationQuestions
      : defaultQuestions;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#211d1a]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-[#fffdfa] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#ecd7b7]/80 overflow-hidden z-10 flex flex-col max-h-[92vh]"
          >
            {/* Hero Image */}
            <div className="relative h-64 sm:h-72 w-full shrink-0 overflow-hidden bg-[#211d1a]">
              <img
                src={
                  dish.image ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
                }
                alt={dish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211d1a] via-transparent to-black/30" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-[#211d1a] rounded-full backdrop-blur-md shadow-md transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    dish.foodType === 'NON_VEG'
                      ? 'bg-red-500 text-white'
                      : dish.foodType === 'VEGAN'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {dish.foodType === 'NON_VEG' ? 'Non-Veg' : dish.foodType}
                </span>

                {dish.isChefPick && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#92400e] border border-[#ecd7b7] shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#d97706]" />
                    <span>Chef's Pick</span>
                  </span>
                )}
              </div>

              {/* Title & Price on hero */}
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="text-[11px] uppercase tracking-widest text-[#fde68a] font-semibold">
                  Artisanal Dish Story
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mt-0.5 leading-snug">
                  {dish.name}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm font-semibold text-[#fef3c7]">
                  <span className="text-lg font-bold text-white">₹{dish.price.toFixed(2)}</span>
                  <span>•</span>
                  <span className="text-xs text-[#e8ded1] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>{dish.preparationTime || 15} mins prep</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Story Details */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-[#786c5e] uppercase tracking-wider mb-1.5">
                  Culinary Profile
                </h4>
                <p className="text-sm text-[#211d1a] leading-relaxed font-serif">
                  {dish.description}
                </p>
              </div>

              {/* Chef's Note if available */}
              {(dish.chefNote || dish.featured) && (
                <div className="bg-[#fef7ee] border-l-4 border-[#d97706] p-4 rounded-r-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#b45309] uppercase tracking-wider mb-1">
                    <ChefHat className="w-4 h-4 text-[#d97706]" />
                    <span>Master Chef's Note</span>
                  </div>
                  <p className="text-xs text-[#5c5246] italic leading-relaxed">
                    {dish.chefNote ||
                      'Slow-simmered in small copper vessels to infuse deep caramel notes and toasted whole spices.'}
                  </p>
                </div>
              )}

              {/* Heritage Origin & Cooking Style */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#faf6ee] rounded-2xl border border-[#ecd7b7]/60">
                  <div className="flex items-center gap-1.5 text-xs text-[#786c5e] mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#d97706]" />
                    <span className="font-semibold">Regional Heritage</span>
                  </div>
                  <p className="text-xs font-medium text-[#211d1a]">
                    {dish.origin || 'Awadh & Northern Frontier'}
                  </p>
                </div>

                <div className="p-3 bg-[#faf6ee] rounded-2xl border border-[#ecd7b7]/60">
                  <div className="flex items-center gap-1.5 text-xs text-[#786c5e] mb-1">
                    <Utensils className="w-3.5 h-3.5 text-[#d97706]" />
                    <span className="font-semibold">Cooking Craft</span>
                  </div>
                  <p className="text-xs font-medium text-[#211d1a]">
                    {dish.cookingStyle || 'Dum Pukht & Clay Sigri'}
                  </p>
                </div>
              </div>

              {/* Ingredients & Allergens */}
              <div>
                <h4 className="text-xs font-bold text-[#786c5e] uppercase tracking-wider mb-2">
                  Ingredients & Dietary Information
                </h4>
                {dish.ingredients && dish.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {dish.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white border border-[#ecd7b7] rounded-lg text-xs text-[#5c5246]"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                )}

                {dish.allergens && dish.allergens.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[#92400e] bg-[#fef3c7]/60 p-2.5 rounded-xl border border-[#ecd7b7]/60">
                    <ShieldAlert className="w-4 h-4 text-[#d97706] shrink-0" />
                    <span>Contains: {dish.allergens.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Ask About This Dish */}
              <div>
                <h4 className="text-xs font-bold text-[#211d1a] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#d97706]" />
                  <span>Ask About This Dish</span>
                </h4>
                <div className="space-y-2">
                  {questionsToUse.map((q, idx) => {
                    const isExpanded = selectedQuestion === idx;
                    return (
                      <div
                        key={idx}
                        className="border border-[#ecd7b7]/80 rounded-2xl overflow-hidden bg-white"
                      >
                        <button
                          onClick={() => setSelectedQuestion(isExpanded ? null : idx)}
                          className="w-full p-3.5 text-left text-xs font-semibold text-[#211d1a] flex items-center justify-between hover:bg-[#faf6ee] transition-colors"
                        >
                          <span>{q.question}</span>
                          <span className="text-[#d97706] font-bold text-sm">
                            {isExpanded ? '−' : '+'}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="p-3.5 pt-0 text-xs text-[#5c5246] bg-[#fefbf7] border-t border-[#ecd7b7]/40 leading-relaxed">
                            {q.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 border-t border-[#ecd7b7]/60 bg-[#fffdfa] flex items-center gap-3">
              <button
                onClick={() => {
                  onAddToIdeas(dish);
                }}
                className="flex-1 py-3 px-4 bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#ecd7b7] transition-colors"
              >
                <Heart className="w-4 h-4 text-[#d97706]" />
                <span>Save to Table Ideas</span>
              </button>

              <button
                onClick={() => {
                  onAddToCart(dish);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Round Order</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
