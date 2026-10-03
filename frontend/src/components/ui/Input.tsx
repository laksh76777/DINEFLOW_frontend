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
          <label htmlFor={inputId} className="text-xs font-semibold text-stone-300 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-stone-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-stone-900 border text-stone-100 placeholder-stone-500 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 outline-none focus:ring-2',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-stone-800 focus:border-orange-500/60 focus:ring-orange-500/20',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-stone-400 pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
