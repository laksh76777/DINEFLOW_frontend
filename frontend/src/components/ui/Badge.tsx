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
    brand: 'bg-[#fff4ef] text-[#be4d27] border-[#ffc9b5]',
    success: 'bg-[#e8f6ef] text-[#23865b] border-[#a5d8be]',
    warning: 'bg-[#fff4dc] text-[#bf7a13] border-[#fed7aa]',
    danger: 'bg-[#fde8e8] text-[#c54e4a] border-[#fca5a5]',
    neutral: 'bg-[#f5f1ec] text-[#49423c] border-[#e9e3dc]',
    veg: 'bg-[#e8f6ef] text-[#23865b] border-[#23865b]/40',
    'non-veg': 'bg-[#fde8e8] text-[#c54e4a] border-[#c54e4a]/40',
    vegan: 'bg-[#eaf2fb] text-[#3974b9] border-[#3974b9]/40',
    station: 'bg-[#fdf2f8] text-[#9d174d] border-[#fbcfe8]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
  };

  const dotColors = {
    brand: 'bg-[#d96236]',
    success: 'bg-[#23865b]',
    warning: 'bg-[#bf7a13]',
    danger: 'bg-[#c54e4a]',
    neutral: 'bg-[#7b726a]',
    veg: 'bg-[#23865b]',
    'non-veg': 'bg-[#c54e4a]',
    vegan: 'bg-[#3974b9]',
    station: 'bg-[#9d174d]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase select-none',
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
