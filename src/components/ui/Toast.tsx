import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, ToastItem } from '../../stores/useToastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#23865b] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#c54e4a] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#bf7a13] shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-[#3974b9] shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return 'border-[#a5d8be] bg-white text-[#211d1a] shadow-[0_8px_28px_rgba(35,134,91,0.12)]';
      case 'error':
        return 'border-[#fca5a5] bg-white text-[#211d1a] shadow-[0_8px_28px_rgba(197,78,74,0.12)]';
      case 'warning':
        return 'border-[#fed7aa] bg-white text-[#211d1a] shadow-[0_8px_28px_rgba(191,122,19,0.12)]';
      case 'info':
      default:
        return 'border-[#bfdbfe] bg-white text-[#211d1a] shadow-[0_8px_28px_rgba(57,116,185,0.12)]';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4 sm:p-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md ${getBorderColor(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#211d1a] tracking-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-[#7b726a] mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#7b726a] hover:text-[#211d1a] transition-colors p-1 -mr-1 -mt-1 rounded-md hover:bg-[#f5f1ec]"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
