import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  className,
  ...props
}) => {
  const variants = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse bg-gradient-to-r from-stone-800 via-stone-700/60 to-stone-800 bg-[length:200%_100%]',
          variants[variant],
          className
        )
      )}
      {...props}
    />
  );
};
