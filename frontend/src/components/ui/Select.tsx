import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-stone-300 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-stone-900 border text-stone-100 rounded-xl px-4 py-2.5 text-sm appearance-none transition-all duration-200 outline-none focus:ring-2 pr-10 cursor-pointer',
                error
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-stone-800 focus:border-orange-500/60 focus:ring-orange-500/20',
                className
              )
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 text-stone-400 pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-rose-400">{error}</p>
        ) : (
          helperText && <p className="text-xs text-stone-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
