import React from 'react';
import { ClientStatus, ProjectStatus, PaymentStatus } from '@/types';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'slate' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className,
  dot = false,
}) => {
  const variantStyles = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    blue: 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60',
    purple: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
    rose: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
  };

  const dotColors = {
    slate: 'bg-slate-400',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-sky-500',
    purple: 'bg-indigo-500',
    rose: 'bg-rose-500',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs leading-none select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};

// Client Status Badge
export const ClientStatusBadge: React.FC<{ status: ClientStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="emerald" size={size} dot>
          Active
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="blue" size={size} dot>
          Completed
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="amber" size={size} dot>
          Pending
        </Badge>
      );
    case 'inactive':
      return (
        <Badge variant="slate" size={size} dot>
          Inactive
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};

// Project Status Badge
export const ProjectStatusBadge: React.FC<{ status: ProjectStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'in_development':
      return (
        <Badge variant="purple" size={size} dot>
          In Development
        </Badge>
      );
    case 'live':
      return (
        <Badge variant="emerald" size={size} dot>
          Live
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="blue" size={size} dot>
          Completed
        </Badge>
      );
    case 'maintenance':
      return (
        <Badge variant="amber" size={size} dot>
          Maintenance
        </Badge>
      );
    case 'paused':
      return (
        <Badge variant="slate" size={size} dot>
          Paused
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};

// Payment Status Badge
export const PaymentStatusBadge: React.FC<{ status: PaymentStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'paid':
      return (
        <Badge variant="emerald" size={size} dot>
          Paid
        </Badge>
      );
    case 'partially_paid':
      return (
        <Badge variant="amber" size={size} dot>
          Partially Paid
        </Badge>
      );
    case 'unpaid':
      return (
        <Badge variant="rose" size={size} dot>
          Unpaid
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};
