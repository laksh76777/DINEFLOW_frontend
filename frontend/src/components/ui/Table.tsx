import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="w-full overflow-x-auto rounded-xl border border-[#e9e3dc] bg-white shadow-[0_1px_2px_rgba(43,31,24,0.04)]">
    <table className={twMerge(clsx('w-full text-left text-sm text-[#211d1a]', className))} {...props}>
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
      clsx('bg-[#fbf9f6] text-xs font-bold uppercase tracking-wider text-[#7b726a] border-b border-[#e9e3dc]', className)
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
  <tbody className={twMerge(clsx('divide-y divide-[#e9e3dc]', className))} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr
    className={twMerge(clsx('hover:bg-[#fbf9f6] transition-colors', className))}
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
  <th className={twMerge(clsx('px-4 py-3.5 font-bold text-[#49423c]', className))} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={twMerge(clsx('px-4 py-3.5 align-middle text-[#211d1a]', className))} {...props}>
    {children}
  </td>
);
