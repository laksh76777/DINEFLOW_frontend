import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UtensilsCrossed } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[#e9e3dc] bg-white shadow-sm',
          className
        )
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#fff4ef] border border-[#ffc9b5] text-[#d96236] flex items-center justify-center mb-4 shadow-sm">
        {icon || <UtensilsCrossed className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-[#211d1a] mb-1">{title}</h3>
      <p className="text-xs text-[#7b726a] max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
