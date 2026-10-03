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
          <label htmlFor={selectId} className="text-xs font-bold text-[#49423c] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-white border text-[#211d1a] rounded-xl px-4 py-2.5 text-sm appearance-none transition-all duration-200 outline-none focus:ring-2 pr-10 cursor-pointer shadow-sm',
                error
                  ? 'border-[#c54e4a] focus:border-[#c54e4a] focus:ring-[#c54e4a]/20'
                  : 'border-[#e9e3dc] focus:border-[#d96236] focus:ring-[#d96236]/20',
                className
              )
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 text-[#7b726a] pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-[#c54e4a] font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-[#7b726a]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
