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
          'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-stone-800/80 bg-stone-900/30',
          className
        )
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4 shadow-inner">
        {icon || <UtensilsCrossed className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-stone-100 mb-1">{title}</h3>
      <p className="text-xs text-stone-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
