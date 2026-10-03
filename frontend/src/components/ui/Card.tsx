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
    default: 'bg-stone-900/90 border border-stone-800/80 shadow-xl shadow-black/20',
    glass: 'glass-panel shadow-2xl shadow-black/40',
    accent: 'bg-gradient-to-br from-stone-900 to-stone-950 border border-orange-500/20 shadow-glow',
    flat: 'bg-stone-900 border border-stone-800',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl transition-all duration-200 overflow-hidden',
          variants[variant],
          isHoverable && 'hover:border-stone-700 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer',
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
  <div className={twMerge(clsx('p-5 border-b border-stone-800/60', className))} {...props}>
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
    className={twMerge(clsx('p-5 bg-stone-950/40 border-t border-stone-800/60', className))}
    {...props}
  >
    {children}
  </div>
);
