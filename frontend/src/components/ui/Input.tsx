import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-[#49423c] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#7b726a] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-white border text-[#211d1a] placeholder-[#a89d91] rounded-xl px-4 py-2.5 text-sm transition-all duration-200 outline-none focus:ring-2 shadow-sm',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error
                  ? 'border-[#c54e4a] focus:border-[#c54e4a] focus:ring-[#c54e4a]/20'
                  : 'border-[#e9e3dc] focus:border-[#d96236] focus:ring-[#d96236]/20',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#7b726a] pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
