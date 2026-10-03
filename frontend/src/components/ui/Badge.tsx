import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'brand'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'veg'
    | 'non-veg'
    | 'vegan'
    | 'station';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}) => {
  const variants = {
    brand: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    neutral: 'bg-stone-800 text-stone-300 border-stone-700',
    veg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
    'non-veg': 'bg-rose-950/80 text-rose-300 border-rose-600/50',
    vegan: 'bg-teal-950/80 text-teal-300 border-teal-600/50',
    station: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const dotColors = {
    brand: 'bg-orange-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    neutral: 'bg-stone-400',
    veg: 'bg-emerald-400',
    'non-veg': 'bg-rose-400',
    vegan: 'bg-teal-400',
    station: 'bg-indigo-400',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-semibold select-none',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      {children}
    </span>
  );
};
