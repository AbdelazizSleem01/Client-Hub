import { PaymentStatus } from '@/types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number | string | undefined | null, currency: string = '$'): string {
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(numeric)) return `${currency}0.00`;
  return `${currency}${numeric.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function calculateRemaining(total: number, paid: number): number {
  const safeTotal = Math.max(0, total || 0);
  const safePaid = Math.max(0, paid || 0);
  return Math.max(0, safeTotal - safePaid);
}

export function determinePaymentStatus(total: number, paid: number): PaymentStatus {
  const safeTotal = Math.max(0, total || 0);
  const safePaid = Math.max(0, paid || 0);

  if (safePaid >= safeTotal && safeTotal > 0) {
    return 'paid';
  }
  if (safePaid > 0) {
    return 'partially_paid';
  }
  return 'unpaid';
}

export function cleanWhatsAppNumber(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

export interface DeadlineInfo {
  label: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  isDueToday: boolean;
  daysRemaining: number;
  formatted: string;
}

export function getDeadlineInfo(deadlineDate?: string): DeadlineInfo | null {
  if (!deadlineDate) return null;
  const target = new Date(deadlineDate);
  if (isNaN(target.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const formatted = due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: overdueDays === 1 ? 'Overdue 1 day' : `Overdue ${overdueDays} days`,
      isOverdue: true,
      isDueSoon: false,
      isDueToday: false,
      daysRemaining: diffDays,
      formatted,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Due today',
      isOverdue: false,
      isDueSoon: true,
      isDueToday: true,
      daysRemaining: 0,
      formatted,
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Due tomorrow',
      isOverdue: false,
      isDueSoon: true,
      isDueToday: false,
      daysRemaining: 1,
      formatted,
    };
  }

  if (diffDays <= 3) {
    return {
      label: `Due in ${diffDays} days`,
      isOverdue: false,
      isDueSoon: true,
      isDueToday: false,
      daysRemaining: diffDays,
      formatted,
    };
  }

  return {
    label: `Due ${formatted}`,
    isOverdue: false,
    isDueSoon: false,
    isDueToday: false,
    daysRemaining: diffDays,
    formatted,
  };
}
