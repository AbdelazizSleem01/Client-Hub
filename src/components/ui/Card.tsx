import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs transition-all text-slate-900 dark:text-slate-100',
        hoverable && 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
};
