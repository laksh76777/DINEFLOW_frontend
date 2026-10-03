import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="w-full overflow-x-auto rounded-xl border border-stone-800 bg-stone-900/60 shadow-lg">
    <table className={twMerge(clsx('w-full text-left text-sm text-stone-200', className))} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead
    className={twMerge(
      clsx('bg-stone-950/80 text-xs font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-800', className)
    )}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={twMerge(clsx('divide-y divide-stone-800/60', className))} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr
    className={twMerge(clsx('hover:bg-stone-800/40 transition-colors', className))}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={twMerge(clsx('px-4 py-3.5 font-semibold text-stone-300', className))} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={twMerge(clsx('px-4 py-3.5 align-middle', className))} {...props}>
    {children}
  </td>
);
