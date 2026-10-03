import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'accent' | 'flat';
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  isHoverable = false,
  className,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-[#e9e3dc] shadow-[0_1px_2px_rgba(43,31,24,0.04),0_3px_10px_rgba(43,31,24,0.03)]',
    glass: 'bg-white/90 backdrop-blur-md border border-[#e9e3dc] shadow-[0_8px_28px_rgba(43,31,24,0.08)]',
    accent: 'bg-gradient-to-br from-white to-[#fff4ef] border border-[#ffc9b5] shadow-[0_5px_14px_rgba(217,98,54,0.12)]',
    flat: 'bg-[#fbf9f6] border border-[#e9e3dc]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl transition-all duration-200 overflow-hidden text-[#211d1a]',
          variants[variant],
          isHoverable && 'hover:border-[#d7cec4] hover:shadow-[0_8px_28px_rgba(43,31,24,0.08)] hover:-translate-y-0.5 cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={twMerge(clsx('p-5 border-b border-[#e9e3dc]', className))} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={twMerge(clsx('p-5', className))} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={twMerge(clsx('p-5 bg-[#fbf9f6] border-t border-[#e9e3dc]', className))}
    {...props}
  >
    {children}
  </div>
);
